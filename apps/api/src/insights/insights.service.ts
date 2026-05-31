import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateInsights } from '@pecus/shared';
import type { Cow } from '@pecus/types';

@Injectable()
export class InsightsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Ejecuta el motor de reglas inteligentes sobre el estado actual del rebaño. */
  async getInsights() {
    const cows = await this.prisma.cow.findMany();
    // Adaptamos los Date de Prisma al contrato ISO de @pecus/types.
    const mapped = cows.map((c) => ({
      ...c,
      ultimaAlimentacion: c.ultimaAlimentacion?.toISOString() ?? null,
      fechaRegistro: c.fechaRegistro.toISOString(),
      fechaActualizacion: c.fechaActualizacion.toISOString(),
    })) as unknown as Cow[];

    return { insights: generateInsights(mapped), generatedAt: new Date().toISOString() };
  }
}
