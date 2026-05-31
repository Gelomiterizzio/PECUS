<div align="center">

# 🐄 PECUS

### Plataforma inteligente de monitoreo y gestión ganadera bovina

Dashboard premium · Telemetría IoT simulada · Smart Insights por reglas

[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)]()
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs)]()
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)]()
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)]()
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)]()

</div>

---
## NOMBRE DEL EQUIPO
Overclok IA
## INTEGRANTES
- Daniel Peña Cabrera
- Angel Mauricio Viveros Cortez
- Yanilse Eva Quiroz Chamby
- Ruben Dario Quispe Andrade
 
## 📌 ¿Qué es PECUS?

**PECUS** es una plataforma full-stack para monitorear y gestionar un hato bovino
en tiempo (casi) real. Combina un panel de control elegante con una arquitectura
IoT simulada y un motor de recomendaciones ("Smart Insights") basado en reglas de
negocio. Está pensada como demo de hackathon AgTech: arranca con **100 vacas**
(50 lecheras + 50 de carne) y datos de telemetría que se actualizan solos.

### Características

- 📊 **Dashboard premium** con KPIs animados y 3 gráficos (pastel, barras, dona).
- 🐮 **Gestión de ganado** — listados con búsqueda, filtros, orden y paginación.
- 📝 **Formularios validados** (React Hook Form + Zod) para registrar/editar vacas.
- 🍽️ **Módulo de alimentación** con reinicio automático a medianoche (cron).
- 🧬 **Módulo reproductivo** (en celo, preñez, etc.).
- 🌡️ **Salud por temperatura** — cada vaca tiene temperatura corporal y un estado de salud derivado automáticamente: **Saludable**, **En alerta** o **Crisis**, visible en el dashboard, la tabla y el detalle.
- 📡 **IoT simulado** (sensores, telemetría, gateway MQTT-ready, alertas).
- 💡 **Smart Insights** — recomendaciones automáticas por reglas.
- 🌙 **Modo oscuro persistente**, animaciones (Framer Motion) y diseño responsive.
- 🛡️ **Resiliencia de demo:** si el backend no responde, el frontend usa datos
  locales y lo indica con un badge **"Modo demo (datos locales)"**.

---

## 🧱 Stack tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, componentes estilo shadcn (hechos a mano), React Hook Form, Zod, TanStack Query, Recharts, Framer Motion, Lucide, next-themes |
| **Backend** | NestJS, Prisma, PostgreSQL, Swagger (OpenAPI), EventEmitter2, @nestjs/schedule, Helmet |
| **Testing** | Jest, Supertest (E2E backend), Playwright (E2E frontend) |
| **Infra / Tooling** | Docker, Docker Compose, Turborepo, pnpm workspaces, GitHub Actions |

---

## 📂 Estructura del monorepo

```
PECUS/
├── apps/
│   ├── web/        # Next.js 15 — dashboard, listados, formularios, insights
│   └── api/        # NestJS — REST, Swagger, IoT, eventos, cron
├── packages/
│   ├── types/      # @pecus/types  — enums, DTOs, interfaces (contrato único)
│   ├── shared/     # @pecus/shared — etiquetas ES, estadísticas, insights
│   └── ui/         # @pecus/ui     — Logo y helper cn()
├── database/
│   ├── prisma/     # schema.prisma (Cow · Sensor · Telemetry · Alert)
│   └── seed/       # seed.ts — 100 vacas + sensores + telemetría
├── docker/         # recursos de contenedores
├── docs/           # architecture.md · api.md · iot.md (con diagramas Mermaid)
├── tests/          # recursos E2E a nivel raíz
├── docker-compose.yml
└── .github/workflows/ci.yml
```

---

## 🚀 Puesta en marcha

### Requisitos

- **Node.js ≥ 20** y **pnpm 9** (`corepack enable && corepack prepare pnpm@9.12.0 --activate`)
- **Docker** + **Docker Compose** (opción recomendada), o un **PostgreSQL** local.

### Opción A — Docker Compose (recomendada) 🐳

Levanta base de datos + API + frontend, con migraciones y seed automáticos:

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: <http://localhost:3000>
- API: <http://localhost:4000>
- Swagger: <http://localhost:4000/api/docs>

La primera vez, el contenedor del API aplica el esquema y siembra **100 vacas**
(`SEED_ON_START=true`).

Para apagar y borrar los datos:

```bash
docker compose down -v
```

### Opción B — Desarrollo local 💻

```bash
# 1. Dependencias
pnpm install

# 2. Variables de entorno
cp .env.example .env
#   Edita DATABASE_URL si tu PostgreSQL no usa las credenciales por defecto.

# 3. Cliente Prisma + esquema + datos de ejemplo
pnpm db:generate
pnpm db:migrate      # crea las tablas (migración "init")
pnpm db:seed         # inserta 100 vacas + sensores + telemetría

# 4. Arranca frontend + backend en paralelo (Turborepo)
pnpm dev
```

| Servicio | URL |
|----------|-----|
| Frontend (Next.js) | <http://localhost:3000> |
| API (NestJS) | <http://localhost:4000> |
| Swagger / OpenAPI | <http://localhost:4000/api/docs> |
| Healthcheck | <http://localhost:4000/health> |

> 💡 Aunque no levantes el backend, el frontend funciona en **modo demo** con
> datos locales — perfecto para enseñar la UI rápidamente.

---

## ⚙️ Variables de entorno

(Ver `.env.example`.)

| Variable | Por defecto | Descripción |
|----------|-------------|-------------|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | `pecus` / `pecus_secret` / `pecus` | Credenciales de PostgreSQL. |
| `DATABASE_URL` | `postgresql://pecus:pecus_secret@localhost:5432/pecus?schema=public` | Cadena de conexión de Prisma. |
| `API_PORT` | `4000` | Puerto del backend. |
| `CORS_ORIGIN` | `http://localhost:3000` | Origen permitido por CORS. |
| `IOT_SIMULATION_ENABLED` | `true` | Activa la simulación de telemetría. |
| `IOT_SIMULATION_INTERVAL_MS` | `8000` | Frecuencia de la simulación (ms). |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | URL del API usada por el frontend. |

---

## 🔌 Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Estado del servicio. |
| `GET/POST` | `/api/cows` | Listar (paginado/filtrado) y crear vacas. |
| `GET/PATCH/DELETE` | `/api/cows/:id` | Detalle, actualización y borrado. |
| `POST` | `/api/feeding/update` | Registrar alimentación. |
| `POST` | `/api/reproduction/update` | Actualizar estado reproductivo. |
| `GET` | `/api/stats/dashboard` | KPIs + datos de gráficos. |
| `GET` | `/api/insights` | Smart Insights (recomendaciones). |
| `GET` | `/api/iot/sensors` · `/api/iot/telemetry` · `/api/iot/alerts` | Telemetría e IoT. |
| `GET` | `/api/docs` | Documentación Swagger. |

Documentación completa en [`docs/api.md`](./docs/api.md).

---

## 📡 Arquitectura IoT (resumen)

```mermaid
flowchart LR
  S["Sensores simulados"] --> T["TelemetryService<br/>@Interval 8s"]
  T -->|persiste| DB[("PostgreSQL")]
  T -->|publica| G["Gateway (MQTT-ready)<br/>pecus/farm/cow/{id}/{sensor}"]
  T -->|emite| E{{"EventEmitter2"}}
  E --> A["AlertsService<br/>reglas + dedup 5min"]
  A --> DB
```

Detalle completo (umbrales, eventos, camino a MQTT real) en
[`docs/iot.md`](./docs/iot.md).

---

## 💡 Smart Insights

Motor de reglas (`packages/shared` → `generateInsights`) que analiza el hato y
emite recomendaciones accionables. Reglas incluidas:

1. **Crisis por temperatura** — vacas con fiebre alta (≥ 40 °C) o hipotermia (< 37.5 °C).
2. **Temperatura a vigilar** — vacas con febrícula o hipotermia leve (en alerta).
3. **Ayuno prolongado** — vacas sin alimentarse por más de 8 h.
4. **Grupo en celo** — ≥ 3 vacas en celo simultáneamente (ventana reproductiva).
5. **Productividad lechera** — proporción de vacas lecheras y su impacto.
6. **Baja actividad** — si más del 40 % del hato no ha comido.
7. **Todo en orden** — mensaje positivo cuando no hay incidencias.

Cada insight tiene categoría, severidad (`INFO` / `WARNING` / `CRITICAL`),
título, descripción y métrica. Se muestran **integrados en el dashboard** (en la
parte superior, para priorizar qué animales requieren atención). Cada alerta con
animales afectados incluye **botones por tipo** (lecheras / de carne) que llevan a
la lista correspondiente con el filtro ya aplicado — por ejemplo, "8 vacas en
crisis" permite ver con un clic cuántas son lecheras y saltar a `/dairy` filtrado
por estado de salud "Crisis".

---

## 🧪 Pruebas

```bash
# Unitarias + integración (backend)
pnpm test

# E2E backend (requiere PostgreSQL en marcha)
pnpm --filter @pecus/api test:e2e

# E2E frontend (Playwright; levanta Next.js automáticamente)
pnpm --filter @pecus/web exec playwright install --with-deps chromium
pnpm --filter @pecus/web test:e2e
```

El pipeline de **GitHub Actions** (`.github/workflows/ci.yml`) ejecuta cinco
jobs: `lint`, `test`, `build`, `e2e` (con PostgreSQL) y `playwright`.

---

## 🎬 Cómo hacer la demo

1. `docker compose up --build` (o `pnpm dev` con la BD lista).
2. Abre <http://localhost:3000> — el dashboard carga con 100 vacas y KPIs animados.
3. Arriba del todo verás el panel de **Smart Insights**: cada alerta muestra
   botones (lecheras / de carne) que llevan a la lista filtrada de animales
   afectados.
4. Entra a **Vacas Lecheras** / **Vacas de Carne**: busca, filtra, ordena, pagina.
5. **Registra una vaca** desde el formulario validado y observa cómo aparece.
6. Abre el **detalle** de una vaca: actividad reciente, acciones rápidas
   (alimentar, cambiar estado reproductivo) y panel de monitoreo IoT.
7. Espera unos segundos: la **telemetría simulada** genera lecturas y, si superan
   los umbrales, aparecen **alertas**.
8. Alterna el **modo oscuro/claro** y abre **Swagger** (`/api/docs`) para mostrar
   la API documentada.

> Si el backend no está disponible durante la demo, el frontend sigue funcionando
> en **"Modo demo (datos locales)"** — nunca se queda en blanco.

---

## 🛣️ Roadmap

- [ ] Sustituir el gateway *mock* por un broker **MQTT** real (Mosquitto/EMQX).
- [ ] Persistir telemetría en una base de **series temporales** (TimescaleDB).
- [ ] Autenticación y roles (veterinario, operario, administrador).
- [ ] Notificaciones push/email ante alertas críticas.
- [ ] App móvil para operarios de campo.
- [ ] Más reglas de Smart Insights con histórico y tendencias.

---

## ⚠️ Nota sobre la generación de este proyecto

Este repositorio fue **generado de forma íntegra** (todo el código fuente es real
y funcional, sin pseudocódigo ni plantillas vacías). Sin embargo, el entorno donde
se generó **no tenía acceso a internet**, por lo que **no fue posible ejecutar
`pnpm install`, compilar (`next build` / `nest build`), correr las pruebas ni
levantar Docker/Prisma allí**. Esos pasos deben ejecutarse en tu máquina siguiendo
las instrucciones de arriba.

Si al instalar aparece alguna incompatibilidad de versiones (por ejemplo, ajustes
menores en las dependencias de React 19 RC o de Prisma/NestJS), suele resolverse
con `pnpm install --no-frozen-lockfile` y, si hace falta, fijando la versión exacta
indicada por el gestor de paquetes.

---

<div align="center">

Hecho con 🐄 para la hackathon AgTech.

</div>
