import { Injectable } from '@nestjs/common';
import { CowType, FeedingStatus, ReproductiveStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { HEALTH_THRESHOLDS } from '@pecus/shared';

const { HEALTHY_MIN, HEALTHY_MAX, CRITICAL_LOW, CRITICAL_HIGH } = HEALTH_THRESHOLDS;

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const [
      total,
      dairy,
      beef,
      fedToday,
      notFedToday,
      inHeat,
      pregnant,
      notInHeat,
      healthy,
      critical,
      tempAgg,
    ] = await Promise.all([
      this.prisma.cow.count(),
      this.prisma.cow.count({ where: { tipoVaca: CowType.DAIRY } }),
      this.prisma.cow.count({ where: { tipoVaca: CowType.BEEF } }),
      this.prisma.cow.count({ where: { estadoAlimentacion: FeedingStatus.FED } }),
      this.prisma.cow.count({ where: { estadoAlimentacion: FeedingStatus.NOT_FED } }),
      this.prisma.cow.count({ where: { estadoReproductivo: ReproductiveStatus.IN_HEAT } }),
      this.prisma.cow.count({ where: { estadoReproductivo: ReproductiveStatus.PREGNANT } }),
      this.prisma.cow.count({ where: { estadoReproductivo: ReproductiveStatus.NOT_IN_HEAT } }),
      // Saludables: temperatura dentro del rango normal.
      this.prisma.cow.count({ where: { temperatura: { gte: HEALTHY_MIN, lte: HEALTHY_MAX } } }),
      // Crisis: hipotermia (< low) o fiebre alta (>= high).
      this.prisma.cow.count({
        where: { OR: [{ temperatura: { lt: CRITICAL_LOW } }, { temperatura: { gte: CRITICAL_HIGH } }] },
      }),
      this.prisma.cow.aggregate({ _avg: { temperatura: true } }),
    ]);

    // En alerta = el resto.
    const watch = Math.max(0, total - healthy - critical);
    const avgTemperature = Math.round((tempAgg._avg.temperatura ?? 0) * 10) / 10;

    return {
      stats: {
        total,
        dairy,
        beef,
        fedToday,
        notFedToday,
        inHeat,
        pregnant,
        healthy,
        watch,
        critical,
        avgTemperature,
      },
      charts: {
        feeding: [
          { key: 'fed', name: 'Comió', value: fedToday },
          { key: 'notFed', name: 'No ha comido', value: notFedToday },
        ],
        reproduction: [
          { key: 'notInHeat', name: 'No está en celo', value: notInHeat },
          { key: 'inHeat', name: 'Está en celo', value: inHeat },
          { key: 'pregnant', name: 'Está embarazada', value: pregnant },
        ],
        distribution: [
          { key: 'dairy', name: 'Lecheras', value: dairy },
          { key: 'beef', name: 'De carne', value: beef },
        ],
        health: [
          { key: 'healthy', name: 'Saludable', value: healthy },
          { key: 'watch', name: 'En alerta', value: watch },
          { key: 'critical', name: 'Crisis', value: critical },
        ],
      },
    };
  }
}
