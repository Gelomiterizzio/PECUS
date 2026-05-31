/**
 * @pecus/shared — Utilidades de dominio puras, sin dependencias de framework.
 * Reutilizadas por frontend y backend.
 */
import {
  CowType,
  FeedingStatus,
  ReproductiveStatus,
  AlertSeverity,
  HealthStatus,
  type Cow,
  type CowHealth,
  type DashboardStats,
  type SmartInsight,
  type InsightBreakdown,
  type InsightFilter,
} from '@pecus/types';

/* ───────────────── Etiquetas en español ───────────────── */

export const COW_TYPE_LABELS: Record<CowType, string> = {
  [CowType.DAIRY]: 'Vaca Lechera',
  [CowType.BEEF]: 'Vaca de Carne',
};

export const FEEDING_LABELS: Record<FeedingStatus, string> = {
  [FeedingStatus.FED]: 'Comió',
  [FeedingStatus.NOT_FED]: 'No ha comido',
};

export const REPRODUCTIVE_LABELS: Record<ReproductiveStatus, string> = {
  [ReproductiveStatus.NOT_IN_HEAT]: 'No está en celo',
  [ReproductiveStatus.IN_HEAT]: 'Está en celo',
  [ReproductiveStatus.PREGNANT]: 'Está embarazada',
};

export const HEALTH_LABELS: Record<HealthStatus, string> = {
  [HealthStatus.HEALTHY]: 'Saludable',
  [HealthStatus.WATCH]: 'En alerta',
  [HealthStatus.CRITICAL]: 'Crisis',
};

/* ───────────────── Salud por temperatura corporal ───────────────── */

/**
 * Umbrales de temperatura rectal bovina (°C). Centralizados para ajuste sencillo.
 *   • Saludable: 38.0 – 39.2
 *   • En alerta: 37.5 – 37.9  (hipotermia leve)  ó  39.3 – 39.9 (febrícula)
 *   • Crisis:    < 37.5 (hipotermia)  ó  ≥ 40.0 (fiebre alta)
 */
export const HEALTH_THRESHOLDS = {
  HEALTHY_MIN: 38.0,
  HEALTHY_MAX: 39.2,
  CRITICAL_LOW: 37.5,
  CRITICAL_HIGH: 40.0,
} as const;

/** Temperatura por defecto (saludable) para vacas nuevas sin lectura. */
export const DEFAULT_TEMPERATURE = 38.6;

/** Evalúa el estado de salud de una vaca a partir de su temperatura. */
export function evaluateHealth(temperatura: number): CowHealth {
  const t = Number.isFinite(temperatura) ? temperatura : DEFAULT_TEMPERATURE;

  if (t >= HEALTH_THRESHOLDS.CRITICAL_HIGH) {
    return {
      status: HealthStatus.CRITICAL,
      severity: AlertSeverity.CRITICAL,
      label: HEALTH_LABELS.CRITICAL,
      description: `Fiebre alta (${t.toFixed(1)} °C). Requiere atención veterinaria inmediata.`,
      temperatura: t,
    };
  }
  if (t < HEALTH_THRESHOLDS.CRITICAL_LOW) {
    return {
      status: HealthStatus.CRITICAL,
      severity: AlertSeverity.CRITICAL,
      label: HEALTH_LABELS.CRITICAL,
      description: `Hipotermia (${t.toFixed(1)} °C). Requiere atención veterinaria inmediata.`,
      temperatura: t,
    };
  }
  if (t >= HEALTH_THRESHOLDS.HEALTHY_MIN && t <= HEALTH_THRESHOLDS.HEALTHY_MAX) {
    return {
      status: HealthStatus.HEALTHY,
      severity: AlertSeverity.INFO,
      label: HEALTH_LABELS.HEALTHY,
      description: `Temperatura normal (${t.toFixed(1)} °C). Estado saludable.`,
      temperatura: t,
    };
  }
  return {
    status: HealthStatus.WATCH,
    severity: AlertSeverity.WARNING,
    label: HEALTH_LABELS.WATCH,
    description:
      t < HEALTH_THRESHOLDS.HEALTHY_MIN
        ? `Temperatura ligeramente baja (${t.toFixed(1)} °C). Mantener en observación.`
        : `Temperatura ligeramente elevada (${t.toFixed(1)} °C). Mantener en observación.`,
    temperatura: t,
  };
}

/** Atajo: solo el nivel de salud (HEALTHY | WATCH | CRITICAL). */
export function healthStatusOf(temperatura: number): HealthStatus {
  return evaluateHealth(temperatura).status;
}

/* ───────────────── Código de vaca ───────────────── */

/** Formatea un número incremental como código de 6 dígitos: 1 -> "000001". */
export function formatCowCode(sequence: number): string {
  return String(sequence).padStart(6, '0');
}

/** Calcula el siguiente código a partir del último conocido. */
export function nextCowCode(lastCode: string | null | undefined): string {
  const current = lastCode ? parseInt(lastCode, 10) || 0 : 0;
  return formatCowCode(current + 1);
}

/* ───────────────── Tiempo relativo ("Hace 5 minutos") ───────────────── */

export function timeAgo(date: string | Date | null | undefined, now: Date = new Date()): string {
  if (!date) return 'Sin registro';
  const then = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - then.getTime();
  if (diffMs < 0) return 'Ahora mismo';

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 45) return 'Hace unos segundos';
  if (minutes < 2) return 'Hace 1 minuto';
  if (minutes < 60) return `Hace ${minutes} minutos`;
  if (hours < 2) return 'Hace 1 hora';
  if (hours < 24) return `Hace ${hours} horas`;
  if (days < 2) return 'Ayer';
  return `Hace ${days} días`;
}

/** Horas transcurridas desde una fecha (para reglas de insights). */
export function hoursSince(date: string | Date | null | undefined, now: Date = new Date()): number {
  if (!date) return Infinity;
  const then = typeof date === 'string' ? new Date(date) : date;
  return (now.getTime() - then.getTime()) / 36e5;
}

/* ───────────────── Estadísticas del dashboard ───────────────── */

export function computeStats(cows: Cow[]): DashboardStats {
  const healthy = cows.filter((c) => healthStatusOf(c.temperatura) === HealthStatus.HEALTHY).length;
  const watch = cows.filter((c) => healthStatusOf(c.temperatura) === HealthStatus.WATCH).length;
  const critical = cows.filter((c) => healthStatusOf(c.temperatura) === HealthStatus.CRITICAL).length;
  const tempSum = cows.reduce((s, c) => s + (Number.isFinite(c.temperatura) ? c.temperatura : 0), 0);

  return {
    total: cows.length,
    dairy: cows.filter((c) => c.tipoVaca === CowType.DAIRY).length,
    beef: cows.filter((c) => c.tipoVaca === CowType.BEEF).length,
    fedToday: cows.filter((c) => c.estadoAlimentacion === FeedingStatus.FED).length,
    notFedToday: cows.filter((c) => c.estadoAlimentacion === FeedingStatus.NOT_FED).length,
    inHeat: cows.filter((c) => c.estadoReproductivo === ReproductiveStatus.IN_HEAT).length,
    pregnant: cows.filter((c) => c.estadoReproductivo === ReproductiveStatus.PREGNANT).length,
    healthy,
    watch,
    critical,
    avgTemperature: cows.length ? Math.round((tempSum / cows.length) * 10) / 10 : 0,
  };
}

/* ───────────────── Motor de Smart Insights (reglas) ───────────────── */

/**
 * Reglas inteligentes (heurísticas explicables) que generan recomendaciones
 * a partir del estado del rebaño. Determinístico → ideal para demo.
 */
/** Construye el desglose por tipo (lecheras/carne) de un subconjunto de vacas. */
function buildBreakdown(affected: Cow[], filter: InsightFilter): InsightBreakdown {
  return {
    dairy: affected.filter((c) => c.tipoVaca === CowType.DAIRY).length,
    beef: affected.filter((c) => c.tipoVaca === CowType.BEEF).length,
    filter,
  };
}

export function generateInsights(cows: Cow[], now: Date = new Date()): SmartInsight[] {
  const insights: SmartInsight[] = [];
  const stats = computeStats(cows);

  // 1. Vacas en CRISIS por temperatura (fiebre alta o hipotermia)
  const critical = cows.filter((c) => healthStatusOf(c.temperatura) === HealthStatus.CRITICAL);
  if (critical.length > 0) {
    const codes = critical
      .slice(0, 3)
      .map((c) => c.codigoVaca)
      .join(', ');
    insights.push({
      id: 'health-critical-temp',
      title: `${critical.length} vaca${critical.length > 1 ? 's' : ''} en crisis por temperatura`,
      description: `Temperatura fuera del rango seguro (${codes}${critical.length > 3 ? '…' : ''}). Requiere revisión veterinaria inmediata.`,
      severity: AlertSeverity.CRITICAL,
      category: 'health',
      metric: `${critical.length} crítica${critical.length > 1 ? 's' : ''}`,
      breakdown: buildBreakdown(critical, { healthStatus: HealthStatus.CRITICAL }),
    });
  }

  // 2. Vacas EN ALERTA por temperatura (febrícula o hipotermia leve)
  const watch = cows.filter((c) => healthStatusOf(c.temperatura) === HealthStatus.WATCH);
  if (watch.length > 0) {
    insights.push({
      id: 'health-watch-temp',
      title: `${watch.length} vaca${watch.length > 1 ? 's' : ''} con temperatura a vigilar`,
      description:
        'Temperatura ligeramente fuera del rango normal. Mantener en observación y volver a medir en unas horas.',
      severity: AlertSeverity.WARNING,
      category: 'health',
      metric: `${watch.length} en alerta`,
      breakdown: buildBreakdown(watch, { healthStatus: HealthStatus.WATCH }),
    });
  }

  // 3. Vacas con ayuno prolongado (> 8h)
  const starving = cows.filter(
    (c) => c.estadoAlimentacion === FeedingStatus.NOT_FED && hoursSince(c.ultimaAlimentacion, now) > 8,
  );
  if (starving.length > 0) {
    insights.push({
      id: 'feeding-long-fast',
      title: `${starving.length} vaca${starving.length > 1 ? 's' : ''} sin comer hace más de 8 horas`,
      description:
        'Se recomienda priorizar la alimentación de estos animales para evitar pérdida de peso y caída en la producción.',
      severity: starving.length > 5 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
      category: 'feeding',
      metric: `${starving.length} animales`,
      breakdown: buildBreakdown(starving, { estadoAlimentacion: FeedingStatus.NOT_FED }),
    });
  }

  // 4. Grupo en celo
  const inHeatCows = cows.filter((c) => c.estadoReproductivo === ReproductiveStatus.IN_HEAT);
  if (inHeatCows.length >= 3) {
    insights.push({
      id: 'repro-heat-cluster',
      title: 'Posible grupo en celo detectado',
      description: `Hay ${inHeatCows.length} vacas en celo simultáneamente. Es una ventana óptima para inseminación o servicio.`,
      severity: AlertSeverity.WARNING,
      category: 'reproduction',
      metric: `${inHeatCows.length} en celo`,
      breakdown: buildBreakdown(inHeatCows, { estadoReproductivo: ReproductiveStatus.IN_HEAT }),
    });
  }

  // 3. Productividad estimada
  const fedRatio = stats.total ? stats.fedToday / stats.total : 0;
  if (fedRatio >= 0.85) {
    const gain = Math.round((fedRatio - 0.7) * 80);
    insights.push({
      id: 'prod-up',
      title: `La productividad estimada podría aumentar un ${Math.max(8, gain)}%`,
      description:
        'El alto cumplimiento de alimentación se correlaciona con mayor rendimiento lácteo y ganancia de peso.',
      severity: AlertSeverity.INFO,
      category: 'productivity',
      metric: `+${Math.max(8, gain)}%`,
    });
  }

  // 4. Disminución de actividad (proxy: muchas no alimentadas)
  if (stats.notFedToday > stats.total * 0.4 && stats.total > 0) {
    insights.push({
      id: 'activity-drop',
      title: 'Se detectó una posible disminución de actividad',
      description:
        'Un porcentaje elevado del rebaño no ha sido alimentado. Verifique comederos, disponibilidad de agua y estado general.',
      severity: AlertSeverity.WARNING,
      category: 'health',
      metric: `${stats.notFedToday}/${stats.total}`,
    });
  }

  // Mensaje positivo si todo está bien
  if (insights.length === 0 && stats.total > 0) {
    insights.push({
      id: 'all-good',
      title: 'Rebaño en condiciones óptimas',
      description:
        'No se detectaron anomalías de temperatura, alimentación ni reproducción. El monitoreo continúa en tiempo real.',
      severity: AlertSeverity.INFO,
      category: 'health',
      metric: '100% OK',
    });
  }

  return insights;
}

/* ───────────────── Helpers de gráficos ───────────────── */

export function feedingChartData(stats: DashboardStats) {
  return [
    { key: 'fed', name: 'Comió', value: stats.fedToday },
    { key: 'notFed', name: 'No ha comido', value: stats.notFedToday },
  ];
}

export function reproductionChartData(cows: Cow[]) {
  return [
    {
      key: 'notInHeat',
      name: 'No está en celo',
      value: cows.filter((c) => c.estadoReproductivo === ReproductiveStatus.NOT_IN_HEAT).length,
    },
    {
      key: 'inHeat',
      name: 'Está en celo',
      value: cows.filter((c) => c.estadoReproductivo === ReproductiveStatus.IN_HEAT).length,
    },
    {
      key: 'pregnant',
      name: 'Está embarazada',
      value: cows.filter((c) => c.estadoReproductivo === ReproductiveStatus.PREGNANT).length,
    },
  ];
}

export function distributionChartData(stats: DashboardStats) {
  return [
    { key: 'dairy', name: 'Lecheras', value: stats.dairy },
    { key: 'beef', name: 'De carne', value: stats.beef },
  ];
}

export function healthChartData(stats: DashboardStats) {
  return [
    { key: 'healthy', name: 'Saludable', value: stats.healthy },
    { key: 'watch', name: 'En alerta', value: stats.watch },
    { key: 'critical', name: 'Crisis', value: stats.critical },
  ];
}
