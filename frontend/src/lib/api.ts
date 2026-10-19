const API_BASE = '/api';

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
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
};

export default api;
