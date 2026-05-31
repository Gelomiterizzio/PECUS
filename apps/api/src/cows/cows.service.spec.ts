import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CowsService } from './cows.service';
import { PrismaService } from '../prisma/prisma.service';
import { CowType, FeedingStatus, ReproductiveStatus } from '@prisma/client';

const baseCow = {
  id: 'c1',
  codigoVaca: '000001',
  nombre: 'Lola',
  tipoVaca: CowType.DAIRY,
  estadoAlimentacion: FeedingStatus.NOT_FED,
  ultimaAlimentacion: null,
  estadoReproductivo: ReproductiveStatus.NOT_IN_HEAT,
  temperatura: 38.6,
  fechaRegistro: new Date(),
  fechaActualizacion: new Date(),
};

describe('CowsService', () => {
  let service: CowsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      cow: {
        findFirst: jest.fn().mockResolvedValue({ codigoVaca: '000004' }),
        create: jest.fn().mockResolvedValue({ ...baseCow, codigoVaca: '000005' }),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn().mockResolvedValue(baseCow),
        count: jest.fn().mockResolvedValue(1),
        findMany: jest.fn().mockResolvedValue([baseCow]),
      },
      $transaction: jest.fn((arg: any) =>
        typeof arg === 'function' ? arg(prisma) : Promise.all(arg),
      ),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CowsService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = moduleRef.get(CowsService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('genera el siguiente código incremental de 6 dígitos', async () => {
    const cow = await service.create({ nombre: 'Nueva', tipoVaca: CowType.BEEF });
    expect(prisma.cow.create).toHaveBeenCalled();
    const dataArg = prisma.cow.create.mock.calls[0][0].data;
    expect(dataArg.codigoVaca).toBe('000005');
    expect(cow.codigoVaca).toHaveLength(6);
  });

  it('arranca en 000001 cuando no hay vacas previas', async () => {
    prisma.cow.findFirst.mockResolvedValueOnce(null);
    await service.create({ nombre: 'Primera', tipoVaca: CowType.DAIRY });
    expect(prisma.cow.create.mock.calls[0][0].data.codigoVaca).toBe('000001');
  });

  it('retorna metadata de paginación correcta', async () => {
    prisma.cow.count.mockResolvedValueOnce(25);
    const res = await service.findAll({
      page: 2,
      limit: 10,
      sortBy: 'codigoVaca',
      sortOrder: 'asc',
    } as any);
    expect(res.meta.total).toBe(25);
    expect(res.meta.totalPages).toBe(3);
    expect(res.meta.hasNextPage).toBe(true);
    expect(res.meta.hasPrevPage).toBe(true);
  });

  it('lanza NotFound al actualizar una vaca inexistente', async () => {
    prisma.cow.findUnique.mockResolvedValueOnce(null);
    await expect(service.update('nope', { nombre: 'X' })).rejects.toBeInstanceOf(NotFoundException);
  });
});
