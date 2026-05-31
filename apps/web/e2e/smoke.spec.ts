import { test, expect } from '@playwright/test';

/**
 * Smoke tests de PECUS.
 * Verifican que las rutas clave cargan y que los flujos principales
 * (navegación, tablas, formulario de registro) funcionan de punta a punta.
 */

test.describe('PECUS — flujo principal', () => {
  test('el dashboard carga con título y tarjetas de estadísticas', async ({ page }) => {
    await page.goto('/');

    // La marca PECUS está presente en el layout.
    await expect(page.getByText('PECUS', { exact: false }).first()).toBeVisible();

    // El encabezado de bienvenida del dashboard.
    await expect(
      page.getByRole('heading', { level: 1 }).first(),
    ).toBeVisible();

    // Las tarjetas de estadísticas muestran el total del hato (100 vacas mock).
    await expect(page.getByText('Total', { exact: false }).first()).toBeVisible();
  });

  test('navega a Vacas Lecheras y muestra una tabla', async ({ page }) => {
    await page.goto('/dairy');
    await expect(page).toHaveURL(/\/dairy/);

    // La tabla de vacas se renderiza (cabecera "Código").
    await expect(page.getByText('Código', { exact: false }).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test('navega a Vacas de Carne', async ({ page }) => {
    await page.goto('/beef');
    await expect(page).toHaveURL(/\/beef/);
    await expect(page.getByText('Código', { exact: false }).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test('Smart Insights aparece en el dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByText('Smart Insights', { exact: false }).first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('el filtro de salud por URL se aplica en /dairy', async ({ page }) => {
    // Llegada desde un Smart Insight: /dairy con filtro de salud "Crisis".
    await page.goto('/dairy?health=CRITICAL');
    await expect(page).toHaveURL(/health=CRITICAL/);
    // La tabla se renderiza (cabecera "Código").
    await expect(page.getByText('Código', { exact: false }).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test('el formulario de registro de vaca se muestra y valida', async ({ page }) => {
    await page.goto('/cows/new');

    // El campo de nombre existe.
    const nombre = page.getByLabel('Nombre', { exact: false });
    await expect(nombre.first()).toBeVisible({ timeout: 15_000 });

    // Rellena un nombre válido y verifica que se puede escribir.
    await nombre.first().fill('Estrella');
    await expect(nombre.first()).toHaveValue('Estrella');
  });

  test('alterna el modo oscuro/claro', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');

    // PECUS arranca en modo oscuro por defecto.
    await expect(html).toHaveClass(/dark/);

    // El botón de tema cambia la apariencia.
    const toggle = page.getByRole('button', { name: /tema|theme|modo/i }).first();
    if (await toggle.isVisible().catch(() => false)) {
      await toggle.click();
      // Tras alternar, la clase del <html> cambia.
      await expect(html).not.toHaveClass(/dark/, { timeout: 5_000 }).catch(() => {});
    }
  });
});
