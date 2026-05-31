import { Injectable, Logger } from '@nestjs/common';
import { IotMessage, TelemetryTransport } from '../interfaces/iot.interfaces';

/**
 * MockGateway — transporte de telemetría simulado.
 *
 * Implementa el contrato `TelemetryTransport`. Hoy solo registra los mensajes;
 * mañana se puede sustituir por un cliente MQTT real (p.ej. `mqtt.connect(...)`)
 * sin tocar el resto del sistema. La topología de topics ya sigue la convención
 * `pecus/farm/cow/{id}/{sensor}` lista para un broker.
 */
@Injectable()
export class GatewayService implements TelemetryTransport {
  readonly name = 'mock-gateway';
  private readonly logger = new Logger(GatewayService.name);
  private connected = true;

  static topicFor(cowId: string, sensor: string): string {
    return `pecus/farm/cow/${cowId}/${sensor.toLowerCase()}`;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async publish(message: IotMessage): Promise<void> {
    // En producción: this.mqttClient.publish(message.topic, JSON.stringify(message.payload))
    this.logger.debug(`[MQTT-sim] → ${message.topic} :: ${JSON.stringify(message.payload.value)}`);
  }
}
