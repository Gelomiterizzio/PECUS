# Pruebas — PECUS

Las suites de pruebas viven junto al código de cada aplicación. Esta carpeta
existe como punto de entrada/documentación a nivel de monorepo.

## Backend (`apps/api`)

- **Unitarias / integración** — Jest, junto a cada módulo:
  - `src/cows/cows.service.spec.ts`
  - `src/iot/alerts/alerts.service.spec.ts`
  - `src/insights/insights.logic.spec.ts`
- **E2E** — Supertest sobre la app Nest: `apps/api/test/app.e2e-spec.ts`
  (requiere PostgreSQL en marcha).

```bash
pnpm test                              # unitarias + integración
pnpm --filter @pecus/api test:e2e      # E2E (necesita BD)
pnpm --filter @pecus/api test:cov      # cobertura
```

## Frontend (`apps/web`)

- **E2E** — Playwright: `apps/web/e2e/smoke.spec.ts`
  (levanta Next.js automáticamente; funciona incluso en *modo demo* sin backend).

```bash
pnpm --filter @pecus/web exec playwright install --with-deps chromium
pnpm --filter @pecus/web test:e2e
```

## CI

Todo lo anterior se ejecuta en `.github/workflows/ci.yml`
(jobs: `lint`, `test`, `build`, `e2e`, `playwright`).
