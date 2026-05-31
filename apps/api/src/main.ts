import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  const logger = new Logger('PECUS');

  // ── Seguridad ──
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.enableCors({
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000').split(','),
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // ── API global ──
  app.setGlobalPrefix('api', { exclude: ['health'] });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // ── Swagger ──
  const config = new DocumentBuilder()
    .setTitle('PECUS API')
    .setDescription(
      'API de la plataforma inteligente de monitoreo y gestión ganadera PECUS. ' +
        'Gestión de rebaño, alimentación, reproducción, telemetría IoT simulada y Smart Insights.',
    )
    .setVersion('1.0.0')
    .addTag('cows', 'Gestión del rebaño (CRUD)')
    .addTag('feeding', 'Módulo de alimentación')
    .addTag('reproduction', 'Módulo reproductivo')
    .addTag('insights', 'Smart Insights — análisis inteligente')
    .addTag('iot', 'Telemetría IoT simulada, sensores y alertas')
    .addTag('stats', 'Estadísticas del dashboard')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'PECUS API · Docs',
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.API_PORT ?? 4000;
  await app.listen(port, '0.0.0.0');
  logger.log(`🐄  PECUS API corriendo en http://localhost:${port}/api`);
  logger.log(`📚  Swagger disponible en http://localhost:${port}/api/docs`);
}
bootstrap();
