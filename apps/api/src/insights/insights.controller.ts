import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InsightsService } from './insights.service';

@ApiTags('insights')
@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get()
  @ApiOperation({ summary: 'Smart Insights — recomendaciones inteligentes del rebaño' })
  getInsights() {
    return this.insightsService.getInsights();
  }
}
