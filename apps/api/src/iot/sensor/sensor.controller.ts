import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SensorService } from './sensor.service';

@ApiTags('iot')
@Controller('iot/sensors')
export class SensorController {
  constructor(private readonly sensorService: SensorService) {}

  @Get()
  @ApiOperation({ summary: 'Listar sensores IoT' })
  findAll() {
    return this.sensorService.findAll();
  }

  @Get('summary')
  @ApiOperation({ summary: 'Resumen del estado de la flota de sensores' })
  summary() {
    return this.sensorService.summary();
  }

  @Get('cow/:cowId')
  @ApiOperation({ summary: 'Sensores de una vaca específica' })
  byCow(@Param('cowId') cowId: string) {
    return this.sensorService.findByCow(cowId);
  }
}
