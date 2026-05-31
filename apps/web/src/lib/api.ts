/**
 * Cliente de API con degradación elegante.
 * Intenta hablar con el backend NestJS; si no responde, opera 100% sobre
 * el rebaño mock local para que la demo nunca se rompa.
 */
import {
  CowType,
  FeedingStatus,
  ReproductiveStatus,
  type Cow,
  type CreateCowDto,
  type UpdateCowDto,
  type CowQuery,
  type PaginatedResult,
  type DashboardStats,
  type SmartInsight,
  type ChartDatum,
} from '@pecus/types';
import {
  computeStats,
  generateInsights,
  feedingChartData,
  reproductionChartData,
  distributionChartData,
  healthChartData,
  healthStatusOf,
  DEFAULT_TEMPERATURE,
  nextCowCode,
} from '@pecus/shared';
import { getMockHerd } from './mock-data';

const BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:4000';

export interface DashboardPayload {
  stats: DashboardStats;
  charts: {
    feeding: ChartDatum[];
    reproduction: ChartDatum[];
    distribution: ChartDatum[];
    health: ChartDatum[];
  };
}

/* ───────────────────────── Estado mock de sesión ───────────────────────── */

let mockHerd: Cow[] | null = null;
function herd(): Cow[] {
  if (!mockHerd) mockHerd = getMockHerd();
  return mockHerd;
}

/** Bandera observable: ¿estamos sirviendo datos mock? (para mostrar aviso) */
export const apiState = { usingMock: false };

/* ───────────────────────── Fetch con timeout ───────────────────────── */

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    apiState.usingMock = false;
    return json as T;
  } finally {
    clearTimeout(timeout);
  }
}

/* ───────────────────────── Helpers de fallback ───────────────────────── */

function applyQuery(all: Cow[], query: CowQuery): PaginatedResult<Cow> {
  let rows = [...all];
  const { search, tipoVaca, estadoAlimentacion, estadoReproductivo, healthStatus } = query;

  if (tipoVaca) rows = rows.filter((c) => c.tipoVaca === tipoVaca);
  if (estadoAlimentacion)
    rows = rows.filter((c) => c.estadoAlimentacion === estadoAlimentacion);
  if (estadoReproductivo)
    rows = rows.filter((c) => c.estadoReproductivo === estadoReproductivo);
  if (healthStatus)
    rows = rows.filter((c) => healthStatusOf(c.temperatura) === healthStatus);
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.codigoVaca.toLowerCase().includes(q),
    );
  }

  const sortBy = (query.sortBy ?? 'codigoVaca') as keyof Cow;
  const dir = query.sortOrder === 'desc' ? -1 : 1;
  rows.sort((a, b) => {
    const av = a[sortBy] ?? '';
    const bv = b[sortBy] ?? '';
    return av < bv ? -dir : av > bv ? dir : 0;
  });

  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const total = rows.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const data = rows.slice((page - 1) * limit, page * limit);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

function toQueryString(query: CowQuery): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
  });
  const s = params.toString();
  return s ? `?${s}` : '';
}

/* ───────────────────────── API pública ───────────────────────── */

export async function listCows(
  query: CowQuery = {},
): Promise<PaginatedResult<Cow>> {
  try {
    return await apiFetch<PaginatedResult<Cow>>(
      `/api/cows${toQueryString(query)}`,
    );
  } catch {
    apiState.usingMock = true;
    return applyQuery(herd(), query);
  }
}

export async function getCow(id: string): Promise<Cow | null> {
  try {
    const res = await apiFetch<{ data: Cow }>(`/api/cows/${id}`);
    return res.data;
  } catch {
    apiState.usingMock = true;
    return herd().find((c) => c.id === id) ?? null;
  }
}

export async function createCow(dto: CreateCowDto): Promise<Cow> {
  try {
    const res = await apiFetch<{ data: Cow }>(`/api/cows`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
    return res.data;
  } catch {
    apiState.usingMock = true;
    const list = herd();
    const last = [...list].sort((a, b) =>
      a.codigoVaca < b.codigoVaca ? 1 : -1,
    )[0];
    const now = new Date().toISOString();
    const cow: Cow = {
      id: `mock-new-${Date.now()}`,
      codigoVaca: nextCowCode(last?.codigoVaca),
      nombre: dto.nombre,
      tipoVaca: dto.tipoVaca,
      estadoAlimentacion: dto.estadoAlimentacion ?? FeedingStatus.NOT_FED,
      ultimaAlimentacion: null,
      estadoReproductivo:
        dto.estadoReproductivo ?? ReproductiveStatus.NOT_IN_HEAT,
      temperatura: dto.temperatura ?? DEFAULT_TEMPERATURE,
      fechaRegistro: now,
      fechaActualizacion: now,
    };
    list.unshift(cow);
    return cow;
  }
}

export async function updateCow(
  id: string,
  dto: UpdateCowDto,
): Promise<Cow | null> {
  try {
    const res = await apiFetch<{ data: Cow }>(`/api/cows/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
    return res.data;
  } catch {
    apiState.usingMock = true;
    const list = herd();
    const idx = list.findIndex((c) => c.id === id);
    if (idx < 0) return null;
    list[idx] = {
      ...list[idx],
      ...dto,
      fechaActualizacion: new Date().toISOString(),
    };
    return list[idx];
  }
}

export async function deleteCow(id: string): Promise<boolean> {
  try {
    await apiFetch(`/api/cows/${id}`, { method: 'DELETE' });
    return true;
  } catch {
    apiState.usingMock = true;
    const list = herd();
    const idx = list.findIndex((c) => c.id === id);
    if (idx >= 0) list.splice(idx, 1);
    return true;
  }
}

export async function updateFeeding(
  cowId: string,
  estado: FeedingStatus = FeedingStatus.FED,
): Promise<Cow | null> {
  try {
    const res = await apiFetch<{ data: Cow }>(`/api/feeding/update`, {
      method: 'POST',
      body: JSON.stringify({ cowId, estado }),
    });
    return res.data;
  } catch {
    apiState.usingMock = true;
    return updateCow(cowId, {
      estadoAlimentacion: estado,
    }).then((c) => {
      if (c) c.ultimaAlimentacion = new Date().toISOString();
      return c;
    });
  }
}

export async function updateReproduction(
  cowId: string,
  estado: ReproductiveStatus,
): Promise<Cow | null> {
  try {
    const res = await apiFetch<{ data: Cow }>(`/api/reproduction/update`, {
      method: 'POST',
      body: JSON.stringify({ cowId, estado }),
    });
    return res.data;
  } catch {
    apiState.usingMock = true;
    return updateCow(cowId, { estadoReproductivo: estado });
  }
}

export async function getDashboard(): Promise<DashboardPayload> {
  try {
    const res = await apiFetch<{ data: DashboardPayload }>(
      `/api/stats/dashboard`,
    );
    return res.data;
  } catch {
    apiState.usingMock = true;
    const all = herd();
    const stats = computeStats(all);
    return {
      stats,
      charts: {
        feeding: feedingChartData(stats),
        reproduction: reproductionChartData(all),
        distribution: distributionChartData(stats),
        health: healthChartData(stats),
      },
    };
  }
}

export async function getInsights(): Promise<SmartInsight[]> {
  try {
    const res = await apiFetch<{ data: SmartInsight[] }>(`/api/insights`);
    return res.data;
  } catch {
    apiState.usingMock = true;
    return generateInsights(herd());
  }
}

export async function getHealth(): Promise<boolean> {
  try {
    await apiFetch(`/health`);
    return true;
  } catch {
    return false;
  }
}
