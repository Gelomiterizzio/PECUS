'use client';

import { motion } from 'framer-motion';
import {
  Beef,
  HeartPulse,
  Milk,
  Sparkles,
  Sprout,
  Users,
  Utensils,
  UtensilsCrossed,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui';
import { useDashboard, useInsights } from '@/lib/hooks';
import { greeting } from '@/lib/utils';
import {
  FEEDING_COLORS,
  REPRODUCTION_COLORS,
  DISTRIBUTION_COLORS,
  HEALTH_COLORS,
} from '@/lib/utils';
import { StatCard } from '@/components/dashboard/stat-card';
import {
  ChartLegend,
  DistributionDonut,
  FeedingPie,
  HealthDonut,
  ReproductionBar,
} from '@/components/dashboard/charts';
import { ChartCard } from '@/components/dashboard/chart-card';
import { SectionHeading } from '@/components/dashboard/section-heading';
import { InsightCard } from '@/components/dashboard/insight-card';

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();
  const { data: insights, isLoading: insightsLoading } = useInsights();

  const stats = data?.stats;
  const charts = data?.charts;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 lg:p-8"
      >
        <div className="absolute -right-10 -top-10 size-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-24 top-10 size-32 rounded-full bg-tech/10 blur-3xl" />
        <div className="relative">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sprout className="size-3.5" />
            Plataforma AgTech · Monitoreo en tiempo real
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight lg:text-4xl">
            {greeting()}, <span className="gradient-text">ganadero</span>
          </h1>
          <p className="mt-2 max-w-2xl text-balance text-muted-foreground">
            Estado del rebaño actualizado al instante. PECUS reduce pérdidas,
            mejora la productividad y digitaliza tu granja con inteligencia
            integrada.
          </p>
        </div>
      </motion.div>

      {/* Smart Insights — prioridad: qué animales requieren atención */}
      <section>
        <SectionHeading
          icon={<Sparkles className="size-5" />}
          title="Smart Insights"
          description="Recomendaciones inteligentes generadas por reglas explicables"
        />
        {insightsLoading || !insights ? (
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[104px] rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {insights.map((insight, i) => (
              <InsightCard key={insight.id} insight={insight} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Tarjetas de estadísticas */}
      <section>
        {isLoading || !stats ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-[116px] rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            <StatCard index={0} label="Total de vacas" value={stats.total} icon={Users} accent="primary" hint="Rebaño completo" />
            <StatCard index={1} label="Vacas lecheras" value={stats.dairy} icon={Milk} accent="tech" />
            <StatCard index={2} label="Vacas de carne" value={stats.beef} icon={Beef} accent="primary" />
            <StatCard index={3} label="Comieron hoy" value={stats.fedToday} icon={Utensils} accent="success" />
            <StatCard index={4} label="No comieron hoy" value={stats.notFedToday} icon={UtensilsCrossed} accent="warning" />
            <StatCard index={5} label="En celo" value={stats.inHeat} icon={HeartPulse} accent="warning" />
            <StatCard index={6} label="Embarazadas" value={stats.pregnant} icon={HeartPulse} accent="tech" />
          </div>
        )}
      </section>

      {/* Salud del rebaño */}
      <section>
        <SectionHeading
          icon={<HeartPulse className="size-5" />}
          title="Salud del rebaño"
          description="Clasificación automática por temperatura corporal"
        />
        {isLoading || !stats || !charts ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-[260px] rounded-xl" />
            <Skeleton className="h-[260px] rounded-xl lg:col-span-2" />
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard
              title="Distribución de salud"
              subtitle={`Temp. promedio ${stats.avgTemperature.toFixed(1)} °C`}
              footer={<ChartLegend data={charts.health} colors={HEALTH_COLORS} />}
            >
              <HealthDonut data={charts.health} />
            </ChartCard>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-2">
              <StatCard
                index={0}
                label="Saludables"
                value={stats.healthy}
                icon={ShieldCheck}
                accent="success"
                hint="Temp. normal"
              />
              <StatCard
                index={1}
                label="En alerta"
                value={stats.watch}
                icon={AlertTriangle}
                accent="warning"
                hint="A vigilar"
              />
              <StatCard
                index={2}
                label="En crisis"
                value={stats.critical}
                icon={ShieldAlert}
                accent="destructive"
                hint="Atención urgente"
              />
            </div>
          </div>
        )}
      </section>

      {/* Gráficos */}
      <section>
        <SectionHeading
          title="Analítica del rebaño"
          description="Distribución de alimentación, reproducción y tipos de ganado"
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {isLoading || !charts ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[300px] rounded-xl" />
            ))
          ) : (
            <>
              <ChartCard
                title="Alimentación"
                subtitle="Comieron vs no han comido"
                footer={<ChartLegend data={charts.feeding} colors={FEEDING_COLORS} />}
              >
                <FeedingPie data={charts.feeding} />
              </ChartCard>
              <ChartCard
                title="Reproducción"
                subtitle="Estado reproductivo del rebaño"
                footer={<ChartLegend data={charts.reproduction} colors={REPRODUCTION_COLORS} />}
              >
                <ReproductionBar data={charts.reproduction} />
              </ChartCard>
              <ChartCard
                title="Distribución"
                subtitle="Lecheras vs de carne"
                footer={<ChartLegend data={charts.distribution} colors={DISTRIBUTION_COLORS} />}
              >
                <DistributionDonut data={charts.distribution} />
              </ChartCard>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
