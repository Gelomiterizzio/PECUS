import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Conexión con PostgreSQL establecida');
    } catch (err) {
      this.logger.error('No se pudo conectar a la base de datos', err as Error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
