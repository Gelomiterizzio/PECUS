import {
  AlertSeverity,
  CowType,
  FeedingStatus,
  HealthStatus,
  ReproductiveStatus,
} from '@pecus/types';
import type { BadgeProps } from '@/components/ui/badge';

/** Variante de Badge según estado de alimentación. */
export function feedingVariant(status: FeedingStatus): BadgeProps['variant'] {
  return status === FeedingStatus.FED ? 'success' : 'warning';
}

/** Variante de Badge según estado reproductivo. */
export function reproductiveVariant(
  status: ReproductiveStatus,
): BadgeProps['variant'] {
  switch (status) {
    case ReproductiveStatus.IN_HEAT:
      return 'warning';
    case ReproductiveStatus.PREGNANT:
      return 'tech';
    default:
      return 'secondary';
  }
}

/** Variante de Badge según tipo de vaca. */
export function cowTypeVariant(type: CowType): BadgeProps['variant'] {
  return type === CowType.DAIRY ? 'tech' : 'default';
}

/** Variante de Badge según severidad de insight/alerta. */
export function severityVariant(
  severity: AlertSeverity,
): BadgeProps['variant'] {
  switch (severity) {
    case AlertSeverity.CRITICAL:
      return 'destructive';
    case AlertSeverity.WARNING:
      return 'warning';
    default:
      return 'info';
  }
}

/** Variante de Badge según estado de salud (temperatura). */
export function healthVariant(status: HealthStatus): BadgeProps['variant'] {
  switch (status) {
    case HealthStatus.HEALTHY:
      return 'success';
    case HealthStatus.WATCH:
      return 'warning';
    case HealthStatus.CRITICAL:
      return 'destructive';
    default:
      return 'secondary';
  }
}

/** Acento (color) para tarjetas/íconos según estado de salud. */
export function healthAccent(
  status: HealthStatus,
): 'success' | 'warning' | 'destructive' {
  return status === HealthStatus.HEALTHY
    ? 'success'
    : status === HealthStatus.WATCH
      ? 'warning'
      : 'destructive';
}

/** Formatea una temperatura: 38.6 -> "38.6 °C". */
export function formatTemp(t: number | null | undefined): string {
  if (t == null || Number.isNaN(t)) return '—';
  return `${t.toFixed(1)} °C`;
}

/** Color HSL (vía CSS var) para series de gráficos. */
export const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  tech: 'hsl(var(--tech))',
  warning: 'hsl(var(--warning))',
  muted: 'hsl(var(--muted-foreground))',
  success: 'hsl(var(--success))',
  destructive: 'hsl(var(--destructive))',
};

export const FEEDING_COLORS = [CHART_COLORS.success, CHART_COLORS.warning];
export const REPRODUCTION_COLORS = [
  CHART_COLORS.muted,
  CHART_COLORS.warning,
  CHART_COLORS.tech,
];
export const DISTRIBUTION_COLORS = [CHART_COLORS.tech, CHART_COLORS.primary];
export const HEALTH_COLORS = [
  CHART_COLORS.success, // Saludable
  CHART_COLORS.warning, // En alerta
  CHART_COLORS.destructive, // Crisis
];

/** Saluda según la hora del día. */
export function greeting(now: Date = new Date()): string {
  const h = now.getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}
