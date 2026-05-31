/**
 * Datos mock locales — fallback de resiliencia para la demo.
 * Si el API NestJS no responde, el frontend sigue siendo 100% funcional
 * con este rebaño generado de forma determinística (mismo orden siempre).
 */
import {
  CowType,
  FeedingStatus,
  ReproductiveStatus,
  type Cow,
} from '@pecus/types';
import { formatCowCode } from '@pecus/shared';

const NAMES = [
  'Estrella', 'Luna', 'Margarita', 'Manchas', 'Lola', 'Rosa', 'Clarabella',
  'Pinta', 'Bella', 'Canela', 'Negrita', 'Flor', 'Lucero', 'Paloma', 'Nube',
  'Aurora', 'Perla', 'Linda', 'Reina', 'Dulce', 'Trueno', 'Sultán', 'Toro',
  'Bruno', 'Max', 'Goliat', 'Pepe', 'Sansón', 'Rambo', 'Capitán', 'Duque',
  'Rayo', 'Centella', 'Coqueta', 'Princesa', 'Morena', 'Blanca', 'Café',
  'Chispa', 'Galleta', 'Avellana', 'Almendra', 'Miel', 'Azúcar', 'Vainilla',
  'Cacao', 'Frijol', 'Maíz', 'Trigo', 'Cebada',
];

/** PRNG determinístico (mulberry32) → mismos datos en cada render. */
function makeRng(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function buildHerd(): Cow[] {
  const rng = makeRng(2025);
  const now = Date.now();
  const cows: Cow[] = [];

  for (let i = 0; i < 100; i++) {
    const tipoVaca = i < 50 ? CowType.DAIRY : CowType.BEEF;
    const fed = rng() > 0.38;
    const reproRoll = rng();
    const estadoReproductivo =
      reproRoll > 0.82
        ? ReproductiveStatus.PREGNANT
        : reproRoll > 0.68
          ? ReproductiveStatus.IN_HEAT
          : ReproductiveStatus.NOT_IN_HEAT;

    const hoursAgo = fed ? rng() * 7 : 6 + rng() * 10;
    const ultimaAlimentacion = fed
      ? new Date(now - hoursAgo * 36e5).toISOString()
      : rng() > 0.5
        ? new Date(now - hoursAgo * 36e5).toISOString()
        : null;

    const registeredDaysAgo = 5 + Math.floor(rng() * 360);

    // Temperatura corporal: mayoría saludable, algunas en alerta, pocas en crisis.
    const tband = rng();
    let temperatura: number;
    if (tband < 0.78) {
      temperatura = 38.0 + rng() * 1.2; // 38.0–39.2 saludable
    } else if (tband < 0.92) {
      temperatura = rng() > 0.5 ? 39.3 + rng() * 0.6 : 37.5 + rng() * 0.4; // alerta
    } else {
      temperatura = rng() > 0.5 ? 40.0 + rng() * 1.2 : 36.4 + rng() * 1.0; // crisis
    }
    temperatura = Math.round(temperatura * 10) / 10;

    cows.push({
      id: `mock-${i + 1}`,
      codigoVaca: formatCowCode(i + 1),
      nombre: pick(rng, NAMES),
      tipoVaca,
      estadoAlimentacion: fed ? FeedingStatus.FED : FeedingStatus.NOT_FED,
      ultimaAlimentacion,
      estadoReproductivo,
      temperatura,
      fechaRegistro: new Date(now - registeredDaysAgo * 864e5).toISOString(),
      fechaActualizacion: new Date(now - rng() * 864e5).toISOString(),
    });
  }
  return cows;
}

/** Rebaño mock estable (se construye una vez por sesión de cliente). */
export const MOCK_HERD: Cow[] = buildHerd();

export function getMockHerd(): Cow[] {
  return MOCK_HERD.map((c) => ({ ...c }));
}
