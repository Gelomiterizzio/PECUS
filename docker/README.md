# Docker — PECUS

La orquestación principal vive en el **`docker-compose.yml`** de la raíz del
repositorio, que levanta tres servicios:

| Servicio | Imagen / Build | Puerto |
|----------|----------------|--------|
| `postgres` | `postgres:16-alpine` | 5432 |
| `api` | `apps/api/Dockerfile` (NestJS + Prisma) | 4000 |
| `web` | `apps/web/Dockerfile` (Next.js 15 standalone) | 3000 |

## Uso rápido

```bash
# Desde la raíz del repo
cp .env.example .env
docker compose up --build      # construye y levanta todo
docker compose down -v         # apaga y borra el volumen de datos
```

## Detalles

- **Migración + seed automáticos:** el contenedor `api` ejecuta
  `apps/api/docker-entrypoint.sh`, que aplica el esquema Prisma y, si
  `SEED_ON_START=true`, siembra 100 vacas la primera vez.
- **Build de imágenes con contexto de monorepo:** ambos Dockerfiles usan el
  **root del repo** como contexto para resolver los paquetes `@pecus/*` del
  workspace. Por eso `docker compose` se ejecuta desde la raíz.
- **Frontend standalone:** la imagen web usa la salida `output: 'standalone'`
  de Next.js, que empaqueta solo lo necesario para `node apps/web/server.js`.
- **Variable pública del frontend:** `NEXT_PUBLIC_API_URL` se "hornea" en tiempo
  de build (argumento `args` del servicio `web`), apuntando al API expuesto en el
  host (`http://localhost:4000`).
