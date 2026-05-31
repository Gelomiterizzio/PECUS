import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FeedingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PECUS_EVENTS } from '@pecus/types';
import { UpdateFeedingDto } from './dto/update-feeding.dto';

@Injectable()
export class FeedingService {
  private readonly logger = new Logger(FeedingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
  ) {}

  /** Registra alimentación de una vaca con fecha/hora/timestamp. */
  async updateFeeding(dto: UpdateFeedingDto) {
    const cow = await this.prisma.cow.findUnique({ where: { id: dto.cowId } });
    if (!cow) throw new NotFoundException(`No se encontró la vaca con id ${dto.cowId}`);

    const estado = dto.estado ?? FeedingStatus.FED;
    const now = new Date();

    const updated = await this.prisma.cow.update({
      where: { id: dto.cowId },
      data: {
        estadoAlimentacion: estado,
        ultimaAlimentacion: estado === FeedingStatus.FED ? now : cow.ultimaAlimentacion,
      },
    });

    this.events.emit(PECUS_EVENTS.FEEDING_UPDATED, {
      cowId: updated.id,
      codigoVaca: updated.codigoVaca,
      estado,
      timestamp: now.toISOString(),
    });

    this.logger.log(`Alimentación actualizada: ${updated.codigoVaca} → ${estado}`);
    return {
      ...updated,
      registro: {
        fecha: now.toISOString().slice(0, 10),
        hora: now.toTimeString().slice(0, 8),
        timestamp: now.getTime(),
      },
    };
  }

  /**
   * Reinicio automático: cada medianoche (cron "0 0 * * *") todas las vacas
   * vuelven a estado NOT_FED para empezar el nuevo día.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { name: 'feeding-daily-reset' })
  async resetDailyFeeding() {
    const result = await this.prisma.cow.updateMany({
      data: { estadoAlimentacion: FeedingStatus.NOT_FED },
    });
    this.events.emit(PECUS_EVENTS.FEEDING_RESET_COMPLETED, {
      affected: result.count,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`🌙  Reinicio diario de alimentación: ${result.count} vacas marcadas como NOT_FED`);
    return result;
  }
}
