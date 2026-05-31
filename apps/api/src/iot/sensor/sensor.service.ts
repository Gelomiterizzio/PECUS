import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SensorService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.sensor.findMany({
      include: { cow: { select: { codigoVaca: true, nombre: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async findByCow(cowId: string) {
    const cow = await this.prisma.cow.findUnique({ where: { id: cowId } });
    if (!cow) throw new NotFoundException(`No se encontró la vaca con id ${cowId}`);
    return this.prisma.sensor.findMany({ where: { cowId } });
  }

  async summary() {
    const [total, connected, lowBattery] = await Promise.all([
      this.prisma.sensor.count(),
      this.prisma.sensor.count({ where: { connected: true } }),
      this.prisma.sensor.count({ where: { battery: { lt: 20 } } }),
    ]);
    return { total, connected, disconnected: total - connected, lowBattery };
  }
}
