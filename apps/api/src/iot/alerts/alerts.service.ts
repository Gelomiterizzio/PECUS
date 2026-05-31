import { Injectable, Logger } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { AlertType, AlertSeverity } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PECUS_EVENTS } from '@pecus/types';
import { SensorReading, IOT_THRESHOLDS, AlertCandidate } from '../interfaces/iot.interfaces';

/**
 * AlertsService — motor de alertas reactivo basado en eventos.
 *
 * Escucha `telemetry.received` y aplica reglas de umbral para generar alertas:
 *   • Temperatura alta   → HIGH_TEMPERATURE
 *   • Actividad elevada  → POSSIBLE_HEAT
 * También expone consultas para el dashboard.
 */
@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
  ) {}

  @OnEvent(PECUS_EVENTS.TELEMETRY_RECEIVED, { async: true })
  async onTelemetry(reading: SensorReading) {
    const candidate = this.evaluate(reading);
    if (candidate) await this.raise(candidate);
  }

  private evaluate(reading: SensorReading): AlertCandidate | null {
    if (reading.sensorType === 'TEMPERATURE' && reading.value >= IOT_THRESHOLDS.TEMPERATURE_HIGH_C) {
      return {
        cowId: reading.cowId,
        type: AlertType.HIGH_TEMPERATURE,
        severity: AlertSeverity.CRITICAL,
        message: `Temperatura elevada detectada: ${reading.value}${reading.unit}`,
      };
    }
    if (reading.sensorType === 'ACTIVITY' && reading.value >= IOT_THRESHOLDS.ACTIVITY_HEAT_IDX) {
      return {
        cowId: reading.cowId,
        type: AlertType.POSSIBLE_HEAT,
        severity: AlertSeverity.WARNING,
        message: `Actividad elevada (${reading.value} idx): posible celo`,
      };
    }
    return null;
  }

  /** Crea la alerta evitando duplicados recientes (mismo tipo, misma vaca, < 5 min). */
  async raise(candidate: AlertCandidate) {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recent = await this.prisma.alert.findFirst({
      where: {
        cowId: candidate.cowId,
        type: candidate.type,
        resolved: false,
        createdAt: { gte: fiveMinAgo },
      },
    });
    if (recent) return recent;

    const alert = await this.prisma.alert.create({ data: candidate });
    this.events.emit(PECUS_EVENTS.ALERT_CREATED, alert);
    this.logger.warn(`🚨  Alerta [${alert.type}] ${alert.message}`);
    return alert;
  }

  async findAll(onlyActive = false) {
    return this.prisma.alert.findMany({
      where: onlyActive ? { resolved: false } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { cow: { select: { codigoVaca: true, nombre: true } } },
    });
  }

  async resolve(id: string) {
    return this.prisma.alert.update({ where: { id }, data: { resolved: true } });
  }

  async summary() {
    const [active, critical] = await Promise.all([
      this.prisma.alert.count({ where: { resolved: false } }),
      this.prisma.alert.count({ where: { resolved: false, severity: AlertSeverity.CRITICAL } }),
    ]);
    return { active, critical };
  }
}
