import type { Metadata, Viewport } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { AppShell } from '@/components/layout/app-shell';

// PECUS es un panel en vivo que depende de datos en tiempo de ejecución (API o
// fallback mock en el cliente). No hay nada útil que prerenderizar de forma
// estática, y forzar el render dinámico evita que `next build` intente exportar
// estáticamente las páginas (paso que fallaba en el contenedor sin BD).
export const dynamic = 'force-dynamic';

const display = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const body = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'PECUS — Monitoreo Ganadero Inteligente',
    template: '%s · PECUS',
  },
  description:
    'Plataforma AgTech para monitoreo y gestión inteligente de ganado bovino. Alimentación, reproducción, telemetría IoT y Smart Insights en tiempo real.',
  keywords: ['AgTech', 'ganadería', 'IoT', 'monitoreo', 'bovino', 'PECUS'],
  authors: [{ name: 'PECUS Team' }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#05140d' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} font-sans`}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
