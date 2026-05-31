# API REST — PECUS

Backend **NestJS** con prefijo global `/api` (excepto `/health`).
Documentación interactiva **Swagger** disponible en:

```
http://localhost:4000/api/docs
```

## Convención de respuestas

Todas las respuestas pasan por un *interceptor* que las envuelve:

```jsonc
// Éxito
{ "success": true, "data": { /* ... */ } }

// Éxito con paginación
{ "success": true, "data": [ /* ... */ ], "meta": { "page": 1, "limit": 10, "total": 100, "totalPages": 10 } }

// Error (filtro de excepciones global)
{ "success": false, "statusCode": 404, "path": "/api/cows/x", "timestamp": "2026-05-30T...", "message": "Cow not found" }
```

---

## Salud del servicio

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Estado del servicio (sin prefijo `/api`). |

```bash
curl http://localhost:4000/health
```

---

## Ganado — `/api/cows`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/cows` | Crea una vaca (código autoincremental). |
| `GET` | `/api/cows` | Lista paginada con búsqueda, filtros y orden. |
| `GET` | `/api/cows/:id` | Detalle con sensores, alertas y telemetría. |
| `PATCH` | `/api/cows/:id` | Actualiza datos de la vaca. |
| `DELETE` | `/api/cows/:id` | Elimina una vaca. |

**Parámetros de consulta (`GET /api/cows`):**

| Parámetro | Tipo | Por defecto | Notas |
|-----------|------|-------------|-------|
| `page` | int ≥ 1 | `1` | Página. |
| `limit` | int 1–100 | `10` | Tamaño de página. |
| `search` | string | — | Por nombre o código. |
| `tipoVaca` | `DAIRY \| BEEF` | — | Filtro por tipo. |
| `estadoAlimentacion` | `FED \| NOT_FED` | — | Filtro por alimentación. |
| `estadoReproductivo` | `NOT_IN_HEAT \| IN_HEAT \| PREGNANT` | — | Filtro reproductivo. |
| `sortBy` | `codigoVaca \| nombre \| ultimaAlimentacion \| temperatura` | `codigoVaca` | Campo de orden. |
| `sortOrder` | `asc \| desc` | `asc` | Sentido. |
| `healthStatus` | `HEALTHY \| WATCH \| CRITICAL` | — | Filtro por estado de salud (derivado de la temperatura). |

**Crear vaca:**

```bash
curl -X POST http://localhost:4000/api/cows \
  -H "Content-Type: application/json" \
  -d '{ "nombre": "Lola M", "tipoVaca": "DAIRY", "temperatura": 38.7 }'
```

```jsonc
// Cuerpo (CreateCowDto)
{
  "nombre": "Lola M",                  // 2–60 caracteres (requerido)
  "tipoVaca": "DAIRY",                 // DAIRY | BEEF (requerido)
  "estadoReproductivo": "NOT_IN_HEAT", // opcional
  "estadoAlimentacion": "NOT_FED",     // opcional
  "temperatura": 38.7                  // opcional (°C, 30–45); por defecto 38.6
}
```

> El **estado de salud** (Saludable / En alerta / Crisis) se deriva de la
> temperatura: saludable 38.0–39.2 °C, en alerta 37.5–37.9 o 39.3–39.9 °C,
> crisis < 37.5 o ≥ 40.0 °C.

---

## Alimentación — `/api/feeding`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/feeding/update` | Registra alimentación y emite evento. |

```bash
curl -X POST http://localhost:4000/api/feeding/update \
  -H "Content-Type: application/json" \
  -d '{ "cowId": "<id>", "estado": "FED" }'
```

> Un **cron job** (`@Cron` a medianoche) reinicia automáticamente el estado de
> alimentación de todo el hato a `NOT_FED` cada día.

---

## Reproducción — `/api/reproduction`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/reproduction/update` | Actualiza estado reproductivo y emite evento. |

```bash
curl -X POST http://localhost:4000/api/reproduction/update \
  -H "Content-Type: application/json" \
  -d '{ "cowId": "<id>", "estado": "IN_HEAT" }'
```

---

## Estadísticas — `/api/stats`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/stats/dashboard` | KPIs + datos para los 3 gráficos. |

```jsonc
{
  "success": true,
  "data": {
    "stats": { "total": 100, "dairy": 50, "beef": 50, "fed": 0, "notFed": 100, "inHeat": 12, "pregnant": 18, "healthy": 78, "watch": 14, "critical": 8, "avgTemperature": 38.7 },
    "charts": {
      "feeding":     [ { "name": "Comió", "value": 0 }, { "name": "No ha comido", "value": 100 } ],
      "reproduction":[ { "name": "No está en celo", "value": 70 }, /* ... */ ],
      "distribution":[ { "name": "Vaca Lechera", "value": 50 }, { "name": "Vaca de Carne", "value": 50 } ],
      "health":      [ { "name": "Saludable", "value": 78 }, { "name": "En alerta", "value": 14 }, { "name": "Crisis", "value": 8 } ]
    }
  }
}
```

---

## Smart Insights — `/api/insights`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/insights` | Recomendaciones generadas por reglas. |

Devuelve un arreglo de `SmartInsight` (categoría, severidad `INFO/WARNING/CRITICAL`,
título, descripción y métrica). Ver la lógica en [`iot.md`](./iot.md) y en
`packages/shared` (`generateInsights`).

---

## IoT — `/api/iot`

### Sensores — `/api/iot/sensors`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/iot/sensors` | Lista de sensores. |
| `GET` | `/api/iot/sensors/summary` | Resumen por tipo/estado. |
| `GET` | `/api/iot/sensors/cow/:cowId` | Sensores de una vaca. |

### Telemetría — `/api/iot/telemetry`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/iot/telemetry` | Lecturas recientes. |
| `GET` | `/api/iot/telemetry/latest` | Última lectura por sensor. |
| `POST` | `/api/iot/telemetry/ingest` | Ingesta una lectura (simulada o real). |

### Alertas — `/api/iot/alerts`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/iot/alerts` | Alertas (filtrable). |
| `GET` | `/api/iot/alerts/summary` | Conteo por severidad. |
| `PATCH` | `/api/iot/alerts/:id/resolve` | Marca una alerta como resuelta. |

> La telemetría se simula cada `IOT_SIMULATION_INTERVAL_MS` (8 s por defecto).
> Cada lectura emite un evento que el módulo de alertas evalúa contra umbrales
> (temperatura ≥ 39.5 °C → `CRITICAL`, actividad alta → `POSSIBLE_HEAT`), con
> *deduplicación* de 5 minutos. Detalles en [`iot.md`](./iot.md).
