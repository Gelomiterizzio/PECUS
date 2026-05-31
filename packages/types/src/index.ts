/**
 * @pecus/types — Tipos y contratos de dominio compartidos
 * entre el frontend (Next.js) y el backend (NestJS).
 */

/* ───────────────────────────── Enums de dominio ───────────────────────────── */

export enum CowType {
  DAIRY = 'DAIRY',
  BEEF = 'BEEF',
}

export enum FeedingStatus {
  FED = 'FED',
  NOT_FED = 'NOT_FED',
}

export enum ReproductiveStatus {
  NOT_IN_HEAT = 'NOT_IN_HEAT',
  IN_HEAT = 'IN_HEAT',
  PREGNANT = 'PREGNANT',
}

export enum SensorType {
  RFID = 'RFID',
  GPS = 'GPS',
  TEMPERATURE = 'TEMPERATURE',
  ACTIVITY = 'ACTIVITY',
  HEART_RATE = 'HEART_RATE',
}

export enum AlertType {
  HIGH_TEMPERATURE = 'HIGH_TEMPERATURE',
  NOT_FED = 'NOT_FED',
  POSSIBLE_HEAT = 'POSSIBLE_HEAT',
  SENSOR_DISCONNECTED = 'SENSOR_DISCONNECTED',
}

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

/** Estado de salud de la vaca derivado de su temperatura corporal. */
export enum HealthStatus {
  HEALTHY = 'HEALTHY', // Saludable
  WATCH = 'WATCH', // En alerta / Atención
  CRITICAL = 'CRITICAL', // Crisis
}

/* ───────────────────────────── Entidades ───────────────────────────── */

export interface Cow {
  id: string;
  codigoVaca: string;
  nombre: string;
  tipoVaca: CowType;
  estadoAlimentacion: FeedingStatus;
  ultimaAlimentacion: string | null; // ISO date
  estadoReproductivo: ReproductiveStatus;
  temperatura: number; // °C — temperatura corporal (rectal)
  fechaRegistro: string; // ISO date
  fechaActualizacion: string; // ISO date
}

/** Resultado de evaluar la salud de una vaca según su temperatura. */
export interface CowHealth {
  status: HealthStatus;
  severity: AlertSeverity; // para reutilizar colores/severidades existentes
  label: string; // "Saludable" | "En alerta" | "Crisis"
  description: string; // explicación legible
  temperatura: number;
}

export interface Sensor {
  id: string;
  cowId: string;
  type: SensorType;
  serial: string;
  connected: boolean;
  battery: number; // 0–100
  lastSeen: string | null;
}

export interface Telemetry {
  id: string;
  cowId: string;
  sensorType: SensorType;
  value: number;
  unit: string;
  recordedAt: string;
  meta?: Record<string, unknown>;
}

export interface Alert {
  id: string;
  cowId: string | null;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  resolved: boolean;
  createdAt: string;
}

/* ───────────────────────────── DTO / API contracts ───────────────────────────── */

export interface CreateCowDto {
  nombre: string;
  tipoVaca: CowType;
  estadoReproductivo?: ReproductiveStatus;
  estadoAlimentacion?: FeedingStatus;
  temperatura?: number;
}

export interface UpdateCowDto {
  nombre?: string;
  tipoVaca?: CowType;
  estadoReproductivo?: ReproductiveStatus;
  estadoAlimentacion?: FeedingStatus;
  temperatura?: number;
}

export interface CowQuery {
  page?: number;
  limit?: number;
  search?: string;
  tipoVaca?: CowType;
  estadoAlimentacion?: FeedingStatus;
  estadoReproductivo?: ReproductiveStatus;
  healthStatus?: HealthStatus;
  sortBy?: keyof Cow;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface UpdateFeedingDto {
  cowId: string;
  estado?: FeedingStatus;
}

export interface UpdateReproductionDto {
  cowId: string;
  estado: ReproductiveStatus;
}

/* ───────────────────────────── Stats / Insights ───────────────────────────── */

export interface DashboardStats {
  total: number;
  dairy: number;
  beef: number;
  fedToday: number;
  notFedToday: number;
  inHeat: number;
  pregnant: number;
  healthy: number; // Saludables
  watch: number; // En alerta
  critical: number; // Crisis
  avgTemperature: number; // °C promedio del rebaño
}

export interface ChartDatum {
  name: string;
  value: number;
  key: string;
}

export interface SmartInsight {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  category: 'feeding' | 'reproduction' | 'health' | 'productivity';
  metric?: string;
  /**
   * Desglose accionable por tipo de vaca. Cuando está presente, la tarjeta
   * muestra botones que llevan a /dairy o /beef con el filtro ya aplicado.
   */
  breakdown?: InsightBreakdown;
}

/** Filtros que una tarjeta de insight puede pre-aplicar al navegar a una lista. */
export interface InsightFilter {
  healthStatus?: HealthStatus;
  estadoAlimentacion?: FeedingStatus;
  estadoReproductivo?: ReproductiveStatus;
}

/** Conteo de vacas afectadas por tipo + filtro a aplicar al hacer clic. */
export interface InsightBreakdown {
  dairy: number; // vacas lecheras afectadas
  beef: number; // vacas de carne afectadas
  filter: InsightFilter;
}

/* ───────────────────────────── Eventos (EventEmitter2) ───────────────────────────── */

export const PECUS_EVENTS = {
  FEEDING_UPDATED: 'feeding.updated',
  FEEDING_RESET_COMPLETED: 'feeding.reset.completed',
  REPRODUCTION_UPDATED: 'reproduction.updated',
  TELEMETRY_RECEIVED: 'telemetry.received',
  ALERT_CREATED: 'alert.created',
} as const;

export type PecusEventName = (typeof PECUS_EVENTS)[keyof typeof PECUS_EVENTS];
