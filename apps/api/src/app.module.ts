import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from './prisma/prisma.module';
import { CowsModule } from './cows/cows.module';
import { FeedingModule } from './feeding/feeding.module';
import { ReproductionModule } from './reproduction/reproduction.module';
import { InsightsModule } from './insights/insights.module';
import { StatsModule } from './stats/stats.module';
import { IotModule } from './iot/iot.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({ wildcard: true, delimiter: '.' }),
    PrismaModule,
    CowsModule,
    FeedingModule,
    ReproductionModule,
    InsightsModule,
    StatsModule,
    IotModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
