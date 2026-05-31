import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TelemetryService } from './telemetry.service';
import { QueryTelemetryDto } from './dto/query-telemetry.dto';

@ApiTags('iot')
@Controller('iot/telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Get()
  @ApiOperation({ summary: 'Histórico de telemetría (filtrable y paginado)' })
  findAll(@Query() query: QueryTelemetryDto) {
    return this.telemetryService.findAll(query);
  }

  @Get('latest')
  @ApiOperation({ summary: 'Últimas 20 lecturas en tiempo real' })
  latest() {
    return this.telemetryService.latest();
  }

  @Post('ingest')
  @ApiOperation({ summary: 'Ingerir una lectura de sensor (simula un mensaje MQTT entrante)' })
  ingest(@Body() reading: any) {
    return this.telemetryService.ingest({ ...reading, recordedAt: new Date().toISOString() });
  }
}
