import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Compila los paquetes del monorepo (código TS sin transpilar)
  transpilePackages: ['@pecus/ui', '@pecus/shared', '@pecus/types'],
  output: 'standalone',
  // En un monorepo, fija la raíz de trazado al root del repo para que la salida
  // standalone quede en `.next/standalone/apps/web/server.js` (lo que espera el Dockerfile).
  outputFileTracingRoot: path.join(__dirname, '../../'),
  eslint: { ignoreDuringBuilds: false },
};

export default nextConfig;
