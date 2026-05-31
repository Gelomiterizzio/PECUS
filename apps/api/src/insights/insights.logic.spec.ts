import { formatCowCode, nextCowCode, timeAgo, generateInsights, computeStats } from '@pecus/shared';
import { CowType, FeedingStatus, ReproductiveStatus, type Cow } from '@pecus/types';

function makeCow(over: Partial<Cow> = {}): Cow {
  return {
    id: Math.random().toString(36).slice(2),
    codigoVaca: '000001',
    nombre: 'Test',
    tipoVaca: CowType.DAIRY,
    estadoAlimentacion: FeedingStatus.FED,
    ultimaAlimentacion: new Date().toISOString(),
    estadoReproductivo: ReproductiveStatus.NOT_IN_HEAT,
    temperatura: 38.6,
    fechaRegistro: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString(),
    ...over,
  };
}

describe('@pecus/shared — lógica de dominio', () => {
  it('formatea código de vaca con padding de 6 dígitos', () => {
    expect(formatCowCode(1)).toBe('000001');
    expect(formatCowCode(123)).toBe('000123');
    expect(nextCowCode('000009')).toBe('000010');
    expect(nextCowCode(null)).toBe('000001');
  });

  it('timeAgo devuelve texto relativo en español', () => {
    const now = new Date('2025-01-01T12:00:00Z');
    expect(timeAgo(new Date('2025-01-01T11:55:00Z').toISOString(), now)).toBe('Hace 5 minutos');
    expect(timeAgo(new Date('2025-01-01T10:00:00Z').toISOString(), now)).toBe('Hace 2 horas');
    expect(timeAgo(null)).toBe('Sin registro');
  });

  it('computeStats cuenta correctamente por categoría', () => {
    const cows = [
      makeCow({ tipoVaca: CowType.DAIRY, estadoReproductivo: ReproductiveStatus.PREGNANT }),
      makeCow({ tipoVaca: CowType.BEEF, estadoAlimentacion: FeedingStatus.NOT_FED }),
    ];
    const stats = computeStats(cows);
    expect(stats.total).toBe(2);
    expect(stats.dairy).toBe(1);
    expect(stats.beef).toBe(1);
    expect(stats.pregnant).toBe(1);
  });

  it('generateInsights detecta ayuno prolongado (>8h)', () => {
    const old = new Date(Date.now() - 10 * 36e5).toISOString();
    const cows = Array.from({ length: 3 }, () =>
      makeCow({ estadoAlimentacion: FeedingStatus.NOT_FED, ultimaAlimentacion: old }),
    );
    const insights = generateInsights(cows);
    expect(insights.some((i) => i.category === 'feeding')).toBe(true);
  });

  it('generateInsights detecta grupo en celo (>=3)', () => {
    const cows = Array.from({ length: 4 }, () =>
      makeCow({ estadoReproductivo: ReproductiveStatus.IN_HEAT }),
    );
    const insights = generateInsights(cows);
    expect(insights.some((i) => i.id === 'repro-heat-cluster')).toBe(true);
  });
});
