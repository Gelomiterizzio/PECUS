'use client';

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ChartDatum } from '@pecus/types';
import {
  FEEDING_COLORS,
  REPRODUCTION_COLORS,
  DISTRIBUTION_COLORS,
  HEALTH_COLORS,
} from '@/lib/utils';

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-popover-foreground">{p.payload.name}</p>
      <p className="text-muted-foreground">
        <span className="font-semibold text-foreground">{p.value}</span> vacas
      </p>
    </div>
  );
}

const EMPTY = (
  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
    Sin datos
  </div>
);

/* ───────────────── Pie: Alimentación ───────────────── */
export function FeedingPie({ data }: { data: ChartDatum[] }) {
  if (!data?.some((d) => d.value > 0)) return EMPTY;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={0}
          outerRadius="80%"
          paddingAngle={2}
          stroke="hsl(var(--card))"
          strokeWidth={3}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={FEEDING_COLORS[i % FEEDING_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/* ───────────────── Bar: Reproducción ───────────────── */
export function ReproductionBar({ data }: { data: ChartDatum[] }) {
  if (!data?.some((d) => d.value > 0)) return EMPTY;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          interval={0}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.4)' }} />
        <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={64}>
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={REPRODUCTION_COLORS[i % REPRODUCTION_COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ───────────────── Donut: Distribución ───────────────── */
export function DistributionDonut({ data }: { data: ChartDatum[] }) {
  if (!data?.some((d) => d.value > 0)) return EMPTY;
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="64%"
            outerRadius="88%"
            paddingAngle={3}
            stroke="hsl(var(--card))"
            strokeWidth={3}
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={DISTRIBUTION_COLORS[i % DISTRIBUTION_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-bold">{total}</span>
        <span className="text-xs text-muted-foreground">vacas</span>
      </div>
    </div>
  );
}

/* ───────────────── Donut: Salud del rebaño ───────────────── */
export function HealthDonut({ data }: { data: ChartDatum[] }) {
  if (!data?.some((d) => d.value > 0)) return EMPTY;
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="64%"
            outerRadius="88%"
            paddingAngle={3}
            stroke="hsl(var(--card))"
            strokeWidth={3}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={HEALTH_COLORS[i % HEALTH_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-bold">{total}</span>
        <span className="text-xs text-muted-foreground">vacas</span>
      </div>
    </div>
  );
}

/* ───────────────── Leyenda compartida ───────────────── */
export function ChartLegend({
  data,
  colors,
}: {
  data: ChartDatum[];
  colors: string[];
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
      {data.map((d, i) => (
        <div key={d.key} className="flex items-center gap-1.5 text-xs">
          <span
            className="size-2.5 rounded-full"
            style={{ background: colors[i % colors.length] }}
          />
          <span className="text-muted-foreground">{d.name}</span>
          <span className="font-medium text-foreground">{d.value}</span>
        </div>
      ))}
    </div>
  );
}
