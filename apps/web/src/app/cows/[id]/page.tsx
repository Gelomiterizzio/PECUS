'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Activity,
  CalendarDays,
  Clock,
  Fingerprint,
  HeartPulse,
  Pencil,
  Radio,
  RefreshCw,
  Thermometer,
  Utensils,
} from 'lucide-react';
import {
  CowType,
  FeedingStatus,
  ReproductiveStatus,
} from '@pecus/types';
import {
  COW_TYPE_LABELS,
  FEEDING_LABELS,
  HEALTH_THRESHOLDS,
  REPRODUCTIVE_LABELS,
  evaluateHealth,
  timeAgo,
} from '@pecus/shared';
import { cn } from '@pecus/ui';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  Separator,
  Skeleton,
  buttonVariants,
} from '@/components/ui';
import { PageHeader } from '@/components/layout/page-header';
import {
  useCow,
  useFeedCow,
  useUpdateReproduction,
} from '@/lib/hooks';
import {
  cowTypeVariant,
  feedingVariant,
  formatTemp,
  healthAccent,
  healthVariant,
  reproductiveVariant,
} from '@/lib/utils';

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <span className="text-muted-foreground/70">{icon}</span>
        {label}
      </div>
      <div className="text-sm font-medium">{children}</div>
    </div>
  );
}

export default function CowDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const { data: cow, isLoading } = useCow(id);
  const feedCow = useFeedCow();
  const updateRepro = useUpdateReproduction();

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Cargando…" backHref="/" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!cow) {
    return (
      <div>
        <PageHeader title="Vaca no encontrada" backHref="/" />
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <p>No existe una vaca con ese identificador.</p>
            <Link
              href="/"
              className={cn(buttonVariants({ variant: 'outline' }), 'mt-4')}
            >
              Volver al dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const timeline = [
    {
      icon: <Utensils className="size-4" />,
      title: 'Última alimentación registrada',
      time: timeAgo(cow.ultimaAlimentacion),
      tone: 'text-success',
    },
    {
      icon: <RefreshCw className="size-4" />,
      title: 'Última actualización del registro',
      time: timeAgo(cow.fechaActualizacion),
      tone: 'text-tech',
    },
    {
      icon: <CalendarDays className="size-4" />,
      title: 'Alta en el sistema',
      time: timeAgo(cow.fechaRegistro),
      tone: 'text-muted-foreground',
    },
  ];

  // Salud derivada de la temperatura + posición en el termómetro (36–42 °C).
  const health = evaluateHealth(cow.temperatura);
  const T_MIN = 36;
  const T_MAX = 42;
  const markerPct = Math.min(
    100,
    Math.max(0, ((cow.temperatura - T_MIN) / (T_MAX - T_MIN)) * 100),
  );
  const accent = healthAccent(health.status);
  const accentText =
    accent === 'success'
      ? 'text-success'
      : accent === 'warning'
        ? 'text-warning'
        : 'text-destructive';

  return (
    <div>
      <PageHeader
        icon={<Fingerprint className="size-6" />}
        title={cow.nombre}
        description={`Código ${cow.codigoVaca} · ${COW_TYPE_LABELS[cow.tipoVaca]}`}
        backHref={cow.tipoVaca === CowType.DAIRY ? '/dairy' : '/beef'}
        backLabel={
          cow.tipoVaca === CowType.DAIRY ? 'Vacas Lecheras' : 'Vacas de Carne'
        }
        actions={
          <Link
            href={`/cows/${cow.id}/edit`}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            <Pencil className="size-4" />
            Editar
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Información + timeline */}
        <div className="space-y-4 lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Información general</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="divide-y divide-border">
                  <InfoRow icon={<Fingerprint className="size-4" />} label="Código de vaca">
                    <span className="font-mono">{cow.codigoVaca}</span>
                  </InfoRow>
                  <InfoRow icon={<Activity className="size-4" />} label="Tipo">
                    <Badge variant={cowTypeVariant(cow.tipoVaca)}>
                      {COW_TYPE_LABELS[cow.tipoVaca]}
                    </Badge>
                  </InfoRow>
                  <InfoRow icon={<Utensils className="size-4" />} label="Alimentación">
                    <Badge variant={feedingVariant(cow.estadoAlimentacion)}>
                      {FEEDING_LABELS[cow.estadoAlimentacion]}
                    </Badge>
                  </InfoRow>
                  <InfoRow icon={<Clock className="size-4" />} label="Última comida">
                    {timeAgo(cow.ultimaAlimentacion)}
                  </InfoRow>
                  <InfoRow icon={<HeartPulse className="size-4" />} label="Reproducción">
                    <Badge variant={reproductiveVariant(cow.estadoReproductivo)}>
                      {REPRODUCTIVE_LABELS[cow.estadoReproductivo]}
                    </Badge>
                  </InfoRow>
                  <InfoRow icon={<Thermometer className="size-4" />} label="Temperatura">
                    <span className="inline-flex items-center gap-2">
                      <span className="font-mono tabular-nums">{formatTemp(cow.temperatura)}</span>
                      <Badge variant={healthVariant(evaluateHealth(cow.temperatura).status)}>
                        {evaluateHealth(cow.temperatura).label}
                      </Badge>
                    </span>
                  </InfoRow>
                  <InfoRow icon={<CalendarDays className="size-4" />} label="Registrada">
                    {new Date(cow.fechaRegistro).toLocaleDateString('es', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </InfoRow>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Actividad reciente</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="relative space-y-5 pl-2">
                  {timeline.map((event, i) => (
                    <div key={i} className="relative flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            'flex size-8 items-center justify-center rounded-full bg-muted',
                            event.tone,
                          )}
                        >
                          {event.icon}
                        </span>
                        {i < timeline.length - 1 && (
                          <span className="mt-1 h-8 w-px bg-border" />
                        )}
                      </div>
                      <div className="pt-1">
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Acciones rápidas + monitoreo */}
        <div className="space-y-4">
          {/* Estado de salud (temperatura) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Thermometer className={cn('size-4', accentText)} />
                  Estado de salud
                </CardTitle>
                <Badge variant={healthVariant(health.status)}>{health.label}</Badge>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="flex items-end gap-2">
                  <span className={cn('font-display text-4xl font-bold tabular-nums', accentText)}>
                    {cow.temperatura.toFixed(1)}
                  </span>
                  <span className="mb-1 text-lg text-muted-foreground">°C</span>
                </div>

                {/* Termómetro: zonas de color + marcador */}
                <div>
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full">
                    <div className="absolute inset-0 flex">
                      <span className="bg-destructive/70" style={{ width: '25%' }} />
                      <span className="bg-warning/70" style={{ width: '8.33%' }} />
                      <span className="bg-success/70" style={{ width: '20%' }} />
                      <span className="bg-warning/70" style={{ width: '13.33%' }} />
                      <span className="bg-destructive/70" style={{ width: '33.34%' }} />
                    </div>
                    <span
                      className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground shadow"
                      style={{ left: `${markerPct}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                    <span>{T_MIN}°</span>
                    <span>
                      Normal {HEALTH_THRESHOLDS.HEALTHY_MIN}–{HEALTH_THRESHOLDS.HEALTHY_MAX}°
                    </span>
                    <span>{T_MAX}°</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">{health.description}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Acciones rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">
                    Alimentación
                  </p>
                  <Button
                    className="w-full"
                    variant={
                      cow.estadoAlimentacion === FeedingStatus.FED
                        ? 'outline'
                        : 'default'
                    }
                    disabled={
                      feedCow.isPending ||
                      cow.estadoAlimentacion === FeedingStatus.FED
                    }
                    onClick={() => feedCow.mutate({ cowId: cow.id })}
                  >
                    <Utensils className="size-4" />
                    {cow.estadoAlimentacion === FeedingStatus.FED
                      ? 'Ya comió hoy'
                      : 'Marcar como alimentada'}
                  </Button>
                </div>

                <Separator />

                <div>
                  <p className="mb-2 text-sm text-muted-foreground">
                    Estado reproductivo
                  </p>
                  <Select
                    value={cow.estadoReproductivo}
                    disabled={updateRepro.isPending}
                    onChange={(e) =>
                      updateRepro.mutate({
                        cowId: cow.id,
                        estado: e.target.value as ReproductiveStatus,
                      })
                    }
                  >
                    <option value={ReproductiveStatus.NOT_IN_HEAT}>
                      {REPRODUCTIVE_LABELS.NOT_IN_HEAT}
                    </option>
                    <option value={ReproductiveStatus.IN_HEAT}>
                      {REPRODUCTIVE_LABELS.IN_HEAT}
                    </option>
                    <option value={ReproductiveStatus.PREGNANT}>
                      {REPRODUCTIVE_LABELS.PREGNANT}
                    </option>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-tech/5">
              <CardContent className="p-5">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                  <Radio className="size-4 animate-pulse" />
                  Monitoreo IoT
                </div>
                <p className="text-sm text-muted-foreground">
                  Cuando se vinculan sensores (RFID, GPS, temperatura, actividad
                  y frecuencia cardíaca), la telemetría en tiempo real de este
                  animal aparecerá aquí. Arquitectura lista para MQTT.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
