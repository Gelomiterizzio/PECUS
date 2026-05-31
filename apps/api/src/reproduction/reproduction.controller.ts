import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReproductionService } from './reproduction.service';
import { UpdateReproductionDto } from './dto/update-reproduction.dto';

@ApiTags('reproduction')
@Controller('reproduction')
export class ReproductionController {
  constructor(private readonly reproductionService: ReproductionService) {}

  @Post('update')
  @ApiOperation({ summary: 'Actualizar el estado reproductivo de una vaca' })
  update(@Body() dto: UpdateReproductionDto) {
    return this.reproductionService.updateReproduction(dto);
  }
}
