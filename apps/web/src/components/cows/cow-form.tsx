'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Check, Loader2, Beef, Milk, Thermometer } from 'lucide-react';
import {
  CowType,
  FeedingStatus,
  ReproductiveStatus,
  type Cow,
} from '@pecus/types';
import {
  COW_TYPE_LABELS,
  FEEDING_LABELS,
  REPRODUCTIVE_LABELS,
  DEFAULT_TEMPERATURE,
  evaluateHealth,
} from '@pecus/shared';
import { cn } from '@pecus/ui';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Select,
} from '@/components/ui';
import { healthVariant } from '@/lib/utils';
import { useCreateCow, useUpdateCow } from '@/lib/hooks';

const schema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(40, 'El nombre es demasiado largo'),
  tipoVaca: z.nativeEnum(CowType, {
    errorMap: () => ({ message: 'Selecciona un tipo de vaca' }),
  }),
  estadoReproductivo: z.nativeEnum(ReproductiveStatus),
  estadoAlimentacion: z.nativeEnum(FeedingStatus),
  temperatura: z.coerce
    .number({ invalid_type_error: 'Ingresa una temperatura válida' })
    .min(30, 'Demasiado baja (mín. 30 °C)')
    .max(45, 'Demasiado alta (máx. 45 °C)'),
});

type FormValues = z.infer<typeof schema>;

export function CowForm({ cow }: { cow?: Cow }) {
  const router = useRouter();
  const isEdit = !!cow;
  const createCow = useCreateCow();
  const updateCow = useUpdateCow(cow?.id ?? '');
  const [done, setDone] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: cow?.nombre ?? '',
      tipoVaca: cow?.tipoVaca ?? CowType.DAIRY,
      estadoReproductivo:
        cow?.estadoReproductivo ?? ReproductiveStatus.NOT_IN_HEAT,
      estadoAlimentacion: cow?.estadoAlimentacion ?? FeedingStatus.NOT_FED,
      temperatura: cow?.temperatura ?? DEFAULT_TEMPERATURE,
    },
  });

  const selectedType = watch('tipoVaca');
  const watchedTemp = watch('temperatura');
  const tempNum =
    typeof watchedTemp === 'string' ? parseFloat(watchedTemp) : watchedTemp;
  const tempHealth =
    typeof tempNum === 'number' && !Number.isNaN(tempNum)
      ? evaluateHealth(tempNum)
      : null;

  const onSubmit = async (values: FormValues) => {
    if (isEdit) {
      await updateCow.mutateAsync(values);
    } else {
      await createCow.mutateAsync({
        nombre: values.nombre,
        tipoVaca: values.tipoVaca,
        estadoReproductivo: values.estadoReproductivo,
        estadoAlimentacion: values.estadoAlimentacion,
        temperatura: values.temperatura,
      });
    }
    setDone(true);
    setTimeout(() => {
      router.push(values.tipoVaca === CowType.DAIRY ? '/dairy' : '/beef');
      router.refresh();
    }, 700);
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la vaca</Label>
            <Input
              id="nombre"
              placeholder="Ej. Estrella, Manchas, Lucero…"
              {...register('nombre')}
              aria-invalid={!!errors.nombre}
            />
            {errors.nombre && (
              <p className="text-sm text-destructive">{errors.nombre.message}</p>
            )}
            {!isEdit && (
              <p className="text-xs text-muted-foreground">
                El código de vaca (000001, 000002…) se genera automáticamente y
                no es editable.
              </p>
            )}
          </div>

          {/* Tipo de vaca — selector visual */}
          <div className="space-y-2">
            <Label>Tipo de vaca</Label>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { value: CowType.DAIRY, icon: Milk },
                  { value: CowType.BEEF, icon: Beef },
                ] as const
              ).map(({ value, icon: Icon }) => {
                const active = selectedType === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setValue('tipoVaca', value, { shouldValidate: true })
                    }
                    className={cn(
                      'flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all',
                      active
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40 hover:bg-accent',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-10 items-center justify-center rounded-lg transition-colors',
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <p className="font-medium">{COW_TYPE_LABELS[value]}</p>
                      <p className="text-xs text-muted-foreground">
                        {value === CowType.DAIRY
                          ? 'Producción láctea'
                          : 'Producción cárnica'}
                      </p>
                    </div>
                    {active && (
                      <Check className="ml-auto size-5 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Estados */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="estadoAlimentacion">Estado de alimentación</Label>
              <Select id="estadoAlimentacion" {...register('estadoAlimentacion')}>
                <option value={FeedingStatus.NOT_FED}>
                  {FEEDING_LABELS.NOT_FED}
                </option>
                <option value={FeedingStatus.FED}>{FEEDING_LABELS.FED}</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estadoReproductivo">Estado reproductivo</Label>
              <Select
                id="estadoReproductivo"
                {...register('estadoReproductivo')}
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
          </div>

          {/* Temperatura corporal */}
          <div className="space-y-2">
            <Label htmlFor="temperatura">Temperatura corporal (°C)</Label>
            <div className="flex items-center gap-3">
              <div className="relative w-40">
                <Thermometer className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="temperatura"
                  type="number"
                  step="0.1"
                  min={30}
                  max={45}
                  className="pl-9"
                  {...register('temperatura')}
                  aria-invalid={!!errors.temperatura}
                />
              </div>
              {tempHealth && (
                <Badge variant={healthVariant(tempHealth.status)}>
                  {tempHealth.label}
                </Badge>
              )}
            </div>
            {errors.temperatura ? (
              <p className="text-sm text-destructive">
                {errors.temperatura.message}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Rango saludable: 38.0–39.2 °C. Fuera de él, la vaca se marca en
                alerta o crisis automáticamente.
              </p>
            )}
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || done}>
              {done ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2"
                >
                  <Check className="size-4" />
                  Guardado
                </motion.span>
              ) : isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Guardando…
                </>
              ) : isEdit ? (
                'Guardar cambios'
              ) : (
                'Registrar vaca'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
