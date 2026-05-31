import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración E2E de Playwright para el frontend de PECUS.
 *
 * El frontend degrada con gracia a datos mock locales cuando el API no
 * responde (ver src/lib/api.ts), por lo que estos smoke tests se ejecutan
 * de forma fiable incluso sin backend — ideal para CI.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Levanta el servidor de desarrollo de Next.js antes de las pruebas.
  webServer: {
    command: 'pnpm exec next dev -p 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
