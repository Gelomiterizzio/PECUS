import { Module } from '@nestjs/common';
import { SensorModule } from './sensor/sensor.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { AlertsModule } from './alerts/alerts.module';
import { EventsModule } from './events/events.module';
import { GatewayService } from './gateway/gateway.service';

/**
 * IotModule — orquesta la arquitectura IoT de PECUS:
 *   sensor · telemetry · alerts · gateway · events
 * Diseñada con interfaces + DTOs + datos simulados, lista para integrar MQTT real.
 */
@Module({
  imports: [SensorModule, TelemetryModule, AlertsModule, EventsModule],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class IotModule {}
