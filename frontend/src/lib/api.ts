const API_BASE = '/api';

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

async function postJSON<T>(path: string, payload?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: payload ? { 'Content-Type': 'application/json' } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: `Erro ${res.status}` })) as { message?: string };
    throw new Error(body.message ?? `Erro ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface SyncStatusResponse {
  id: number;
  status: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncedAt: string | null;
  errorMessage: string | null;
  teamsCount: number | null;
  fixturesCount: number | null;
  playersCount: number | null;
  isConfigured: boolean;
  updatedAt: string;
}

export const api = {
  teams: {
    list: () => fetchJSON<unknown[]>('/teams'),
    get: (id: number) => fetchJSON<unknown>(`/teams/${id}`),
    stats: (id: number) => fetchJSON<unknown>(`/teams/${id}/stats`),
  },
  fixtures: {
    byTeam: (teamId: number) => fetchJSON<unknown[]>(`/fixtures/team/${teamId}`),
    matchweeks: (teamId: number) => fetchJSON<unknown[]>(`/fixtures/team/${teamId}/matchweeks`),
  },
  players: {
    byTeam: (teamId: number) => fetchJSON<unknown[]>(`/players/team/${teamId}`),
    stats: (playerId: number) => fetchJSON<unknown[]>(`/players/${playerId}/stats`),
  },
  sync: {
    status: () => fetchJSON<SyncStatusResponse>('/sync/status'),
    trigger: () => postJSON<{ message: string }>('/sync/trigger'),
    configure: (apiKey: string) => postJSON<{ message: string }>('/sync/configure', { apiKey }),
  },
};

export default api;
