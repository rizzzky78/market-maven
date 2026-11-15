# syntax=docker/dockerfile:1
#
# Built by `deploy.sh`, never by docker compose. Targets:
#
#   `runtime` host mode: COPY-only image around the bundle `deploy.sh` assembled in
#             `.deploy/` (build context is `.deploy`, nothing compiles here)
#   `web`     docker mode: installs and runs `next build` inside BuildKit, then ships
#             the same standalone layout as `runtime`
#   `migrate` docker mode: one-shot `prisma migrate deploy`
#
FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS runtime
ARG GIT_COMMIT_SHA
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0 \
    GIT_COMMIT_SHA=$GIT_COMMIT_SHA
COPY . ./
EXPOSE 3000
CMD ["bun", "server.js"]

# Manifest, lockfile and Prisma schema first so this layer survives source-only
# changes. `postinstall` runs `prisma generate` against the schema.
FROM base AS deps
COPY package.json bun.lockb prisma.config.ts ./
COPY prisma ./prisma
RUN --mount=type=cache,id=bun,target=/root/.bun/install/cache,sharing=locked \
    bun install --frozen-lockfile

FROM deps AS build
# `NEXT_PUBLIC_*` are inlined into the client bundle, so they are fixed per image.
ARG NEXT_PUBLIC_APP_URL
# Sized by `deploy.sh` from the builder's memory cap and CPU set.
ARG NODE_HEAP_MB=4096
ARG NEXT_BUILD_CPUS=2
# Placeholders only: modules may read these at import time while Next collects
# page data. Nothing connects during the build and this stage never ships.
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_BUILD_CPUS=$NEXT_BUILD_CPUS \
    DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build \
    BETTER_AUTH_SECRET=build-only-placeholder-secret-not-used-at-runtime
COPY . .
RUN bunx prisma generate
RUN --mount=type=cache,id=next,target=/app/.next/cache \
    NODE_OPTIONS="--max-old-space-size=${NODE_HEAP_MB}" \
    BUN_JSC_forceRAMSize="$((NODE_HEAP_MB * 1024 * 1024))" \
    bun run --bun next build

FROM base AS migrate
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json prisma.config.ts ./
COPY prisma ./prisma
CMD ["bunx", "prisma", "migrate", "deploy"]

# `.next/standalone` carries its own traced node_modules and server.js; only the
# static assets and `public/` travel beside it.
FROM base AS web
ARG GIT_COMMIT_SHA
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0 \
    GIT_COMMIT_SHA=$GIT_COMMIT_SHA
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["bun", "server.js"]
