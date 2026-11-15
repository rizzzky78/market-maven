#!/usr/bin/env bash
#
# market-maven deploy: pull, build and run the app on this Linux host with docker compose.
#
# Usage:
#   bash deploy.sh [command] [options] [<commit-ish>|<tag>]
#
# Commands:
#   deploy (default)   pull, build, migrate, verify a candidate, swap, health gate, prune
#   rollback [tag]     re-release an image already in the store (default: the newest
#                      one older than the live release), no rebuild
#   migrate            prisma migrate deploy for the live release
#   status             live release, container health, retained images, build budget
#   logs               follow the web container logs
#   help               show this help
#
# Build modes (--mode, MODE):
#   host    (default) bun install and next build run on this host, then a COPY-only
#           image is built from the assembled `.deploy/` bundle. Fast image builds and
#           reusable incremental caches; the host must be Linux and match the runtime
#           image's architecture because native binaries are traced into the bundle.
#   docker  everything compiles inside BuildKit (Dockerfile `web` and `migrate`
#           targets). The host needs only git and docker.
#
# Release flow:
#   - The new image first boots as a port-less candidate beside the live container.
#     The live container is touched only once the candidate reports healthy.
#   - The swap is `compose up -d`; if the swapped-in container fails the health gate
#     the previous image is restored automatically.
#   - Host mode merges the previous release's .next/static into the new bundle
#     (chunks are content-hashed) so tabs still on the old build keep loading their
#     lazy chunks instead of hitting ChunkLoadError.
#   - Steps whose inputs did not change are skipped: bun install (lockfile and
#     package.json), next build (commit, uncommitted changes, deps, NEXT_PUBLIC_*).
#
# Build resources:
#   Unset, the budget is sized from this host at build time: BUILD_RESERVE_PCT
#   (default 20) of the cores and of the available memory stay untouched, the Node
#   heap gets 75% of the memory budget and Next build workers are bounded by both
#   cores and memory (one per 1.5 GB). Any value can be pinned by flag or env var;
#   flags win over env vars, env vars over auto-sizing.
#   Host mode enforces the budget with a systemd cgroup scope (hard memory and CPU
#   caps) when available, else CPU affinity (taskset) plus the heap cap, always at
#   low nice/ionice priority. Docker mode runs BuildKit in a capped
#   docker-container builder whose cache survives cap changes.
#
# Revision options:
#   --sha <commit>        deploy this commit-ish detached (also accepted bare)
#   --branch <name>       check out and fast-forward this branch first      BRANCH
#   --no-pull             deploy the working tree as-is
#   --allow-dirty         permit uncommitted changes (tag gets -dirty.<hash>) ALLOW_DIRTY=1
#
# Build options:
#   --mode host|docker    build mode (default host)                        MODE
#   --no-install          skip bun install (host mode)
#   --reinstall           force bun install even if the lockfile is unchanged
#   --rebuild             force the build even if its inputs are unchanged
#   --cpus <n>            build CPU cores                                    BUILD_CPUS
#   --mem <size>          build memory cap, e.g. 3072, 3072m, 3g, 2.5g       BUILD_MEM
#   --heap <mb>           Node heap for next build                           NODE_HEAP_MB
#   --workers <n>         Next build workers                                 NEXT_BUILD_CPUS
#   --reserve <pct>       share of the host kept free when auto-sizing       BUILD_RESERVE_PCT
#   --min                 minimum footprint preset: 1 CPU, 3g, heap 2560, 1 worker
#                         (explicit values still win)
#   --no-limit            no caps at all (host: priority only; docker: default builder)
#
# Runtime options:
#   --env-file <path>     runtime env file (default .env)                    ENV_FILE
#   --port <n>            published host port (default 3000)                 APP_PORT
#   --app-cpus <n>        CPU cap of the running container (default none)    APP_CPUS
#   --app-mem <size>      memory cap of the running container (default none) APP_MEM
#   --no-migrate          skip prisma migrate deploy
#   --skip-health         skip the candidate check and the post-swap health gate
#   --health-timeout <s>  seconds to wait for healthy (default 180)          HEALTH_TIMEOUT
#   --keep <n>            image tags retained for rollback (default 5)       KEEP_IMAGES
#   --no-prune            keep every image
#   --prune-cache         also drop build cache unused for 7+ days
#   --follow              follow the web logs after a successful release
#   --no-color            plain output (also honours NO_COLOR)
#   -h, --help            show this help
#
# Other environment:
#   MIGRATE_DATABASE_URL  host mode only: URL used by migrations run on the host when
#                         DATABASE_URL points at host.docker.internal
#   BUN_INSTALL_CACHE_DIR package cache outside the repo (default ~/.bun/install/cache)
#
# Every option also accepts the --name=value form.

set -Eeuo pipefail

IMAGE_REPO="market-maven"
SERVICE="web"
CANDIDATE_NAME="market-maven-candidate"
BUILDER_NAME="market-maven-builder"
STAGE_DIR=".deploy"
STATIC_STASH=".deploy-static"
LOCK_FILE=".deploy.lock"
IMAGE_TITLE_LABEL="org.opencontainers.image.title=$IMAGE_REPO"

MODE="${MODE:-host}"
ENV_FILE="${ENV_FILE:-.env}"
BRANCH="${BRANCH:-}"
ALLOW_DIRTY="${ALLOW_DIRTY:-0}"
APP_PORT="${APP_PORT:-3000}"
APP_CPUS="${APP_CPUS:-}"
APP_MEM="${APP_MEM:-}"
KEEP_IMAGES="${KEEP_IMAGES:-5}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-180}"
BUILD_CPUS="${BUILD_CPUS:-}"
BUILD_MEM="${BUILD_MEM:-}"
NODE_HEAP_MB="${NODE_HEAP_MB:-}"
NEXT_BUILD_CPUS="${NEXT_BUILD_CPUS:-}"
BUILD_RESERVE_PCT="${BUILD_RESERVE_PCT:-20}"

COMMAND="deploy"
TARGET_REF=""
ROLLBACK_TAG=""
DO_PULL=1
DO_INSTALL=1
FORCE_INSTALL=0
FORCE_BUILD=0
DO_MIGRATE=1
DO_HEALTH=1
DO_PRUNE=1
DO_PRUNE_CACHE=0
DO_FOLLOW=0
BUILD_LIMIT=1
PRESET_MIN=0
USE_COLOR=auto

usage() {
  awk 'NR == 1 { next } /^#/ { sub(/^# ?/, ""); print; next } { exit }' "$0"
}

# Accept `--name=value` everywhere by splitting it into `--name value`.
expanded=()
for arg in "$@"; do
  if [[ "$arg" == --*=* ]]; then expanded+=("${arg%%=*}" "${arg#*=}"); else expanded+=("$arg"); fi
done
set -- ${expanded[@]+"${expanded[@]}"}

case "${1:-}" in
  deploy|rollback|migrate|status|logs) COMMAND="$1"; shift ;;
  help) usage; exit 0 ;;
esac

while [[ $# -gt 0 ]]; do
  case "$1" in
    --sha|--commit) TARGET_REF="${2:?--sha needs a commit-ish}"; shift ;;
    --branch) BRANCH="${2:?--branch needs a name}"; shift ;;
    --no-pull) DO_PULL=0 ;;
    --allow-dirty) ALLOW_DIRTY=1 ;;
    --mode) MODE="${2:?--mode needs host or docker}"; shift ;;
    --no-install) DO_INSTALL=0 ;;
    --reinstall) FORCE_INSTALL=1 ;;
    --rebuild) FORCE_BUILD=1 ;;
    --cpus) BUILD_CPUS="${2:?--cpus needs a number}"; shift ;;
    --mem) BUILD_MEM="${2:?--mem needs a size}"; shift ;;
    --heap) NODE_HEAP_MB="${2:?--heap needs megabytes}"; shift ;;
    --workers) NEXT_BUILD_CPUS="${2:?--workers needs a number}"; shift ;;
    --reserve) BUILD_RESERVE_PCT="${2:?--reserve needs a percentage}"; shift ;;
    --min) PRESET_MIN=1 ;;
    --no-limit) BUILD_LIMIT=0 ;;
    --env-file) ENV_FILE="${2:?--env-file needs a path}"; shift ;;
    --port) APP_PORT="${2:?--port needs a number}"; shift ;;
    --app-cpus) APP_CPUS="${2:?--app-cpus needs a number}"; shift ;;
    --app-mem) APP_MEM="${2:?--app-mem needs a size}"; shift ;;
    --no-migrate) DO_MIGRATE=0 ;;
    --skip-health) DO_HEALTH=0 ;;
    --health-timeout) HEALTH_TIMEOUT="${2:?--health-timeout needs seconds}"; shift ;;
    --keep) KEEP_IMAGES="${2:?--keep needs a number}"; shift ;;
    --no-prune) DO_PRUNE=0 ;;
    --prune-cache) DO_PRUNE_CACHE=1 ;;
    --follow) DO_FOLLOW=1 ;;
    --no-color) USE_COLOR=0 ;;
    -h|--help) usage; exit 0 ;;
    -*) echo "unknown option: $1 (try --help)" >&2; exit 2 ;;
    *)
      if [[ "$COMMAND" == rollback ]]; then
        [[ -z "$ROLLBACK_TAG" ]] || { echo "more than one tag given: $1" >&2; exit 2; }
        ROLLBACK_TAG="$1"
      else
        [[ -z "$TARGET_REF" ]] || { echo "more than one revision given: $1" >&2; exit 2; }
        TARGET_REF="$1"
      fi
      ;;
  esac
  shift
done

if (( PRESET_MIN )); then
  : "${BUILD_CPUS:=1}" "${BUILD_MEM:=3g}" "${NODE_HEAP_MB:=2560}" "${NEXT_BUILD_CPUS:=1}"
fi

# Converts 3072, 3072m, 3g, 2.5g (optionally with a trailing b) to whole megabytes.
to_mb() {
  awk -v v="$1" 'BEGIN {
    v = tolower(v); sub(/b$/, "", v)
    if (v !~ /^[0-9]+(\.[0-9]+)?[gm]?$/) exit 1
    u = substr(v, length(v)); n = v
    if (u == "g") n = substr(v, 1, length(v) - 1) * 1024
    else if (u == "m") n = substr(v, 1, length(v) - 1) + 0
    printf "%d", n
  }'
}

bad_arg() { echo "$1" >&2; exit 2; }
is_uint() { [[ "$1" =~ ^[0-9]+$ ]]; }

[[ "$MODE" == host || "$MODE" == docker ]] || bad_arg "--mode expects host or docker, got: $MODE"
is_uint "$KEEP_IMAGES" || bad_arg "--keep expects a number, got: $KEEP_IMAGES"
is_uint "$HEALTH_TIMEOUT" || bad_arg "--health-timeout expects seconds, got: $HEALTH_TIMEOUT"
is_uint "$APP_PORT" || bad_arg "--port expects a number, got: $APP_PORT"
is_uint "$BUILD_RESERVE_PCT" && (( BUILD_RESERVE_PCT < 100 )) || bad_arg "--reserve expects 0-99, got: $BUILD_RESERVE_PCT"
if [[ -n "$BUILD_CPUS" ]]; then is_uint "$BUILD_CPUS" && (( BUILD_CPUS > 0 )) || bad_arg "--cpus expects a positive number, got: $BUILD_CPUS"; fi
if [[ -n "$NODE_HEAP_MB" ]]; then is_uint "$NODE_HEAP_MB" && (( NODE_HEAP_MB >= 512 )) || bad_arg "--heap expects megabytes >= 512, got: $NODE_HEAP_MB"; fi
if [[ -n "$NEXT_BUILD_CPUS" ]]; then is_uint "$NEXT_BUILD_CPUS" && (( NEXT_BUILD_CPUS > 0 )) || bad_arg "--workers expects a positive number, got: $NEXT_BUILD_CPUS"; fi
BUILD_MEM_MB=""
if [[ -n "$BUILD_MEM" ]]; then BUILD_MEM_MB="$(to_mb "$BUILD_MEM")" || bad_arg "--mem expects a size like 3072, 3g or 2.5g, got: $BUILD_MEM"; fi
APP_MEM_MB=0
if [[ -n "$APP_MEM" ]]; then APP_MEM_MB="$(to_mb "$APP_MEM")" || bad_arg "--app-mem expects a size like 1g, got: $APP_MEM"; fi
if [[ -n "$APP_CPUS" ]]; then [[ "$APP_CPUS" =~ ^[0-9]+(\.[0-9]+)?$ ]] || bad_arg "--app-cpus expects a number, got: $APP_CPUS"; fi

# Read by docker-compose.yml.
export ENV_FILE APP_PORT
APP_CPUS="${APP_CPUS:-0}"
if (( APP_MEM_MB > 0 )); then APP_MEM="${APP_MEM_MB}m"; else APP_MEM=0; fi
export APP_CPUS APP_MEM

# Presentation: colour degrades to plain output on a pipe, NO_COLOR or --no-color;
# box glyphs fall back to ASCII on a non-UTF-8 locale.
if [[ "$USE_COLOR" == auto ]]; then
  if [[ -t 1 && -z "${NO_COLOR:-}" && "${TERM:-dumb}" != "dumb" ]]; then USE_COLOR=1; else USE_COLOR=0; fi
fi
if (( USE_COLOR )); then
  BOLD=$'\033[1m'; DIM=$'\033[2m'; RESET=$'\033[0m'
  RED=$'\033[31m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'
  BLUE=$'\033[34m'; CYAN=$'\033[36m'; GREY=$'\033[90m'
else
  BOLD=""; DIM=""; RESET=""; RED=""; GREEN=""; YELLOW=""; BLUE=""; CYAN=""; GREY=""
fi

WIDTH=72
if [[ -t 1 ]]; then
  TERM_COLS="$( { tput cols; } 2>/dev/null || echo 0 )"
  if [[ "$TERM_COLS" =~ ^[0-9]+$ ]] && (( TERM_COLS > 40 && TERM_COLS < WIDTH )); then WIDTH="$TERM_COLS"; fi
fi

GLYPH_OK="✓"; GLYPH_FAIL="✗"; GLYPH_WARN="!"; GLYPH_STEP="▸"; GLYPH_DOT="·"; GLYPH_BAR="█"
BOX_TL="╭"; BOX_TR="╮"; BOX_BL="╰"; BOX_BR="╯"; BOX_H="─"; BOX_V="│"
case "${LC_ALL:-}${LANG:-}" in
  *[Uu][Tt][Ff]*) ;;
  *) GLYPH_OK="ok"; GLYPH_FAIL="x"; GLYPH_STEP=">"; GLYPH_DOT="-"; GLYPH_BAR="#"
     BOX_TL="+"; BOX_TR="+"; BOX_BL="+"; BOX_BR="+"; BOX_H="-"; BOX_V="|" ;;
esac

TOTAL_STEPS=0
STEP_NO=0
CURRENT_STEP="startup"
DEPLOY_START_MS=0
STEP_OPEN=0
STEP_T0=0
STEP_NAMES=()
STEP_DURS=()
STEP_STATES=()
SWAPPED=0

now_ms() { date +%s%3N; }

fmt_ms() {
  local ms="$1"
  if (( ms < 1000 )); then printf '%dms' "$ms"
  elif (( ms < 60000 )); then printf '%d.%01ds' $(( ms / 1000 )) $(( (ms % 1000) / 100 ))
  else printf '%dm %02ds' $(( ms / 60000 )) $(( (ms % 60000) / 1000 ))
  fi
}

repeat() {
  local n="$1" c="$2" out=""
  if (( n < 0 )); then n=0; fi
  while (( n-- > 0 )); do out+="$c"; done
  printf '%s' "$out"
}

rule() { printf '%s%s%s\n' "$GREY" "$(repeat "$WIDTH" "$BOX_H")" "$RESET"; }

# Padding uses ${#text} (characters, not bytes) so multi-byte glyphs keep the border aligned.
box_line() {
  local colour="$1" style="$2" text="$3" room=$(( WIDTH - 3 ))
  if (( ${#text} > room )); then text="${text:0:$(( room - 3 ))}..."; fi
  printf '%s%s%s %s%s%s%s%s%s%s\n' "$colour" "$BOX_V" "$RESET" "$style" "$text" "$RESET" \
    "$(repeat $(( room - ${#text} )) ' ')" "$colour" "$BOX_V" "$RESET"
}

box_edge() { printf '%s%s%s%s%s\n' "$1" "$2" "$(repeat $(( WIDTH - 2 )) "$BOX_H")" "$3" "$RESET"; }

banner() {
  printf '\n'
  box_edge "$BLUE" "$BOX_TL" "$BOX_TR"
  box_line "$BLUE" "$BOLD" "$1"
  box_line "$BLUE" "$DIM" "$2"
  box_edge "$BLUE" "$BOX_BL" "$BOX_BR"
}

# Closes the open step with an outcome and duration footer and records it in the
# timing ledger. A no-op when no step is open.
end_step() {
  local state="${1:-done}"
  if (( ! STEP_OPEN )); then return 0; fi
  STEP_OPEN=0
  local dur=$(( $(now_ms) - STEP_T0 )) colour="$GREY"
  STEP_NAMES+=("$CURRENT_STEP"); STEP_DURS+=("$dur"); STEP_STATES+=("$state")
  if [[ "$state" == failed ]]; then colour="$RED"; fi
  local text="$state $GLYPH_DOT $(fmt_ms "$dur")"
  printf '     %s%s %s%s\n' "$colour" "$(repeat $(( WIDTH - 6 - ${#text} )) "$BOX_H")" "$text" "$RESET"
}

step() {
  end_step
  CURRENT_STEP="$1"
  STEP_NO=$(( STEP_NO + 1 ))
  STEP_OPEN=1
  STEP_T0="$(now_ms)"
  local num clock title="$1"
  num="$(printf '%02d/%02d' "$STEP_NO" "$TOTAL_STEPS")"
  clock="$(date +%H:%M:%S)"
  local room=$(( WIDTH - 4 - ${#num} - ${#clock} - 2 ))
  if (( ${#title} > room )); then title="${title:0:$(( room - 3 ))}..."; fi
  printf '\n%s%s%s %s%s%s  %s%s%s%s %s%s%s\n' "$CYAN" "$GLYPH_STEP" "$RESET" "$GREY" "$num" "$RESET" \
    "$BOLD" "$title" "$RESET" "$(repeat $(( room - ${#title} )) ' ')" "$DIM" "$clock" "$RESET"
}

skip_step() {
  end_step
  CURRENT_STEP="$1"
  STEP_NO=$(( STEP_NO + 1 ))
  STEP_NAMES+=("$1"); STEP_DURS+=(0); STEP_STATES+=("skipped")
  printf '\n%s%s %02d/%02d  %s, skipped (%s)%s\n' "$GREY" "$GLYPH_DOT" "$STEP_NO" "$TOTAL_STEPS" "$1" "$2" "$RESET"
}

timing_table() {
  local total=$(( $(now_ms) - DEPLOY_START_MS )) bar_width=14 max=1 i
  local name_width=$(( WIDTH - 5 - 4 - 9 - 2 - bar_width ))
  for i in "${!STEP_DURS[@]}"; do
    if (( STEP_DURS[i] > max )); then max="${STEP_DURS[i]}"; fi
  done
  printf '\n     %sStep timings%s\n' "$BOLD" "$RESET"
  printf '     %s%s%s\n' "$GREY" "$(repeat $(( WIDTH - 5 )) "$BOX_H")" "$RESET"
  for i in "${!STEP_NAMES[@]}"; do
    local name="${STEP_NAMES[i]}" dur="${STEP_DURS[i]}" state="${STEP_STATES[i]}" time colour name_colour=""
    local bar_n=$(( dur * bar_width / max ))
    if (( dur > 0 && bar_n == 0 )); then bar_n=1; fi
    if (( ${#name} > name_width )); then name="${name:0:$(( name_width - 3 ))}..."; fi
    case "$state" in
      skipped) time="skipped"; colour="$GREY"; name_colour="$GREY" ;;
      failed)  time="$(fmt_ms "$dur")"; colour="$RED" ;;
      *)       time="$(fmt_ms "$dur")"; colour="$CYAN" ;;
    esac
    printf '     %s%02d%s  %s%-*s%s %8s  %s%s%s\n' "$GREY" $(( i + 1 )) "$RESET" \
      "$name_colour" "$name_width" "$name" "$RESET" "$time" "$colour" "$(repeat "$bar_n" "$GLYPH_BAR")" "$RESET"
  done
  printf '     %s%s%s\n' "$GREY" "$(repeat $(( WIDTH - 5 )) "$BOX_H")" "$RESET"
  printf '         %s%-*s%s %8s' "$BOLD" "$name_width" "total" "$RESET" \
    "$(printf '%d.%01ds' $(( total / 1000 )) $(( (total % 1000) / 100 )))"
  if (( total >= 60000 )); then printf '  %s(%s)%s' "$DIM" "$(fmt_ms "$total")" "$RESET"; fi
  printf '\n'
}

info()    { printf '     %s%-11s%s %s\n' "$DIM" "$1" "$RESET" "$2"; }
subhead() { printf '\n     %s%s%s\n' "$BOLD" "$1" "$RESET"; }
note()    { printf '     %s%s%s\n' "$DIM" "$*" "$RESET"; }
ok()      { printf '     %s%s%s %s\n' "$GREEN" "$GLYPH_OK" "$RESET" "$*"; }
warn()    { printf '     %s%s %s%s\n' "$YELLOW" "$GLYPH_WARN" "$*" "$RESET"; }

die() {
  trap - ERR
  end_step failed
  printf '\n%s%s%s %s%s failed%s\n' "$RED" "$GLYPH_FAIL" "$RESET" "$BOLD" "$CURRENT_STEP" "$RESET"
  local line
  while IFS= read -r line; do printf '     %s%s%s\n' "$RED" "$line" "$RESET"; done <<< "$*"
  if (( DEPLOY_START_MS > 0 )); then timing_table; fi
  docker rm -f "$CANDIDATE_NAME" >/dev/null 2>&1 || true
  if [[ "$MODE" == docker && "$BUILD_LIMIT" == 1 ]]; then docker buildx stop "$BUILDER_NAME" >/dev/null 2>&1 || true; fi
  if (( ! SWAPPED )); then
    printf '\n     %snothing was swapped in; the live container is untouched%s\n' "$DIM" "$RESET"
  fi
  printf '\n'
  exit 1
}

# Frames a subprocess between a label and a timing line. The command keeps the real
# stdout/stderr so docker and bun progress rendering survives. Returns the command's
# exit status, so `run ... || die` works even where errexit is suspended.
run() {
  local label="$1" t0 status=0
  shift
  printf '     %s%s%s%s %s%s\n' "$GREY" "$BOX_TL" "$BOX_H" "$BOX_H" "$label" "$RESET"
  t0="$(now_ms)"
  "$@" || status=$?
  printf '     %s%s%s%s %s%s\n' "$GREY" "$BOX_BL" "$BOX_H" "$BOX_H" \
    "$(fmt_ms $(( $(now_ms) - t0 )))$( (( status )) && printf ' exit %d' "$status")" "$RESET"
  return "$status"
}

compose() { docker compose --env-file "$ENV_FILE" "$@"; }

# Waits for <container>'s Docker healthcheck or HEALTH_TIMEOUT; HEALTH_STATUS keeps
# the final state. Returns 0 only on "healthy".
wait_healthy() {
  local cid="$1" started deadline elapsed last_report=-1
  started="$(now_ms)"
  deadline=$(( SECONDS + HEALTH_TIMEOUT ))
  HEALTH_STATUS="starting"
  while (( SECONDS < deadline )); do
    HEALTH_STATUS="$(docker inspect --format '{{.State.Health.Status}}' "$cid" 2>/dev/null || echo unknown)"
    if [[ "$HEALTH_STATUS" == healthy ]]; then break; fi
    if [[ "$(docker inspect --format '{{.State.Status}}' "$cid" 2>/dev/null || true)" == exited ]]; then
      HEALTH_STATUS="exited"
      break
    fi
    elapsed=$(( ( $(now_ms) - started ) / 1000 ))
    if [[ -t 1 ]]; then
      printf '\r     %s%s %-10s %3ds elapsed %s %3ds left%s' "$DIM" "$GLYPH_DOT" "$HEALTH_STATUS" \
        "$elapsed" "$GLYPH_DOT" "$(( HEALTH_TIMEOUT - elapsed ))" "$RESET"
    elif (( elapsed / 30 > last_report )); then
      last_report=$(( elapsed / 30 ))
      printf '     status=%s after %ds\n' "$HEALTH_STATUS" "$elapsed"
    fi
    sleep 2
  done
  if [[ -t 1 ]]; then printf '\r%s\r' "$(repeat "$WIDTH" ' ')"; fi
  [[ "$HEALTH_STATUS" == healthy ]] || return 1
  ok "healthy after $(fmt_ms $(( $(now_ms) - started )))"
}

image_exists() { docker image inspect "$1" >/dev/null 2>&1; }

image_label() {
  docker image inspect --format "{{index .Config.Labels \"$2\"}}" "$1" 2>/dev/null || true
}

live_tag() { image_label "$IMAGE_REPO/web:current" deploy.tag; }

# Points `current` at <tag> for web, and for migrate when that image exists (docker mode).
retag_current() {
  local tag="$1"
  docker tag "$IMAGE_REPO/web:$tag" "$IMAGE_REPO/web:current"
  if image_exists "$IMAGE_REPO/migrate:$tag"; then
    docker tag "$IMAGE_REPO/migrate:$tag" "$IMAGE_REPO/migrate:current"
  fi
}

web_cid() { compose ps -q "$SERVICE" 2>/dev/null || true; }

# Tags of <repo> newest first, without `current` and dangling entries.
image_tags() {
  docker images "$1" --format '{{.CreatedAt}}	{{.Tag}}' \
    | grep -v -e '<none>' -e $'\tcurrent$' | sort -r | cut -f2 || true
}

lock() {
  command -v flock >/dev/null || die "flock not found on PATH (util-linux)"
  exec 9>"$REPO_ROOT/$LOCK_FILE"
  flock -w 5 9 || die "another deploy is already running (lock: $LOCK_FILE)"
}

load_env() {
  [[ -f "$ENV_FILE" ]] || die "$ENV_FILE not found; cp .env.example $ENV_FILE and fill it in"
  set -a
  # shellcheck disable=SC1090
  . "./$ENV_FILE"
  set +a
}

# Sizes the build budget from this host unless pinned. Sets BUILD_CPUS, BUILD_MEM_MB,
# NODE_HEAP_MB, NEXT_BUILD_CPUS and the *_SRC markers shown in the summary.
size_build() {
  local cores avail_mb keep=$(( 100 - BUILD_RESERVE_PCT )) by_mem
  cores="$(nproc)"
  avail_mb="$(awk '/^MemAvailable:/ { print int($2 / 1024) }' /proc/meminfo)"
  HOST_CORES="$cores"
  HOST_AVAIL_MB="$avail_mb"

  CPUS_SRC="pinned"
  if [[ -z "$BUILD_CPUS" ]]; then
    CPUS_SRC="auto"
    BUILD_CPUS=$(( cores * keep / 100 ))
    if (( BUILD_CPUS < 1 )); then BUILD_CPUS=1; fi
  fi
  if (( BUILD_CPUS > cores )); then
    warn "--cpus $BUILD_CPUS exceeds the host's $cores cores; using $cores"
    BUILD_CPUS="$cores"
  fi

  MEM_SRC="pinned"
  if [[ -z "$BUILD_MEM_MB" ]]; then
    MEM_SRC="auto"
    BUILD_MEM_MB=$(( avail_mb * keep / 100 ))
  fi
  if (( BUILD_MEM_MB < 2048 )); then
    warn "build memory budget is ${BUILD_MEM_MB} MB; next build usually needs 2 GB or more"
  fi
  if (( BUILD_MEM_MB > avail_mb )); then
    warn "build memory budget ${BUILD_MEM_MB} MB exceeds the ${avail_mb} MB available now"
  fi

  HEAP_SRC="pinned"
  if [[ -z "$NODE_HEAP_MB" ]]; then
    HEAP_SRC="auto"
    NODE_HEAP_MB=$(( BUILD_MEM_MB * 75 / 100 ))
    if (( NODE_HEAP_MB > 8192 )); then NODE_HEAP_MB=8192; fi
    if (( NODE_HEAP_MB < 512 )); then NODE_HEAP_MB=512; fi
  fi

  WORKERS_SRC="pinned"
  if [[ -z "$NEXT_BUILD_CPUS" ]]; then
    WORKERS_SRC="auto"
    by_mem=$(( BUILD_MEM_MB / 1536 ))
    NEXT_BUILD_CPUS=$(( BUILD_CPUS < by_mem ? BUILD_CPUS : by_mem ))
    if (( NEXT_BUILD_CPUS < 1 )); then NEXT_BUILD_CPUS=1; fi
  fi
}

# Host mode: builds the command prefix that confines a build to the budget.
host_limiter() {
  LIMITER=()
  local sd=()
  if (( BUILD_LIMIT )); then
    if command -v systemd-run >/dev/null; then
      if (( EUID == 0 )); then sd=(systemd-run --scope --quiet); else sd=(systemd-run --user --scope --quiet); fi
      sd+=(-p "MemoryMax=${BUILD_MEM_MB}M" -p MemorySwapMax=0 -p "CPUQuota=$(( BUILD_CPUS * 100 ))%")
      # Probe with the real properties: a user manager without delegated memory/cpu
      # controllers refuses them, and the taskset fallback takes over.
      if ! "${sd[@]}" true >/dev/null 2>&1; then sd=(); fi
    fi
    if (( ${#sd[@]} )); then
      LIMITER=("${sd[@]}")
      LIMIT_HOW="cgroup scope (hard memory and CPU caps)"
    elif command -v taskset >/dev/null; then
      LIMITER=(taskset -c "0-$(( BUILD_CPUS - 1 ))")
      LIMIT_HOW="CPU affinity + heap cap (no hard memory cap: systemd-run unavailable)"
    else
      LIMIT_HOW="heap cap only (systemd-run and taskset unavailable)"
    fi
  else
    LIMIT_HOW="none (--no-limit), low priority only"
  fi
  if command -v nice >/dev/null; then LIMITER+=(nice -n 10); fi
  if command -v ionice >/dev/null; then LIMITER+=(ionice -c 2 -n 7); fi
}

# Docker mode: a docker-container BuildKit builder confined to the budget. A cap
# change recreates it with --keep-state, so its layer and mount caches survive.
docker_builder() {
  BUILDER_OPTS=()
  if (( ! BUILD_LIMIT )); then
    LIMIT_HOW="default builder, uncapped (--no-limit)"
    return 0
  fi
  docker buildx version >/dev/null 2>&1 || die "docker buildx is required for capped docker-mode builds (or pass --no-limit)"
  local want have cpuset="0-$(( BUILD_CPUS - 1 ))"
  want="$(( BUILD_MEM_MB * 1024 * 1024 )) $cpuset"
  have="$(docker inspect --format '{{.HostConfig.Memory}} {{.HostConfig.CpusetCpus}}' "buildx_buildkit_${BUILDER_NAME}0" 2>/dev/null || true)"
  if [[ "$have" != "$want" ]]; then
    if docker buildx inspect "$BUILDER_NAME" >/dev/null 2>&1; then
      run "docker buildx rm --keep-state (caps changed)" docker buildx rm --keep-state "$BUILDER_NAME"
    fi
    run "docker buildx create" docker buildx create --name "$BUILDER_NAME" --driver docker-container \
      --driver-opt "memory=${BUILD_MEM_MB}m,memory-swap=${BUILD_MEM_MB}m,cpuset-cpus=${cpuset}" --bootstrap
  fi
  BUILDER_OPTS=(--builder "$BUILDER_NAME")
  LIMIT_HOW="capped BuildKit container ($BUILDER_NAME)"
}

machine_facts() {
  local os cpu total_kb avail_kb disk
  os="$( { . /etc/os-release && printf '%s' "${PRETTY_NAME:-}"; } 2>/dev/null || true )"
  cpu="$(sed -n '/^model name/{s/^model name[[:space:]]*:[[:space:]]*//;p;q}' /proc/cpuinfo 2>/dev/null || true)"
  total_kb="$(awk '/^MemTotal:/ { print $2 }' /proc/meminfo 2>/dev/null || echo 0)"
  avail_kb="$(awk '/^MemAvailable:/ { print $2 }' /proc/meminfo 2>/dev/null || echo 0)"
  disk="$(df -h --output=avail,size "$REPO_ROOT" 2>/dev/null | awk 'NR == 2 { print $1 " free of " $2 }')"
  subhead "Machine"
  info "hostname" "$(hostname -f 2>/dev/null || hostname)"
  info "os" "${os:-?}  $GLYPH_DOT  kernel $(uname -r)  $GLYPH_DOT  $(uname -m)"
  info "cpu" "$(nproc) cores  $GLYPH_DOT  ${cpu:-?}"
  info "memory" "$(awk -v t="$total_kb" -v a="$avail_kb" -v d="$GLYPH_DOT" 'BEGIN { printf "%.1f GB total %s %.1f GB available", t / 1048576, d, a / 1048576 }')"
  info "disk" "${disk:-?}  ($REPO_ROOT)"
  info "uptime" "$(uptime -p 2>/dev/null | sed 's/^up //' || echo '?')"
}

preflight_common() {
  command -v git >/dev/null || die "git not found on PATH"
  command -v docker >/dev/null || die "docker not found on PATH"
  docker compose version >/dev/null 2>&1 || die "docker compose v2 plugin not available"
  docker info >/dev/null 2>&1 || die "cannot talk to the docker daemon; is it running and is this user in the 'docker' group?"
  [[ "$(uname -s)" == Linux ]] || die "deploy.sh runs on the Linux deploy host; got $(uname -s)"
  REPO_ROOT="$(git rev-parse --show-toplevel)"
  cd "$REPO_ROOT"
}

# Runs prisma migrate deploy: on the host in host mode, from the migrate image in
# docker mode.
migrate_now() {
  local tag="$1"
  if [[ "$MODE" == host ]]; then
    command -v bun >/dev/null || die "bun not found on PATH"
    run "prisma migrate deploy" env ${MIGRATE_DATABASE_URL:+DATABASE_URL="$MIGRATE_DATABASE_URL"} bunx prisma migrate deploy
  else
    image_exists "$IMAGE_REPO/migrate:$tag" || die "$IMAGE_REPO/migrate:$tag not found; it is built only in docker mode"
    run "compose run migrate" env IMAGE_TAG="$tag" docker compose --env-file "$ENV_FILE" run --rm --no-deps migrate
  fi
}

cmd_deploy() {
  local base=$([[ "$MODE" == host ]] && echo 9 || echo 6)
  TOTAL_STEPS=$(( base + DO_MIGRATE + DO_HEALTH * 2 + DO_PRUNE ))
  trap 'die "aborted at line $LINENO"' ERR
  DEPLOY_START_MS="$(now_ms)"
  banner "MARKET MAVEN  $GLYPH_DOT  DEPLOY" "$MODE build $GLYPH_DOT image $GLYPH_DOT candidate $GLYPH_DOT compose swap"

  step "Preflight"
  preflight_common
  lock
  if [[ "$MODE" == host ]]; then
    command -v bun >/dev/null || die "bun not found on PATH (host mode); install bun or use --mode docker"
  fi
  [[ -f "$ENV_FILE" ]] || die "$ENV_FILE not found; cp .env.example $ENV_FILE and fill it in"

  ORIGINAL_REF="$(git symbolic-ref --quiet --short HEAD 2>/dev/null || git rev-parse --short=12 HEAD)"
  PREVIOUS_TAG="$(live_tag)"
  machine_facts
  subhead "Toolchain"
  info "docker" "engine $(docker version --format '{{.Server.Version}}' 2>/dev/null || echo '?')  $GLYPH_DOT  compose $(docker compose version --short 2>/dev/null || echo '?')"
  if command -v bun >/dev/null; then info "bun" "$(bun --version)"; fi
  info "git" "$(git --version | awk '{ print $3 }')"
  subhead "Release"
  info "mode" "$MODE"
  info "env file" "$ENV_FILE"
  info "checkout" "$ORIGINAL_REF"
  info "running" "${PREVIOUS_TAG:-nothing deployed yet}"
  if [[ -n "$TARGET_REF" ]]; then info "target" "pinned revision $GLYPH_DOT $TARGET_REF"
  elif [[ -n "$BRANCH" ]]; then info "target" "tip of $BRANCH"
  else info "target" "tip of $ORIGINAL_REF"
  fi
  ok "host is ready"

  local dirty=0
  if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then dirty=1; fi
  if [[ -n "$TARGET_REF" ]]; then
    step "Checking out $TARGET_REF"
    if (( dirty )); then
      die "working tree is dirty; a detached checkout would block on or discard those changes.
Commit or stash them first:  git stash && bash deploy.sh --sha $TARGET_REF"
    fi
    if (( DO_PULL )); then run "git fetch --tags --prune" git fetch --tags --prune
    else note "--no-pull: resolving $TARGET_REF against the local object store only"
    fi
    local target_sha
    target_sha="$(git rev-parse --verify --quiet "${TARGET_REF}^{commit}")" || die "'$TARGET_REF' is not a commit known to this repository"
    run "git checkout --detach ${target_sha:0:12}" git checkout --quiet --detach "$target_sha"
    warn "HEAD is now detached; restore the branch later with: git checkout $ORIGINAL_REF"
  elif (( DO_PULL )); then
    step "Pulling latest changes"
    if (( dirty && ! ALLOW_DIRTY )); then
      die "working tree has uncommitted changes; commit or stash them, or pass --allow-dirty"
    fi
    if [[ -n "$BRANCH" && "$BRANCH" != "$ORIGINAL_REF" ]]; then
      run "git fetch origin $BRANCH" git fetch --prune origin "$BRANCH"
      run "git checkout $BRANCH" git checkout --quiet "$BRANCH"
    fi
    run "git pull --ff-only" git pull --ff-only
  else
    skip_step "Updating the working tree" "--no-pull"
  fi
  if [[ -n "$(git status --porcelain --untracked-files=no)" ]] && (( ! ALLOW_DIRTY )); then
    die "working tree has uncommitted changes; commit or stash them, or pass --allow-dirty"
  fi

  GIT_SHA="$(git rev-parse --short=12 HEAD)"
  GIT_SUBJECT="$(git log -1 --pretty=%s)"
  info "commit" "$GIT_SHA"
  info "subject" "$GIT_SUBJECT"
  info "authored" "$(git log -1 --pretty='%an, %ar')"

  local lockfile=bun.lock
  if [[ ! -f "$lockfile" ]]; then lockfile=bun.lockb; fi
  [[ -f "$lockfile" ]] || die "no bun.lock or bun.lockb in the repository"
  LOCK_HASH="$(sha256sum "$lockfile" package.json | sha256sum | cut -d' ' -f1)"

  # Install runs BEFORE the env file is sourced: a NODE_ENV=production there would
  # make bun skip the devDependencies next build needs. The package cache lives
  # outside the repo so a fresh clone re-installs from disk.
  if [[ "$MODE" == host ]]; then
    export BUN_INSTALL_CACHE_DIR="${BUN_INSTALL_CACHE_DIR:-$HOME/.bun/install/cache}"
    mkdir -p "$BUN_INSTALL_CACHE_DIR"
    local lock_stamp="node_modules/.deploy-lock-hash"
    if (( ! DO_INSTALL )); then
      skip_step "Installing dependencies" "--no-install"
    elif (( ! FORCE_INSTALL )) && [[ -d node_modules && -f "$lock_stamp" && "$(cat "$lock_stamp")" == "$LOCK_HASH" ]]; then
      skip_step "Installing dependencies" "$lockfile unchanged since the last install"
      note "force a fresh install with --reinstall"
    else
      step "Installing dependencies"
      info "cache" "$BUN_INSTALL_CACHE_DIR"
      rm -f "$lock_stamp"
      if ! run "bun install --frozen-lockfile" env -u NODE_ENV nice -n 10 bun install --frozen-lockfile; then
        die "frozen install failed; $lockfile is out of sync with package.json.
Run bun install on a dev machine and commit the lockfile."
      fi
      printf '%s' "$LOCK_HASH" > "$lock_stamp"
      ok "dependencies installed"
    fi
  fi

  step "Loading $ENV_FILE"
  load_env
  if [[ -z "${DATABASE_URL:-}${NEON_DATABASE_URL:-}" ]]; then die "DATABASE_URL is empty in $ENV_FILE"; fi
  local var
  for var in BETTER_AUTH_SECRET BETTER_AUTH_URL MAVEN_ENCRYPTION_KEY NEXT_PUBLIC_APP_URL; do
    [[ -n "${!var:-}" ]] || die "$var is empty in $ENV_FILE"
  done
  info "public url" "$NEXT_PUBLIC_APP_URL"
  info "http port" "$APP_PORT"
  info "app caps" "cpus $([[ "$APP_CPUS" == 0 ]] && echo none || echo "$APP_CPUS")  $GLYPH_DOT  memory $([[ "$APP_MEM" == 0 ]] && echo none || echo "$APP_MEM")"
  ok "every required variable is present"

  # Build key: everything that changes the build output. NEXT_PUBLIC_* are inlined
  # into the client bundle, the rest of the env file is runtime-only.
  BUILD_KEY="$(
    {
      git rev-parse HEAD
      git diff HEAD --no-ext-diff --binary
      git ls-files --others --exclude-standard -z | xargs -0 -r sha256sum
      grep -E '^[[:space:]]*(export[[:space:]]+)?NEXT_PUBLIC_' "$ENV_FILE" || true
      printf '%s\n' "$LOCK_HASH" "$MODE"
    } | sha256sum | cut -d' ' -f1
  )"
  TAG="$GIT_SHA"
  if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
    TAG="$GIT_SHA-dirty.${BUILD_KEY:0:8}"
    warn "building from a dirty working tree; tagged $TAG"
  fi

  step "Sizing build resources"
  size_build
  if [[ "$MODE" == host ]]; then host_limiter; else docker_builder; fi
  info "host" "$HOST_CORES cores  $GLYPH_DOT  ${HOST_AVAIL_MB} MB available  $GLYPH_DOT  reserve ${BUILD_RESERVE_PCT}%"
  info "cpus" "$BUILD_CPUS ($CPUS_SRC)"
  info "memory" "${BUILD_MEM_MB} MB ($MEM_SRC)"
  info "node heap" "${NODE_HEAP_MB} MB ($HEAP_SRC)"
  info "workers" "$NEXT_BUILD_CPUS ($WORKERS_SRC)"
  info "enforced" "$LIMIT_HOW"
  if (( PRESET_MIN )); then note "--min preset applied to every value not pinned explicitly"; fi
  ok "build budget set"

  if [[ "$MODE" == host ]]; then
    deploy_host_build
  else
    deploy_docker_build
  fi

  if (( DO_MIGRATE )); then
    step "Applying database migrations"
    migrate_now "$TAG"
  fi

  # The candidate boots beside the live container with the same env and network but
  # no published ports, so a release that cannot boot costs zero downtime.
  if (( DO_HEALTH )); then
    step "Verifying candidate (timeout ${HEALTH_TIMEOUT}s)"
    docker rm -f "$CANDIDATE_NAME" >/dev/null 2>&1 || true
    run "compose run -d (no ports)" env IMAGE_TAG="$TAG" \
      docker compose --env-file "$ENV_FILE" run -d --no-deps --name "$CANDIDATE_NAME" "$SERVICE"
    if ! wait_healthy "$CANDIDATE_NAME"; then
      printf '\n     %scandidate: last 100 log lines%s\n' "$RED" "$RESET"
      rule
      docker logs --tail=100 "$CANDIDATE_NAME" 2>&1 || true
      rule
      die "candidate is '$HEALTH_STATUS', not healthy after ${HEALTH_TIMEOUT}s"
    fi
    docker rm -f "$CANDIDATE_NAME" >/dev/null 2>&1 || true
    ok "candidate verified and removed; the live container was never touched"
  else
    warn "--skip-health: swapping in an unverified image"
  fi

  step "Swapping container"
  retag_current "$TAG"
  SWAPPED=1
  run "compose up -d" compose up -d --no-build --remove-orphans "$SERVICE"

  if (( DO_HEALTH )); then
    step "Waiting for healthcheck (timeout ${HEALTH_TIMEOUT}s)"
    local cid
    cid="$(web_cid)"
    [[ -n "$cid" ]] || die "container did not start"
    if ! wait_healthy "$cid"; then
      local failed="$HEALTH_STATUS"
      printf '\n     %slast 100 log lines%s\n' "$RED" "$RESET"
      rule
      compose logs --tail=100 "$SERVICE" || true
      rule
      if [[ -n "$PREVIOUS_TAG" && "$PREVIOUS_TAG" != "$TAG" ]] && image_exists "$IMAGE_REPO/web:$PREVIOUS_TAG"; then
        warn "restoring the previous release $PREVIOUS_TAG"
        retag_current "$PREVIOUS_TAG"
        if compose up -d --no-build "$SERVICE" && wait_healthy "$(web_cid)"; then
          die "new release was '$failed' after the swap; $PREVIOUS_TAG is serving again.
Migrations already applied were NOT reverted."
        fi
        die "new release was '$failed' and restoring $PREVIOUS_TAG also failed ('$HEALTH_STATUS')."
      fi
      die "container is '$failed', not healthy after ${HEALTH_TIMEOUT}s; no previous release to restore"
    fi
  fi

  if (( DO_PRUNE )); then
    step "Pruning old images (keeping $KEEP_IMAGES)"
    prune_images "$TAG" "$PREVIOUS_TAG"
  fi

  trap - ERR
  end_step

  printf '\n'
  box_edge "$GREEN" "$BOX_TL" "$BOX_TR"
  box_line "$GREEN" "$BOLD$GREEN" "$GLYPH_OK deployed $IMAGE_REPO/web:$TAG"
  box_line "$GREEN" "$DIM" "$GIT_SUBJECT"
  box_edge "$GREEN" "$BOX_BL" "$BOX_BR"
  info "mode" "$MODE"
  info "duration" "$(fmt_ms $(( $(now_ms) - DEPLOY_START_MS )))"
  info "finished" "$(date '+%Y-%m-%d %H:%M:%S %Z')"
  info "url" "$NEXT_PUBLIC_APP_URL  (host port $APP_PORT)"
  info "logs" "bash deploy.sh logs"
  if [[ -n "$PREVIOUS_TAG" && "$PREVIOUS_TAG" != "$TAG" ]]; then
    info "rollback" "bash deploy.sh rollback $PREVIOUS_TAG"
  fi
  if [[ -n "$TARGET_REF" ]]; then warn "HEAD is detached at $GIT_SHA; return with: git checkout $ORIGINAL_REF"; fi
  timing_table
  printf '\n'

  if (( DO_FOLLOW )); then
    exec 9>&-
    exec docker compose --env-file "$ENV_FILE" logs -f --tail=100 "$SERVICE"
  fi
}

deploy_host_build() {
  local build_stamp=".next/.deploy-build-key"
  if (( ! FORCE_BUILD )) && [[ -f .next/standalone/server.js && -f "$build_stamp" && "$(cat "$build_stamp")" == "$BUILD_KEY" ]]; then
    skip_step "Building Next.js (standalone)" "source, deps and NEXT_PUBLIC_* unchanged since the last build"
    note "force a rebuild with --rebuild"
  else
    step "Building Next.js (standalone)"
    # Only the emitted output is cleared; .next/cache keeps repeat builds fast.
    rm -rf .next/standalone .next/static .next/server "$build_stamp"
    run "bun run build" "${LIMITER[@]}" env \
      NODE_OPTIONS="--max-old-space-size=$NODE_HEAP_MB" \
      BUN_JSC_forceRAMSize="$(( NODE_HEAP_MB * 1024 * 1024 ))" \
      NEXT_BUILD_CPUS="$NEXT_BUILD_CPUS" \
      NEXT_TELEMETRY_DISABLED=1 \
      bun run build \
      || die "next build failed (memory budget ${BUILD_MEM_MB} MB, heap ${NODE_HEAP_MB} MB).
An out-of-memory kill shows as exit 137; raise --mem/--heap or lower --workers."
    [[ -f .next/standalone/server.js ]] || die ".next/standalone/server.js missing; is output: \"standalone\" still set in next.config.ts?"
    printf '%s' "$BUILD_KEY" > "$build_stamp"
    ok "build complete"
  fi

  step "Assembling $STAGE_DIR"
  rm -rf "$STAGE_DIR"
  mkdir -p "$STAGE_DIR/.next/static" "$STATIC_STASH"
  cp -a .next/standalone/. "$STAGE_DIR/"

  # Version-skew guard: the running release's static output goes down first and this
  # build's on top; content-hashed names mean nothing new is ever shadowed. The stash
  # holds each release's own pure output, so the bundle carries exactly one previous
  # release instead of growing with every deploy.
  if [[ -n "$PREVIOUS_TAG" && "$PREVIOUS_TAG" != "$TAG" ]]; then
    local cid
    cid="$(web_cid)"
    if [[ -d "$STATIC_STASH/$PREVIOUS_TAG" ]]; then
      cp -a "$STATIC_STASH/$PREVIOUS_TAG/." "$STAGE_DIR/.next/static/"
      info "carried" "static chunks of $PREVIOUS_TAG (stash)"
    elif [[ -n "$cid" ]] && docker cp "$cid:/app/.next/static/." "$STAGE_DIR/.next/static/" >/dev/null 2>&1; then
      info "carried" "static chunks of $PREVIOUS_TAG (live container)"
    else
      warn "could not carry the running release's static chunks; open tabs may need a reload"
    fi
  fi
  cp -a .next/static/. "$STAGE_DIR/.next/static/"

  rm -rf "${STATIC_STASH:?}/$TAG"
  cp -a .next/static "$STATIC_STASH/$TAG"
  local stash
  for stash in "$STATIC_STASH"/*/; do
    stash="$(basename "$stash")"
    if [[ "$stash" != "$TAG" && "$stash" != "$PREVIOUS_TAG" ]]; then rm -rf "${STATIC_STASH:?}/$stash"; fi
  done

  cp -a public "$STAGE_DIR/public"
  # Never ship host env files or logs inside the image.
  rm -rf "$STAGE_DIR/logs" "$STAGE_DIR/.env" "$STAGE_DIR"/.env.*
  [[ -f "$STAGE_DIR/server.js" ]] || die "assembly failed: $STAGE_DIR/server.js missing"

  # A bundle carrying win32/darwin native binaries builds a valid image that crashes
  # on first request.
  local foreign
  foreign="$(find "$STAGE_DIR" -name '*.node' \( -path '*win32*' -o -path '*darwin*' \) -print -quit)"
  [[ -z "$foreign" ]] || die "foreign native binary in the bundle: $foreign
Delete node_modules and rebuild on this host."
  info "bundle" "$(du -sh "$STAGE_DIR" | cut -f1)  $GLYPH_DOT  $(find "$STAGE_DIR" -type f | wc -l) files"
  ok "bundle verified for linux/$(uname -m)"

  step "Building image $IMAGE_REPO/web:$TAG"
  run "docker build --target runtime" docker build -f Dockerfile --target runtime \
    --build-arg GIT_COMMIT_SHA="$(git rev-parse HEAD)" \
    --label "deploy.tag=$TAG" --label "deploy.key=$BUILD_KEY" --label "$IMAGE_TITLE_LABEL" \
    -t "$IMAGE_REPO/web:$TAG" "$STAGE_DIR"
  ok "image built"
}

deploy_docker_build() {
  if (( ! FORCE_BUILD )) && image_exists "$IMAGE_REPO/web:$TAG" && image_exists "$IMAGE_REPO/migrate:$TAG" \
    && [[ "$(image_label "$IMAGE_REPO/web:$TAG" deploy.key)" == "$BUILD_KEY" ]]; then
    skip_step "Building images" "$TAG already built from identical inputs"
    note "force a rebuild with --rebuild"
    return 0
  fi
  step "Building images $IMAGE_REPO/{web,migrate}:$TAG"
  local target
  for target in web migrate; do
    run "docker buildx build --target $target" docker buildx build ${BUILDER_OPTS[@]+"${BUILDER_OPTS[@]}"} \
      --target "$target" \
      --build-arg NEXT_PUBLIC_APP_URL="$NEXT_PUBLIC_APP_URL" \
      --build-arg NODE_HEAP_MB="$NODE_HEAP_MB" \
      --build-arg NEXT_BUILD_CPUS="$NEXT_BUILD_CPUS" \
      --build-arg GIT_COMMIT_SHA="$(git rev-parse HEAD)" \
      --label "deploy.tag=$TAG" --label "deploy.key=$BUILD_KEY" --label "$IMAGE_TITLE_LABEL" \
      -t "$IMAGE_REPO/$target:$TAG" --load . \
      || die "image build failed for target $target (memory budget ${BUILD_MEM_MB} MB, heap ${NODE_HEAP_MB} MB).
An out-of-memory kill shows as exit 137; raise --mem/--heap or lower --workers."
  done
  # The capped builder only runs while it builds; its cache stays on disk.
  if (( BUILD_LIMIT )); then docker buildx stop "$BUILDER_NAME" >/dev/null 2>&1 || true; fi
  ok "images built"
}

# Keeps the newest KEEP_IMAGES tags per repository plus the live and previous
# releases, then drops this project's dangling layers (filtered by image title label).
prune_images() {
  local keep_a="$1" keep_b="$2" repo tag removed=0 n reclaimed kept
  for repo in "$IMAGE_REPO/web" "$IMAGE_REPO/migrate"; do
    n=0
    while IFS= read -r tag; do
      [[ -n "$tag" ]] || continue
      n=$(( n + 1 ))
      if (( n <= KEEP_IMAGES )) || [[ "$tag" == "$keep_a" || "$tag" == "$keep_b" ]]; then continue; fi
      note "removing $repo:$tag"
      if docker image rm "$repo:$tag" >/dev/null 2>&1; then removed=$(( removed + 1 )); fi
    done < <(image_tags "$repo")
  done
  reclaimed="$(docker image prune -f --filter "label=$IMAGE_TITLE_LABEL" 2>/dev/null | awk '/Total reclaimed space/ { print $4, $5 }')"
  if (( DO_PRUNE_CACHE )); then
    note "dropping build cache unused for 7+ days"
    docker builder prune -f --filter 'until=168h' >/dev/null 2>&1 || true
    if docker buildx inspect "$BUILDER_NAME" >/dev/null 2>&1; then
      docker buildx prune -f --builder "$BUILDER_NAME" --filter 'until=168h' >/dev/null 2>&1 || true
    fi
  fi
  kept="$(image_tags "$IMAGE_REPO/web" | tr '\n' ' ')"
  info "removed" "$removed tagged image(s)${reclaimed:+, dangling layers reclaimed $reclaimed}"
  info "retained" "${kept:-none}"
  ok "image store is clean"
}

cmd_rollback() {
  TOTAL_STEPS=2
  trap 'die "aborted at line $LINENO"' ERR
  DEPLOY_START_MS="$(now_ms)"
  banner "MARKET MAVEN  $GLYPH_DOT  ROLLBACK" "re-release an image from the local store, no rebuild"

  step "Resolving target"
  preflight_common
  lock
  [[ -f "$ENV_FILE" ]] || die "$ENV_FILE not found"
  local live tag
  live="$(live_tag)"
  tag="$ROLLBACK_TAG"
  if [[ -z "$tag" ]]; then
    tag="$(image_tags "$IMAGE_REPO/web" | grep -vxF "${live:-}" | head -n 1 || true)"
  fi
  [[ -n "$tag" ]] || die "no other release in the image store; rebuild one with: bash deploy.sh --sha <commit>"
  image_exists "$IMAGE_REPO/web:$tag" || die "$IMAGE_REPO/web:$tag is not in the image store; rebuild it with: bash deploy.sh --sha $tag"
  [[ "$tag" != "$live" ]] || die "$tag is already live"
  info "live" "${live:-none}"
  info "target" "$tag"
  ok "target resolved"

  step "Swapping to $tag"
  retag_current "$tag"
  SWAPPED=1
  run "compose up -d" compose up -d --no-build --remove-orphans "$SERVICE"
  if (( DO_HEALTH )) && ! wait_healthy "$(web_cid)"; then
    if [[ -n "$live" ]] && image_exists "$IMAGE_REPO/web:$live"; then
      warn "restoring $live"
      retag_current "$live"
      compose up -d --no-build "$SERVICE" || true
    fi
    die "$tag is '$HEALTH_STATUS', not healthy after ${HEALTH_TIMEOUT}s"
  fi
  trap - ERR
  end_step
  ok "$tag is live; database migrations were not reverted"
  timing_table
  printf '\n'
}

cmd_migrate() {
  TOTAL_STEPS=1
  trap 'die "aborted at line $LINENO"' ERR
  DEPLOY_START_MS="$(now_ms)"
  step "Applying database migrations ($MODE mode)"
  preflight_common
  lock
  load_env
  migrate_now current
  trap - ERR
  end_step
  ok "migrations applied"
}

cmd_status() {
  preflight_common
  local live cid
  live="$(live_tag)"
  cid="$(web_cid)"
  banner "MARKET MAVEN  $GLYPH_DOT  STATUS" "$REPO_ROOT"
  subhead "Release"
  info "live" "${live:-nothing deployed yet}"
  if [[ -n "$cid" ]]; then
    info "container" "$(docker inspect --format '{{.State.Status}} {{if .State.Health}}({{.State.Health.Status}}){{end}} since {{.State.StartedAt}}' "$cid")"
    info "usage" "$(docker stats --no-stream --format '{{.CPUPerc}} CPU  {{.MemUsage}}' "$cid" 2>/dev/null || echo '?')"
  else
    info "container" "not running"
  fi
  info "checkout" "$(git symbolic-ref --quiet --short HEAD 2>/dev/null || echo detached) @ $(git rev-parse --short=12 HEAD)"
  subhead "Images (newest first)"
  local tag
  while IFS= read -r tag; do
    [[ -n "$tag" ]] || continue
    info "$( [[ "$tag" == "$live" ]] && echo live || echo kept )" "$tag  $GLYPH_DOT  $(docker image inspect --format '{{.Created}}' "$IMAGE_REPO/web:$tag" | cut -c1-19)"
  done < <(image_tags "$IMAGE_REPO/web")
  subhead "Build budget (as a deploy would size it now)"
  size_build
  info "cpus" "$BUILD_CPUS ($CPUS_SRC) of $HOST_CORES"
  info "memory" "${BUILD_MEM_MB} MB ($MEM_SRC) of ${HOST_AVAIL_MB} MB available"
  info "node heap" "${NODE_HEAP_MB} MB ($HEAP_SRC)"
  info "workers" "$NEXT_BUILD_CPUS ($WORKERS_SRC)"
  printf '\n'
}

case "$COMMAND" in
  deploy)   cmd_deploy ;;
  rollback) cmd_rollback ;;
  migrate)  cmd_migrate ;;
  status)   cmd_status ;;
  logs)     preflight_common; exec docker compose --env-file "$ENV_FILE" logs -f --tail=100 "$SERVICE" ;;
esac
