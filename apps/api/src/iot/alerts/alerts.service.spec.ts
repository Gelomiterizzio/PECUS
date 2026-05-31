import { Test } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AlertsService } from './alerts.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SensorType } from '@prisma/client';

describe('AlertsService (reglas de umbral)', () => {
  let service: AlertsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      alert: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(({ data }: any) => Promise.resolve({ id: 'a1', ...data })),
        count: jest.fn().mockResolvedValue(0),
      },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        AlertsService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();
    service = moduleRef.get(AlertsService);
  });

  it('crea alerta CRITICAL por temperatura alta (>= 39.5°C)', async () => {
    await service.onTelemetry({
      cowId: 'c1',
      sensorType: SensorType.TEMPERATURE,
      value: 40.1,
      unit: '°C',
      recordedAt: new Date().toISOString(),
    });
    expect(prisma.alert.create).toHaveBeenCalled();
    expect(prisma.alert.create.mock.calls[0][0].data.type).toBe('HIGH_TEMPERATURE');
  });

  it('NO crea alerta con temperatura normal', async () => {
    await service.onTelemetry({
      cowId: 'c1',
      sensorType: SensorType.TEMPERATURE,
      value: 38.6,
      unit: '°C',
      recordedAt: new Date().toISOString(),
    });
    expect(prisma.alert.create).not.toHaveBeenCalled();
  });

  it('crea alerta POSSIBLE_HEAT con actividad elevada', async () => {
    await service.onTelemetry({
      cowId: 'c1',
      sensorType: SensorType.ACTIVITY,
      value: 95,
      unit: 'idx',
      recordedAt: new Date().toISOString(),
    });
    expect(prisma.alert.create.mock.calls[0][0].data.type).toBe('POSSIBLE_HEAT');
  });
});
