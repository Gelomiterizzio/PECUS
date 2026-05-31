# ─────────────────────────────────────────────────────────
# PECUS API — NestJS + Prisma (monorepo, build context = repo root)
# ─────────────────────────────────────────────────────────
FROM node:20-alpine AS base
# Prisma necesita OpenSSL para cargar sus motores en Alpine (musl).
# Sin esto, Prisma descarga el motor "openssl-1.1.x" equivocado y falla al cargarlo.
RUN apk add --no-cache openssl libc6-compat
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

# ---- Dependencias ----
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* .npmrc* turbo.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/types/package.json packages/types/
COPY packages/shared/package.json packages/shared/
COPY packages/ui/package.json packages/ui/
RUN pnpm install --no-frozen-lockfile

# ---- Build ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @pecus/api prisma:generate
RUN pnpm --filter @pecus/api build

# ---- Runtime ----
FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/database ./database
COPY apps/api/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh
EXPOSE 4000
ENTRYPOINT ["./docker-entrypoint.sh"]
