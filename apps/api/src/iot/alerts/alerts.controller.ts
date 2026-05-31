import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';

@ApiTags('iot')
@Controller('iot/alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar alertas' })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  findAll(@Query('active') active?: string) {
    return this.alertsService.findAll(active === 'true');
  }

  @Get('summary')
  @ApiOperation({ summary: 'Resumen de alertas activas/críticas' })
  summary() {
    return this.alertsService.summary();
  }

  @Patch(':id/resolve')
  @ApiOperation({ summary: 'Marcar una alerta como resuelta' })
  resolve(@Param('id') id: string) {
    return this.alertsService.resolve(id);
  }
}
