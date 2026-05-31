import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, Cow } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { nextCowCode, HEALTH_THRESHOLDS, DEFAULT_TEMPERATURE } from '@pecus/shared';
import { HealthStatus } from '@pecus/types';
import { CreateCowDto } from './dto/create-cow.dto';
import { UpdateCowDto } from './dto/update-cow.dto';
import { QueryCowDto } from './dto/query-cow.dto';

/** Traduce un estado de salud al filtro de temperatura equivalente (Prisma). */
function healthWhere(status: HealthStatus): Prisma.CowWhereInput {
  const { HEALTHY_MIN, HEALTHY_MAX, CRITICAL_LOW, CRITICAL_HIGH } = HEALTH_THRESHOLDS;
  if (status === HealthStatus.HEALTHY) {
    return { temperatura: { gte: HEALTHY_MIN, lte: HEALTHY_MAX } };
  }
  if (status === HealthStatus.CRITICAL) {
    return { OR: [{ temperatura: { lt: CRITICAL_LOW } }, { temperatura: { gte: CRITICAL_HIGH } }] };
  }
  // WATCH: hipotermia leve (37.5–37.9) o febrícula (39.3–39.9)
  return {
    OR: [
      { temperatura: { gte: CRITICAL_LOW, lt: HEALTHY_MIN } },
      { temperatura: { gt: HEALTHY_MAX, lt: CRITICAL_HIGH } },
    ],
  };
}

@Injectable()
export class CowsService {
  private readonly logger = new Logger(CowsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
  ) {}

  /** Genera el siguiente código incremental único (000001, 000002, ...). */
  private async generateCowCode(tx: Prisma.TransactionClient): Promise<string> {
    const last = await tx.cow.findFirst({
      orderBy: { codigoVaca: 'desc' },
      select: { codigoVaca: true },
    });
    return nextCowCode(last?.codigoVaca);
  }

  async create(dto: CreateCowDto): Promise<Cow> {
    // Transacción para que la generación de código sea segura ante concurrencia.
    const cow = await this.prisma.$transaction(async (tx) => {
      const codigoVaca = await this.generateCowCode(tx);
      return tx.cow.create({
        data: {
          codigoVaca,
          nombre: dto.nombre,
          tipoVaca: dto.tipoVaca,
          estadoReproductivo: dto.estadoReproductivo ?? undefined,
          estadoAlimentacion: dto.estadoAlimentacion ?? undefined,
          temperatura: dto.temperatura ?? DEFAULT_TEMPERATURE,
        },
      });
    });
    this.logger.log(`Vaca creada: ${cow.codigoVaca} (${cow.nombre})`);
    return cow;
  }

  async findAll(query: QueryCowDto) {
    const {
      page,
      limit,
      search,
      tipoVaca,
      estadoAlimentacion,
      estadoReproductivo,
      healthStatus,
      sortBy,
      sortOrder,
    } = query;

    // Combinamos condiciones con AND para no chocar el OR de búsqueda con el OR de salud.
    const and: Prisma.CowWhereInput[] = [];
    if (search) {
      and.push({
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { codigoVaca: { contains: search, mode: 'insensitive' } },
        ],
      });
    }
    if (healthStatus) and.push(healthWhere(healthStatus));

    const where: Prisma.CowWhereInput = {
      ...(tipoVaca ? { tipoVaca } : {}),
      ...(estadoAlimentacion ? { estadoAlimentacion } : {}),
      ...(estadoReproductivo ? { estadoReproductivo } : {}),
      ...(and.length ? { AND: and } : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.cow.count({ where }),
      this.prisma.cow.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<Cow & { sensors: unknown[]; alerts: unknown[] }> {
    const cow = await this.prisma.cow.findUnique({
      where: { id },
      include: {
        sensors: true,
        alerts: { orderBy: { createdAt: 'desc' }, take: 10 },
        telemetry: { orderBy: { recordedAt: 'desc' }, take: 20 },
      },
    });
    if (!cow) throw new NotFoundException(`No se encontró la vaca con id ${id}`);
    return cow as any;
  }

  async update(id: string, dto: UpdateCowDto): Promise<Cow> {
    await this.ensureExists(id);
    const cow = await this.prisma.cow.update({ where: { id }, data: dto });
    this.logger.log(`Vaca actualizada: ${cow.codigoVaca}`);
    return cow;
  }

  async remove(id: string): Promise<{ id: string; codigoVaca: string }> {
    const cow = await this.ensureExists(id);
    await this.prisma.cow.delete({ where: { id } });
    this.logger.log(`Vaca eliminada: ${cow.codigoVaca}`);
    return { id: cow.id, codigoVaca: cow.codigoVaca };
  }

  private async ensureExists(id: string): Promise<Cow> {
    const cow = await this.prisma.cow.findUnique({ where: { id } });
    if (!cow) throw new NotFoundException(`No se encontró la vaca con id ${id}`);
    return cow;
  }
}
