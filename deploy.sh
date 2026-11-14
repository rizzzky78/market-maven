#!/usr/bin/env bash
#
# Pull, build and run market-maven on this host with docker compose.
#
#   ./deploy.sh             git pull, build images, prisma migrate deploy, release, follow logs
#   ./deploy.sh rollback    re-release the previous image tag
#   ./deploy.sh migrate     prisma migrate deploy from the current migrate image
#   ./deploy.sh status      current release, previous release, container health
#   ./deploy.sh logs        follow the web container logs
#
# Images are tagged by short commit SHA; `current` points at the live one and the
# previous tag is kept in `.deploy-logs/previous` for rollback. A release that never
# turns healthy is rolled back automatically. The running container stays up while
# the new image builds. Every deploy run is mirrored to `.deploy-logs/<timestamp>.log`.
#
# Environment:
#   BRANCH        branch to pull (default main)
#   ALLOW_DIRTY   1 permits deploying with uncommitted changes
#   KEEP_IMAGES   image tags kept by prune (default 5)
#
set -Eeuo pipefail

cd "$(dirname "$0")"

BRANCH=${BRANCH:-main}
KEEP_IMAGES=${KEEP_IMAGES:-5}
REPO=market-maven
LOG_DIR=.deploy-logs

if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  B='\033[1m'; D='\033[2m'; X='\033[0m'; G='\033[32m'; R='\033[31m'; Y='\033[33m'; C='\033[36m'
else
  B=''; D=''; X=''; G=''; R=''; Y=''; C=''
fi

STEP=0
TOTAL=0
step() { STEP=$((STEP + 1)); printf "\n${B}${C}[%d/%d]${X} ${B}%s${X}\n" "$STEP" "$TOTAL" "$1"; }
ok()   { printf "  ${G}ok${X} %s\n" "$1"; }
note() { printf "  ${Y}--${X} %s\n" "$1"; }
die()  { printf "\n${R}${B}error:${X} %s\n" "$1" >&2; exit 1; }

compose() { docker compose "$@"; }

usage() {
  sed -n '3,19p' "$0" | sed 's/^# \{0,1\}//'
}

preflight() {
  command -v git >/dev/null || die "git not found"
  command -v docker >/dev/null || die "docker not found"
  docker compose version >/dev/null 2>&1 || die "docker compose plugin not found"
  [ -f .env ] || die ".env missing in $(pwd) (see example.env)"
}

current_tag() {
  docker image inspect "$REPO/web:current" --format '{{index .Config.Labels "deploy.tag"}}' 2>/dev/null || true
}

previous_tag() { cat "$LOG_DIR/previous" 2>/dev/null || true; }

retag() {
  local tag=$1
  docker tag "$REPO/web:$tag" "$REPO/web:current"
  docker tag "$REPO/migrate:$tag" "$REPO/migrate:current"
}

up_wait() { IMAGE_TAG=current compose up -d --no-build --wait --wait-timeout 180 web; }

health() {
  compose ps --format '{{.Service}}  {{.Status}}' 2>/dev/null | sed 's/^/  /'
}

prune() {
  local keep live prev
  live=$(current_tag)
  prev=$(previous_tag)
  for image in web migrate; do
    docker image ls "$REPO/$image" --format '{{.Tag}}' \
      | grep -vxE "current|<none>|${live:-^}|${prev:-^}" \
      | tail -n +"$((KEEP_IMAGES + 1))" \
      | while read -r tag; do docker image rm "$REPO/$image:$tag" >/dev/null 2>&1 || true; done
  done
  docker image prune -f >/dev/null 2>&1 || true
  docker builder prune -f --filter until=168h >/dev/null 2>&1 || true
}

cmd_deploy() {
  TOTAL=6
  preflight
  mkdir -p "$LOG_DIR"
  local log="$LOG_DIR/$(date +%Y%m%d-%H%M%S).log"
  exec 3>&1 4>&2 > >(tee >(sed -u 's/\x1b\[[0-9;]*m//g' >"$log")) 2>&1
  local start=$SECONDS

  step "Pull $BRANCH"
  if [ "${ALLOW_DIRTY:-0}" != 1 ] && [ -n "$(git status --porcelain --untracked-files=no)" ]; then
    die "working tree has uncommitted changes (ALLOW_DIRTY=1 to override)"
  fi
  git fetch --prune origin "$BRANCH"
  git checkout -q "$BRANCH"
  git pull --ff-only origin "$BRANCH"
  local tag
  tag=$(git rev-parse --short=7 HEAD)
  [ -n "$(git status --porcelain --untracked-files=no)" ] && tag="$tag-dirty.$(date +%s)"
  ok "$(git log -1 --format='%h %s')"

  step "Build $tag"
  if docker image inspect "$REPO/web:$tag" >/dev/null 2>&1 && docker image inspect "$REPO/migrate:$tag" >/dev/null 2>&1; then
    note "$tag already built, skipping"
  else
    IMAGE_TAG=$tag GIT_COMMIT_SHA=$(git rev-parse HEAD) COMPOSE_PROFILES=tools \
      compose build --pull web migrate
  fi
  ok "images built"

  step "Migrate"
  IMAGE_TAG=$tag compose run --rm --no-deps migrate
  ok "prisma migrate deploy applied"

  step "Release"
  local prev
  prev=$(current_tag)
  if [ -n "$prev" ] && [ "$prev" != "$tag" ]; then
    printf '%s\n' "$prev" >"$LOG_DIR/previous"
  fi
  retag "$tag"
  if ! up_wait; then
    compose logs --tail=50 web || true
    if [ -n "$prev" ] && [ "$prev" != "$tag" ]; then
      note "$tag unhealthy, rolling back to $prev"
      retag "$prev"
      up_wait || die "rollback to $prev also failed"
      die "$tag failed its healthcheck, rolled back to $prev"
    fi
    die "$tag failed its healthcheck and there is no previous release"
  fi
  health
  ok "$tag live on :${APP_PORT:-3000}"

  step "Prune"
  prune
  ok "kept the last $KEEP_IMAGES tags"

  step "Logs"
  printf "  ${G}${B}deployed %s in %ds${X}  ${D}log: %s${X}\n" "$tag" "$((SECONDS - start))" "$log"
  printf "  ${D}Ctrl-C detaches, the container keeps running${X}\n\n"
  exec 1>&3 2>&4
  exec docker compose logs -f --tail=100 web
}

cmd_rollback() {
  preflight
  local live prev
  live=$(current_tag)
  prev=$(previous_tag)
  [ -n "$prev" ] || die "no previous release recorded"
  docker image inspect "$REPO/web:$prev" >/dev/null 2>&1 || die "image $REPO/web:$prev no longer exists"
  printf "${B}rollback${X} %s -> %s\n" "${live:-none}" "$prev"
  retag "$prev"
  up_wait || die "rollback to $prev failed its healthcheck"
  [ -n "$live" ] && printf '%s\n' "$live" >"$LOG_DIR/previous"
  health
  ok "$prev live on :${APP_PORT:-3000}"
}

cmd_migrate() {
  preflight
  IMAGE_TAG=current compose run --rm --no-deps migrate
  ok "prisma migrate deploy applied"
}

cmd_status() {
  preflight
  printf "${B}current${X}   %s\n" "$(current_tag || echo none)"
  printf "${B}previous${X}  %s\n" "$(previous_tag || echo none)"
  health
}

case "${1:-deploy}" in
  deploy)       cmd_deploy ;;
  rollback)     cmd_rollback ;;
  migrate)      cmd_migrate ;;
  status)       cmd_status ;;
  logs)         preflight; exec docker compose logs -f --tail=100 web ;;
  -h|--help|help) usage ;;
  *)            usage; exit 1 ;;
esac
