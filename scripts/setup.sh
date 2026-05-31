#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
# PECUS — Script de configuración para desarrollo local
# Uso:  ./scripts/setup.sh
# ─────────────────────────────────────────────────────────
set -euo pipefail

cyan()  { printf "\033[36m%s\033[0m\n" "$1"; }
green() { printf "\033[32m%s\033[0m\n" "$1"; }
yellow(){ printf "\033[33m%s\033[0m\n" "$1"; }
red()   { printf "\033[31m%s\033[0m\n" "$1"; }

cyan "🐄  PECUS — configuración del entorno de desarrollo"
echo

# 1. Verificar Node
if ! command -v node >/dev/null 2>&1; then
  red "✗ Node.js no está instalado. Instala Node.js >= 20 y reintenta."
  exit 1
fi
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 20 ]; then
  red "✗ Se requiere Node.js >= 20 (detectado: $(node -v))."
  exit 1
fi
green "✓ Node.js $(node -v)"

# 2. Verificar / preparar pnpm
if ! command -v pnpm >/dev/null 2>&1; then
  yellow "→ pnpm no encontrado; intentando activarlo con corepack..."
  corepack enable && corepack prepare pnpm@9.12.0 --activate
fi
green "✓ pnpm $(pnpm -v)"

# 3. .env
if [ ! -f .env ]; then
  cp .env.example .env
  green "✓ Archivo .env creado a partir de .env.example"
else
  yellow "→ .env ya existe; no se sobrescribe"
fi

# 4. Dependencias
cyan "→ Instalando dependencias (pnpm install)..."
pnpm install --no-frozen-lockfile
green "✓ Dependencias instaladas"

# 5. Cliente Prisma
cyan "→ Generando cliente Prisma..."
pnpm db:generate
green "✓ Cliente Prisma generado"

echo
green "✅ Listo. Próximos pasos:"
echo
echo "   1) Asegúrate de tener PostgreSQL en marcha (o usa: docker compose up postgres -d)"
echo "   2) Aplica el esquema y siembra datos:"
echo "        pnpm db:migrate"
echo "        pnpm db:seed"
echo "   3) Arranca el proyecto:"
echo "        pnpm dev"
echo
echo "   Frontend → http://localhost:3000"
echo "   API      → http://localhost:4000  (Swagger en /api/docs)"
echo
yellow "   Alternativa todo-en-uno:  docker compose up --build"
