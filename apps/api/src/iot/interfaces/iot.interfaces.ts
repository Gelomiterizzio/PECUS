import { SensorType, AlertType, AlertSeverity } from '@prisma/client';

/** Lectura cruda emitida por un sensor (simulado hoy, MQTT mañana). */
export interface SensorReading {
  cowId: string;
  sensorType: SensorType;
  value: number;
  unit: string;
  recordedAt: string;
  serial?: string;
}

/** Mensaje normalizado del gateway (formato listo para MQTT). */
export interface IotMessage {
  topic: string; // p.ej. "pecus/farm/cow/{id}/temperature"
  payload: SensorReading;
  qos?: 0 | 1 | 2;
  receivedAt: string;
}

/** Contrato de un transporte de telemetría (Mock hoy → MQTT/Kafka en producción). */
export interface TelemetryTransport {
  readonly name: string;
  publish(message: IotMessage): Promise<void>;
  isConnected(): boolean;
}

export interface AlertCandidate {
  cowId: string | null;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
}

/** Umbrales de las reglas de alerta. Centralizados para fácil ajuste. */
export const IOT_THRESHOLDS = {
  TEMPERATURE_HIGH_C: 39.5,
  HEART_RATE_HIGH_BPM: 90,
  ACTIVITY_HEAT_IDX: 80, // actividad elevada → posible celo
  BATTERY_LOW: 20,
} as const;
