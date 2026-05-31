import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';

/**
 * E2E del flujo principal del rebaño.
 * Requiere una base de datos PostgreSQL accesible vía DATABASE_URL.
 * En CI se levanta un servicio Postgres antes de ejecutar este suite.
 */
describe('PECUS API (e2e)', () => {
  let app: INestApplication;
  let createdId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api', { exclude: ['health'] });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();
  });

  afterAll(async () => {
    if (createdId) {
      await request(app.getHttpServer()).delete(`/api/cows/${createdId}`);
    }
    await app.close();
  });

  it('/health (GET) responde ok', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => expect(res.body.status).toBe('ok'));
  });

  it('/api/cows (POST) crea una vaca con código autogenerado', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/cows')
      .send({ nombre: 'E2E Test', tipoVaca: 'DAIRY' })
      .expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.codigoVaca).toMatch(/^\d{6}$/);
    createdId = res.body.data.id;
  });

  it('/api/cows (POST) rechaza tipoVaca inválido (validación)', () => {
    return request(app.getHttpServer())
      .post('/api/cows')
      .send({ nombre: 'X', tipoVaca: 'INVALID' })
      .expect(400);
  });

  it('/api/cows (GET) lista con paginación', async () => {
    const res = await request(app.getHttpServer()).get('/api/cows?page=1&limit=5').expect(200);
    expect(res.body.meta).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('/api/stats/dashboard (GET) devuelve stats y charts', async () => {
    const res = await request(app.getHttpServer()).get('/api/stats/dashboard').expect(200);
    expect(res.body.data.stats).toBeDefined();
    expect(res.body.data.charts.feeding).toBeDefined();
  });

  it('/api/insights (GET) devuelve insights', async () => {
    const res = await request(app.getHttpServer()).get('/api/insights').expect(200);
    expect(Array.isArray(res.body.data.insights)).toBe(true);
  });
});
