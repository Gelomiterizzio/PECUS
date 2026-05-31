'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Search,
  Trash2,
  Utensils,
  Loader2,
  Inbox,
  Thermometer,
} from 'lucide-react';
import {
  CowType,
  FeedingStatus,
  HealthStatus,
  ReproductiveStatus,
  type Cow,
  type CowQuery,
} from '@pecus/types';
import {
  COW_TYPE_LABELS,
  FEEDING_LABELS,
  HEALTH_LABELS,
  REPRODUCTIVE_LABELS,
  evaluateHealth,
  timeAgo,
} from '@pecus/shared';
import { cn } from '@pecus/ui';
import {
  Badge,
  Button,
  Input,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  buttonVariants,
} from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useCows, useDeleteCow, useFeedCow } from '@/lib/hooks';
import { useDebounce } from '@/lib/use-debounce';
import {
  cowTypeVariant,
  feedingVariant,
  formatTemp,
  healthVariant,
  reproductiveVariant,
} from '@/lib/utils';

type SortableKey =
  | 'codigoVaca'
  | 'nombre'
  | 'fechaRegistro'
  | 'ultimaAlimentacion'
  | 'temperatura';

const PAGE_SIZE = 8;

/** Lee un valor de query y lo valida contra los valores permitidos de un enum. */
function readEnumParam<T extends string>(
  raw: string | null,
  allowed: readonly T[],
): T | '' {
  return raw && (allowed as readonly string[]).includes(raw) ? (raw as T) : '';
}

export function CowsTable({
  fixedType,
  showTypeColumn = true,
  showTypeFilter = true,
}: {
  fixedType?: CowType;
  showTypeColumn?: boolean;
  showTypeFilter?: boolean;
}) {
  const searchParams = useSearchParams();

  // Filtros iniciales leídos de la URL (p. ej. al llegar desde un Smart Insight).
  const initialHealth = readEnumParam(
    searchParams.get('health'),
    Object.values(HealthStatus),
  );
  const initialFeeding = readEnumParam(
    searchParams.get('feeding'),
    Object.values(FeedingStatus),
  );
  const initialRepro = readEnumParam(
    searchParams.get('repro'),
    Object.values(ReproductiveStatus),
  );

  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [feeding, setFeeding] = React.useState<FeedingStatus | ''>(initialFeeding);
  const [repro, setRepro] = React.useState<ReproductiveStatus | ''>(initialRepro);
  const [health, setHealth] = React.useState<HealthStatus | ''>(initialHealth);
  const [type, setType] = React.useState<CowType | ''>('');
  const [sortBy, setSortBy] = React.useState<SortableKey>('codigoVaca');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
  const [toDelete, setToDelete] = React.useState<Cow | null>(null);

  const debouncedSearch = useDebounce(search);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, feeding, repro, health, type]);

  const query: CowQuery = {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    estadoAlimentacion: feeding || undefined,
    estadoReproductivo: repro || undefined,
    healthStatus: health || undefined,
    tipoVaca: fixedType ?? (type || undefined),
    sortBy,
    sortOrder,
  };

  const { data, isLoading, isFetching } = useCows(query);
  const deleteCow = useDeleteCow();
  const feedCow = useFeedCow();

  const rows = data?.data ?? [];
  const meta = data?.meta;

  const toggleSort = (key: SortableKey) => {
    if (sortBy === key) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const SortHead = ({
    label,
    column,
    className,
  }: {
    label: string;
    column: SortableKey;
    className?: string;
  }) => (
    <TableHead className={className}>
      <button
        onClick={() => toggleSort(column)}
        className={cn(
          'inline-flex items-center gap-1 transition-colors hover:text-foreground',
          sortBy === column && 'text-foreground',
        )}
      >
        {label}
        <ArrowUpDown className="size-3" />
      </button>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      {/* Controles */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 sm:min-w-[240px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o código…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          {isFetching && (
            <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>

        <Select
          value={feeding}
          onChange={(e) => setFeeding(e.target.value as FeedingStatus | '')}
          className="sm:w-[170px]"
          aria-label="Filtrar por alimentación"
        >
          <option value="">Alimentación: todas</option>
          <option value={FeedingStatus.FED}>{FEEDING_LABELS.FED}</option>
          <option value={FeedingStatus.NOT_FED}>
            {FEEDING_LABELS.NOT_FED}
          </option>
        </Select>

        <Select
          value={repro}
          onChange={(e) => setRepro(e.target.value as ReproductiveStatus | '')}
          className="sm:w-[190px]"
          aria-label="Filtrar por reproducción"
        >
          <option value="">Reproducción: todas</option>
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

        <Select
          value={health}
          onChange={(e) => setHealth(e.target.value as HealthStatus | '')}
          className="sm:w-[170px]"
          aria-label="Filtrar por salud"
        >
          <option value="">Salud: todas</option>
          <option value={HealthStatus.HEALTHY}>{HEALTH_LABELS.HEALTHY}</option>
          <option value={HealthStatus.WATCH}>{HEALTH_LABELS.WATCH}</option>
          <option value={HealthStatus.CRITICAL}>{HEALTH_LABELS.CRITICAL}</option>
        </Select>

        {showTypeFilter && !fixedType && (
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as CowType | '')}
            className="sm:w-[160px]"
            aria-label="Filtrar por tipo"
          >
            <option value="">Tipo: todos</option>
            <option value={CowType.DAIRY}>{COW_TYPE_LABELS.DAIRY}</option>
            <option value={CowType.BEEF}>{COW_TYPE_LABELS.BEEF}</option>
          </Select>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SortHead label="Código" column="codigoVaca" />
              <SortHead label="Nombre" column="nombre" />
              {showTypeColumn && <TableHead>Tipo</TableHead>}
              <TableHead>Alimentación</TableHead>
              <SortHead label="Última comida" column="ultimaAlimentacion" />
              <TableHead>Reproducción</TableHead>
              <SortHead label="Temperatura" column="temperatura" />
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  <TableCell colSpan={showTypeColumn ? 8 : 7}>
                    <Skeleton className="h-7 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={showTypeColumn ? 8 : 7}>
                  <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                    <Inbox className="size-8" />
                    <p className="font-medium">No se encontraron vacas</p>
                    <p className="text-sm">
                      Ajusta los filtros o registra una nueva vaca.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((cow, i) => (
                <motion.tr
                  key={cow.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                  className="border-b border-border/60 transition-colors hover:bg-muted/50"
                >
                  <TableCell className="font-mono text-sm font-medium text-muted-foreground">
                    {cow.codigoVaca}
                  </TableCell>
                  <TableCell className="font-medium">{cow.nombre}</TableCell>
                  {showTypeColumn && (
                    <TableCell>
                      <Badge variant={cowTypeVariant(cow.tipoVaca)}>
                        {COW_TYPE_LABELS[cow.tipoVaca]}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge variant={feedingVariant(cow.estadoAlimentacion)}>
                      {FEEDING_LABELS[cow.estadoAlimentacion]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {timeAgo(cow.ultimaAlimentacion)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={reproductiveVariant(cow.estadoReproductivo)}>
                      {REPRODUCTIVE_LABELS[cow.estadoReproductivo]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 font-mono text-sm tabular-nums">
                        <Thermometer className="size-3.5 text-muted-foreground" />
                        {formatTemp(cow.temperatura)}
                      </span>
                      <Badge variant={healthVariant(evaluateHealth(cow.temperatura).status)}>
                        {evaluateHealth(cow.temperatura).label}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {cow.estadoAlimentacion === FeedingStatus.NOT_FED && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-success hover:text-success"
                          title="Marcar como alimentada"
                          disabled={feedCow.isPending}
                          onClick={() => feedCow.mutate({ cowId: cow.id })}
                        >
                          <Utensils className="size-4" />
                        </Button>
                      )}
                      <Link
                        href={`/cows/${cow.id}`}
                        className={cn(
                          buttonVariants({ variant: 'ghost', size: 'icon' }),
                          'size-8',
                        )}
                        title="Ver detalle"
                      >
                        <Eye className="size-4" />
                      </Link>
                      <Link
                        href={`/cows/${cow.id}/edit`}
                        className={cn(
                          buttonVariants({ variant: 'ghost', size: 'icon' }),
                          'size-8',
                        )}
                        title="Editar"
                      >
                        <Pencil className="size-4" />
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        title="Eliminar"
                        onClick={() => setToDelete(cow)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {meta && meta.total > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Mostrando{' '}
            <span className="font-medium text-foreground">
              {(meta.page - 1) * meta.limit + 1}–
              {Math.min(meta.page * meta.limit, meta.total)}
            </span>{' '}
            de <span className="font-medium text-foreground">{meta.total}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasPrevPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
              Anterior
            </Button>
            <span className="px-2 text-sm font-medium">
              {meta.page} / {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        destructive
        title={`¿Eliminar a ${toDelete?.nombre}?`}
        description={`Se eliminará la vaca ${toDelete?.codigoVaca} de forma permanente. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={deleteCow.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          deleteCow.mutate(toDelete.id, {
            onSettled: () => setToDelete(null),
          });
        }}
      />
    </div>
  );
}
