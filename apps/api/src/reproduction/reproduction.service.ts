import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { PECUS_EVENTS } from '@pecus/types';
import { UpdateReproductionDto } from './dto/update-reproduction.dto';

@Injectable()
export class ReproductionService {
  private readonly logger = new Logger(ReproductionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
  ) {}

  async updateReproduction(dto: UpdateReproductionDto) {
    const cow = await this.prisma.cow.findUnique({ where: { id: dto.cowId } });
    if (!cow) throw new NotFoundException(`No se encontró la vaca con id ${dto.cowId}`);

    const updated = await this.prisma.cow.update({
      where: { id: dto.cowId },
      data: { estadoReproductivo: dto.estado },
    });

    this.events.emit(PECUS_EVENTS.REPRODUCTION_UPDATED, {
      cowId: updated.id,
      codigoVaca: updated.codigoVaca,
      estadoAnterior: cow.estadoReproductivo,
      estadoNuevo: dto.estado,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Estado reproductivo: ${updated.codigoVaca} → ${dto.estado}`);
    return updated;
  }
}
