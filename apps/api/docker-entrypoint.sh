#!/bin/sh
set -e
echo "🐄  PECUS API — aplicando esquema de base de datos..."
# Intenta migraciones; si no existen, sincroniza el esquema (db push) — ideal para demo.
npx prisma migrate deploy --schema=database/prisma/schema.prisma \
  || npx prisma db push --schema=database/prisma/schema.prisma --accept-data-loss

if [ "$SEED_ON_START" = "true" ]; then
  echo "🌱  Ejecutando seed..."
  # Opciones de compilación explícitas: el entrypoint corre desde /app y no hay
  # tsconfig en la raíz, así que fijamos module/target/esModuleInterop a mano.
  npx ts-node --transpile-only \
    --compiler-options '{"module":"commonjs","target":"ES2021","esModuleInterop":true,"skipLibCheck":true}' \
    database/seed/seed.ts || echo "Seed omitido (la app sigue funcionando)."
fi

echo "🚀  Iniciando API..."
exec node apps/api/dist/main.js
