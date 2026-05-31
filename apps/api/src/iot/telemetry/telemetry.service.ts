import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { SensorType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { GatewayService } from '../gateway/gateway.service';
import { PECUS_EVENTS } from '@pecus/types';
import { SensorReading, IOT_THRESHOLDS } from '../interfaces/iot.interfaces';
import { QueryTelemetryDto } from './dto/query-telemetry.dto';

/**
 * TelemetryService — simulador de telemetría en tiempo real.
 *
 * Cada N ms toma una muestra de vacas con sensores y genera lecturas coherentes
 * (temperatura, ritmo cardíaco, actividad...). Las lecturas:
 *   1) se persisten en `telemetry`,
 *   2) se publican por el gateway (topic MQTT simulado),
 *   3) emiten el evento `telemetry.received` (lo consume Alerts).
 */
@Injectable()
export class TelemetryService implements OnModuleInit {
  private readonly logger = new Logger(TelemetryService.name);
  private enabled = true;
  private intervalMs = 8000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
    private readonly gateway: GatewayService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    this.enabled = this.config.get('IOT_SIMULATION_ENABLED', 'true') !== 'false';
    this.intervalMs = parseInt(this.config.get('IOT_SIMULATION_INTERVAL_MS', '8000'), 10);
    this.logger.log(
      `Simulación IoT ${this.enabled ? 'ACTIVA' : 'inactiva'} (intervalo ${this.intervalMs}ms)`,
    );
  }

  @Interval('telemetry-simulation', 8000)
  async simulateTick() {
    if (!this.enabled) return;
    const cows = await this.prisma.cow.findMany({
      take: 6,
      orderBy: { fechaActualizacion: 'desc' },
      include: { sensors: true },
    });
    if (cows.length === 0) return;

    for (const cow of cows) {
      const reading = this.randomReading(cow.id);
      await this.ingest(reading);
    }
  }

  /** Punto de entrada único: persiste + publica + emite evento. */
  async ingest(reading: SensorReading) {
    await this.prisma.telemetry.create({
      data: {
        cowId: reading.cowId,
        sensorType: reading.sensorType,
        value: reading.value,
        unit: reading.unit,
      },
    });

    await this.gateway.publish({
      topic: GatewayService.topicFor(reading.cowId, reading.sensorType),
      payload: reading,
      qos: 0,
      receivedAt: new Date().toISOString(),
    });

    this.events.emit(PECUS_EVENTS.TELEMETRY_RECEIVED, reading);
    return reading;
  }

  private randomReading(cowId: string): SensorReading {
    const types = [SensorType.TEMPERATURE, SensorType.HEART_RATE, SensorType.ACTIVITY];
    const sensorType = types[Math.floor(Math.random() * types.length)];
    const now = new Date().toISOString();

    switch (sensorType) {
      case SensorType.TEMPERATURE: {
        // 10% de probabilidad de fiebre para disparar alertas en la demo
        const fever = Math.random() < 0.1;
        const value = fever
          ? +(IOT_THRESHOLDS.TEMPERATURE_HIGH_C + Math.random()).toFixed(1)
          : +(38.2 + Math.random() * 1.0).toFixed(1);
        return { cowId, sensorType, value, unit: '°C', recordedAt: now };
      }
      case SensorType.HEART_RATE:
        return { cowId, sensorType, value: 48 + Math.floor(Math.random() * 50), unit: 'bpm', recordedAt: now };
      case SensorType.ACTIVITY:
      default:
        return { cowId, sensorType, value: Math.floor(Math.random() * 101), unit: 'idx', recordedAt: now };
    }
  }

  async findAll(query: QueryTelemetryDto) {
    const where = {
      ...(query.cowId ? { cowId: query.cowId } : {}),
      ...(query.sensorType ? { sensorType: query.sensorType } : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.telemetry.count({ where }),
      this.prisma.telemetry.findMany({
        where,
        orderBy: { recordedAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
    ]);
    return { data, meta: { total, page: query.page, limit: query.limit } };
  }

  async latest() {
    return this.prisma.telemetry.findMany({
      orderBy: { recordedAt: 'desc' },
      take: 20,
      include: { cow: { select: { codigoVaca: true, nombre: true } } },
    });
  }
}
