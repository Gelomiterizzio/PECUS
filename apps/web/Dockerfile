# ─────────────────────────────────────────────────────────
# PECUS Web — Next.js 15 (standalone, build context = repo root)
# ─────────────────────────────────────────────────────────
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

# ---- Dependencias ----
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* .npmrc* turbo.json ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
COPY packages/types/package.json packages/types/
COPY packages/shared/package.json packages/shared/
COPY packages/ui/package.json packages/ui/
RUN pnpm install --no-frozen-lockfile

# ---- Build ----
FROM base AS builder
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Next.js transpila los paquetes del workspace (@pecus/ui|shared|types) en build.
RUN pnpm --filter @pecus/web build

# ---- Runtime ----
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Salida standalone de Next.js: incluye server.js + node_modules mínimos.
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000

# El server.js standalone queda en apps/web/server.js dentro del bundle.
CMD ["node", "apps/web/server.js"]
