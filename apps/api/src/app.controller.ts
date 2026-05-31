import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('stats')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Health check del servicio' })
  health() {
    return {
      status: 'ok',
      service: 'pecus-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
