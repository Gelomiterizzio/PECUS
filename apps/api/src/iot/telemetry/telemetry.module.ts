import { Module } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { TelemetryController } from './telemetry.controller';
import { GatewayService } from '../gateway/gateway.service';

@Module({
  controllers: [TelemetryController],
  providers: [TelemetryService, GatewayService],
  exports: [TelemetryService, GatewayService],
})
export class TelemetryModule {}
