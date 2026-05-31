/**
 * PECUS — Seed de base de datos.
 * Genera 100 vacas (50 lecheras + 50 de carne) con datos realistas usando Faker,
 * y crea sensores IoT simulados + telemetría inicial.
 *
 * Ejecutar: pnpm db:seed
 */
import { PrismaClient, CowType, FeedingStatus, ReproductiveStatus, SensorType } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const DAIRY_COUNT = 50;
const BEEF_COUNT = 50;

faker.seed(2025); // determinístico → demos reproducibles

function pad(n: number): string {
  return String(n).padStart(6, '0');
}

function randomFeeding(): FeedingStatus {
  return faker.helpers.weightedArrayElement([
    { value: FeedingStatus.FED, weight: 7 },
    { value: FeedingStatus.NOT_FED, weight: 3 },
  ]);
}

function randomReproductive(): ReproductiveStatus {
  return faker.helpers.weightedArrayElement([
    { value: ReproductiveStatus.NOT_IN_HEAT, weight: 6 },
    { value: ReproductiveStatus.IN_HEAT, weight: 2 },
    { value: ReproductiveStatus.PREGNANT, weight: 3 },
  ]);
}

/**
 * Temperatura corporal realista (°C) con distribución variada para la demo:
 * la mayoría saludable, algunas en alerta y unas pocas en crisis.
 */
function randomTemperature(): number {
  const band = faker.helpers.weightedArrayElement([
    { value: 'healthy', weight: 78 },
    { value: 'watch', weight: 14 },
    { value: 'critical', weight: 8 },
  ]);
  let value: number;
  if (band === 'healthy') {
    value = faker.number.float({ min: 38.0, max: 39.2 });
  } else if (band === 'watch') {
    value = faker.datatype.boolean()
      ? faker.number.float({ min: 39.3, max: 39.9 }) // febrícula
      : faker.number.float({ min: 37.5, max: 37.9 }); // hipotermia leve
  } else {
    value = faker.datatype.boolean()
      ? faker.number.float({ min: 40.0, max: 41.2 }) // fiebre alta
      : faker.number.float({ min: 36.4, max: 37.4 }); // hipotermia
  }
  return Math.round(value * 10) / 10;
}

const CATTLE_NAMES = [
  'Lola', 'Manchas', 'Estrella', 'Margarita', 'Rosita', 'Clarabella', 'Pinta', 'Negrita',
  'Lucero', 'Canela', 'Bonita', 'Flor', 'Princesa', 'Pecas', 'Linda', 'Reina', 'Perla',
  'Morena', 'Blanquita', 'Trueno', 'Toro', 'Sansón', 'Bravo', 'Capitán', 'Rayo', 'Sultán',
];

async function main() {
  console.log('🌱  Limpiando datos previos...');
  await prisma.telemetry.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.sensor.deleteMany();
  await prisma.cow.deleteMany();

  console.log('🐄  Generando 100 vacas (50 lecheras + 50 de carne)...');

  let sequence = 0;
  const total = DAIRY_COUNT + BEEF_COUNT;

  for (let i = 0; i < total; i++) {
    sequence += 1;
    const tipoVaca = i < DAIRY_COUNT ? CowType.DAIRY : CowType.BEEF;
    const estadoAlimentacion = randomFeeding();
    const fedHoursAgo = faker.number.int({ min: 0, max: 14 });

    const cow = await prisma.cow.create({
      data: {
        codigoVaca: pad(sequence),
        nombre: faker.helpers.arrayElement(CATTLE_NAMES) + ' ' + faker.string.alpha({ length: 1, casing: 'upper' }),
        tipoVaca,
        estadoAlimentacion,
        ultimaAlimentacion:
          estadoAlimentacion === FeedingStatus.FED
            ? faker.date.recent({ days: 0.5 })
            : new Date(Date.now() - fedHoursAgo * 36e5),
        estadoReproductivo: randomReproductive(),
        temperatura: randomTemperature(),
        fechaRegistro: faker.date.past({ years: 1 }),
      },
    });

    // Sensores IoT simulados por vaca
    const sensorTypes: SensorType[] = [
      SensorType.RFID,
      SensorType.GPS,
      SensorType.TEMPERATURE,
      SensorType.ACTIVITY,
      SensorType.HEART_RATE,
    ];
    const equipped = faker.helpers.arrayElements(sensorTypes, { min: 2, max: 5 });

    for (const type of equipped) {
      const sensor = await prisma.sensor.create({
        data: {
          cowId: cow.id,
          type,
          serial: `${type.slice(0, 3)}-${faker.string.alphanumeric({ length: 8, casing: 'upper' })}`,
          connected: faker.datatype.boolean({ probability: 0.92 }),
          battery: faker.number.int({ min: 18, max: 100 }),
          lastSeen: faker.date.recent({ days: 0.2 }),
        },
      });

      // Telemetría inicial coherente con el tipo de sensor
      const reading = telemetryValue(type);
      await prisma.telemetry.create({
        data: {
          cowId: cow.id,
          sensorId: sensor.id,
          sensorType: type,
          value: reading.value,
          unit: reading.unit,
        },
      });
    }
  }

  const counts = await prisma.cow.groupBy({ by: ['tipoVaca'], _count: true });
  console.log('✅  Seed completado:');
  counts.forEach((c) => console.log(`    • ${c.tipoVaca}: ${c._count} vacas`));
  const sensors = await prisma.sensor.count();
  const telemetry = await prisma.telemetry.count();
  console.log(`    • Sensores: ${sensors}`);
  console.log(`    • Lecturas de telemetría: ${telemetry}`);
}

function telemetryValue(type: SensorType): { value: number; unit: string } {
  switch (type) {
    case SensorType.TEMPERATURE:
      return { value: faker.number.float({ min: 38.0, max: 39.8, fractionDigits: 1 }), unit: '°C' };
    case SensorType.HEART_RATE:
      return { value: faker.number.int({ min: 48, max: 84 }), unit: 'bpm' };
    case SensorType.ACTIVITY:
      return { value: faker.number.int({ min: 0, max: 100 }), unit: 'idx' };
    case SensorType.GPS:
      return { value: faker.number.float({ min: -17.8, max: -16.3, fractionDigits: 5 }), unit: 'lat' };
    case SensorType.RFID:
      return { value: faker.number.int({ min: 1, max: 1 }), unit: 'ping' };
    default:
      return { value: 0, unit: '' };
  }
}

main()
  .catch((e) => {
    console.error('❌  Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
