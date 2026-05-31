import { Module } from '@nestjs/common';
import { ReproductionService } from './reproduction.service';
import { ReproductionController } from './reproduction.controller';

@Module({
  controllers: [ReproductionController],
  providers: [ReproductionService],
  exports: [ReproductionService],
})
export class ReproductionModule {}
