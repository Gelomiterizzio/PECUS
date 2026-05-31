import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FeedingService } from './feeding.service';
import { UpdateFeedingDto } from './dto/update-feeding.dto';

@ApiTags('feeding')
@Controller('feeding')
export class FeedingController {
  constructor(private readonly feedingService: FeedingService) {}

  @Post('update')
  @ApiOperation({ summary: 'Registrar alimentación de una vaca (fecha, hora, timestamp)' })
  update(@Body() dto: UpdateFeedingDto) {
    return this.feedingService.updateFeeding(dto);
  }
}
