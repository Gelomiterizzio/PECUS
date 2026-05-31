'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Activity,
  Beef,
  HeartPulse,
  Milk,
  Sparkles,
  TrendingUp,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import {
  AlertSeverity,
  CowType,
  type InsightFilter,
  type SmartInsight,
} from '@pecus/types';
import { Badge } from '@/components/ui';
import { cn } from '@pecus/ui';
import { severityVariant } from '@/lib/utils';

const CATEGORY_ICON: Record<SmartInsight['category'], LucideIcon> = {
  feeding: Utensils,
  reproduction: HeartPulse,
  health: Activity,
  productivity: TrendingUp,
};

const SEVERITY_LABEL: Record<AlertSeverity, string> = {
  [AlertSeverity.CRITICAL]: 'Crítico',
  [AlertSeverity.WARNING]: 'Atención',
  [AlertSeverity.INFO]: 'Información',
};

const ACCENT_BAR: Record<AlertSeverity, string> = {
  [AlertSeverity.CRITICAL]: 'bg-destructive',
  [AlertSeverity.WARNING]: 'bg-warning',
  [AlertSeverity.INFO]: 'bg-tech',
};

/** Convierte un filtro de insight en query string para /dairy o /beef. */
function filterToQuery(filter: InsightFilter): string {
  const p = new URLSearchParams();
  if (filter.healthStatus) p.set('health', filter.healthStatus);
  if (filter.estadoAlimentacion) p.set('feeding', filter.estadoAlimentacion);
  if (filter.estadoReproductivo) p.set('repro', filter.estadoReproductivo);
  const qs = p.toString();
  return qs ? `?${qs}` : '';
}

export function InsightCard({
  insight,
  index = 0,
}: {
  insight: SmartInsight;
  index?: number;
}) {
  const router = useRouter();
  const Icon = CATEGORY_ICON[insight.category] ?? Sparkles;
  const breakdown = insight.breakdown;

  const go = (type: CowType) => {
    const base = type === CowType.DAIRY ? '/dairy' : '/beef';
    router.push(`${base}${breakdown ? filterToQuery(breakdown.filter) : ''}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="card-hover group relative overflow-hidden rounded-xl border border-border bg-card p-4"
    >
      <span
        className={cn(
          'absolute inset-y-0 left-0 w-1',
          ACCENT_BAR[insight.severity],
        )}
      />
      <div className="flex items-start gap-3 pl-2">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground transition-transform group-hover:scale-110">
          <Icon className="size-[1.05rem]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Badge variant={severityVariant(insight.severity)}>
              {SEVERITY_LABEL[insight.severity]}
            </Badge>
            {insight.metric && (
              <span className="text-xs font-semibold text-muted-foreground">
                {insight.metric}
              </span>
            )}
          </div>
          <p className="font-medium leading-snug">{insight.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {insight.description}
          </p>

          {/* Botones de desglose por tipo de vaca */}
          {breakdown && (breakdown.dairy > 0 || breakdown.beef > 0) && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => go(CowType.DAIRY)}
                disabled={breakdown.dairy === 0}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium transition-colors',
                  breakdown.dairy > 0
                    ? 'hover:border-tech/60 hover:bg-tech/10 hover:text-tech'
                    : 'cursor-not-allowed opacity-50',
                )}
                title={`Ver ${breakdown.dairy} vaca(s) lechera(s) afectada(s)`}
              >
                <Milk className="size-3.5" />
                Lecheras
                <span className="ml-0.5 rounded-md bg-muted px-1.5 py-0.5 font-semibold tabular-nums">
                  {breakdown.dairy}
                </span>
              </button>
              <button
                type="button"
                onClick={() => go(CowType.BEEF)}
                disabled={breakdown.beef === 0}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium transition-colors',
                  breakdown.beef > 0
                    ? 'hover:border-primary/60 hover:bg-primary/10 hover:text-primary'
                    : 'cursor-not-allowed opacity-50',
                )}
                title={`Ver ${breakdown.beef} vaca(s) de carne afectada(s)`}
              >
                <Beef className="size-3.5" />
                De carne
                <span className="ml-0.5 rounded-md bg-muted px-1.5 py-0.5 font-semibold tabular-nums">
                  {breakdown.beef}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
