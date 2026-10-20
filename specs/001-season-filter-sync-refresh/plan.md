# Implementation Plan — Atualização Pós-Sincronização e Seletor de Temporadas

**Feature**: `001-season-filter-sync-refresh`  
**Branch**: `main` (spec criada em main; sem branch de feature separada neste projeto)  
**Date**: 2026-10-20  
**Status**: Pronto para implementação

---

## Summary

O dashboard exibe dados reais somente após reload manual e está fixo na temporada 2024/25. Esta feature resolve ambos os problemas: (1) o dashboard atualiza automaticamente ao concluir uma sincronização e (2) o usuário pode selecionar e comparar múltiplas temporadas sincronizadas via dropdown, com a temporada ativa persistida na URL.

---

## Constitution Check

| Princípio | Status | Nota |
|---|---|---|
| I. Modular Architecture | ✅ | Novo `SeasonsModule` com controller/service próprios |
| II. Type Safety | ✅ | Todos os novos campos tipados em DTOs e entidades |
| III. API Design (REST + Swagger) | ✅ | Contratos OpenAPI definidos em `contracts/` |
| IV. Test-First | ⚠️ | Testes obrigatórios por constituição; devem ser escritos junto com a implementação |
| V. Security | ✅ | Nenhum dado sensível novo; season é parâmetro público |
| VI. Database & Migrations | ✅ | 3 migrations reversíveis com DEFAULT seguro |
| VII. Error Handling | ✅ | Fallback mockData + banners de erro já implementados |
| VIII. Code Style | ✅ | Segue padrões existentes do projeto |
| IX. Frontend Standards | ⚠️ | Exceção documentada: SeasonContext em vez de Redux slice (estado de navegação URL-driven) |
| X. Infrastructure | ✅ | Nenhuma nova infra; caching/queues/streaming: NO |

**Exceção documentada (Princípio IX)**:
```typescript
// constitution-exception: season selection is URL-driven navigation state
// React Context + useSearchParams preferred over Redux slice per spec 001
// Rationale: activeSeason is URL state, not server data — RTK Query is overkill here
```

---

## Technical Context

- **Stack**: NestJS (backend, porta 5174) + React 18 + TypeScript + Tailwind v3 + Recharts
- **ORM**: TypeORM com PostgreSQL
- **State Management (frontend)**: React Context para season (exceção), React state local para UI
- **API Client**: fetch wrapper em `frontend/src/lib/api.ts`
- **Routing**: React Router v6 com `useSearchParams`
- **No new dependencies required**

---

## Architecture Overview

```
┌─────────────────────────────────────┐
│           Frontend                  │
│                                     │
│  SeasonContext (activeSeason)        │
│    ↓ propagates via Context         │
│  Dashboard / TeamComparison /       │
│  PlayerStats                        │
│    ↓ calls via useSeasonData hook   │
│  api.ts (typed fetch client)        │
│    ↓ GET /api/... ?season=YYYY      │
└─────────────────┬───────────────────┘
                  │ HTTP (proxy Vite → 5174)
┌─────────────────▼───────────────────┐
│           Backend (NestJS)          │
│                                     │
│  SeasonsController/Service          │
│    GET /api/seasons                 │
│  TeamsController/Service            │
│    GET /api/teams?season            │
│    GET /api/teams/:id/stats?season  │
│  FixturesController/Service         │
│    GET /api/fixtures/team/:id/matchweeks?season │
│  PlayersController/Service          │
│    GET /api/players/top-scorers?season │
│    GET /api/players/top-assists?season │
│  SyncController/Service             │
│    POST /api/sync/trigger {season?} │
└─────────────────┬───────────────────┘
                  │ TypeORM
┌─────────────────▼───────────────────┐
│           PostgreSQL                │
│  fixtures (+ season)                │
│  match_stats                        │
│  player_stats (+ season)            │
│  players / teams                    │
│  sync_status (+ last_synced_season) │
└─────────────────────────────────────┘
```

---

## Phase 0 — Research (concluída)

Ver [`research.md`](./research.md).

**Decisões chave**:
- Season como campo `VARCHAR(4)` em `fixtures` e `player_stats`
- Sem tabela Season separada — derivada por `SELECT DISTINCT season FROM fixtures`
- SeasonContext (React Context) em vez de Redux slice — exceção documentada
- Nenhuma dependência nova

---

## Phase 1 — Backend: Migrations e Entities

### 1.1 Migrations TypeORM

Criar 3 migration files em `backend/src/migrations/`:

```typescript
// AddSeasonToFixtures
up: ALTER TABLE fixtures ADD COLUMN season VARCHAR(4) NOT NULL DEFAULT '2024';
     CREATE INDEX idx_fixtures_season ON fixtures(season);
     CREATE INDEX idx_fixtures_season_home ON fixtures(season, home_team_id);
     CREATE INDEX idx_fixtures_season_away ON fixtures(season, away_team_id);
down: DROP INDEX ...; ALTER TABLE fixtures DROP COLUMN season;

// AddSeasonToPlayerStats
up: ALTER TABLE player_stats ADD COLUMN season VARCHAR(4) NOT NULL DEFAULT '2024';
     CREATE INDEX idx_player_stats_season ON player_stats(season);
down: DROP INDEX ...; ALTER TABLE player_stats DROP COLUMN season;

// AddLastSyncedSeasonToSyncStatus
up: ALTER TABLE sync_status ADD COLUMN last_synced_season VARCHAR(4);
down: ALTER TABLE sync_status DROP COLUMN last_synced_season;
```

### 1.2 Atualizar entities

- `backend/src/fixtures/entities/fixture.entity.ts` — adicionar `@Column({ length: 4, default: '2024' }) season: string`
- `backend/src/players/entities/player-stats.entity.ts` — adicionar `@Column({ length: 4, default: '2024' }) season: string`
- `backend/src/sports-api/entities/sync-status.entity.ts` — adicionar `@Column({ nullable: true }) lastSyncedSeason?: string`

---

## Phase 2 — Backend: SeasonsModule

### 2.1 Criar SeasonsModule

**Arquivo**: `backend/src/seasons/seasons.module.ts`

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Fixture])],
  controllers: [SeasonsController],
  providers: [SeasonsService],
  exports: [SeasonsService],
})
export class SeasonsModule {}
```

### 2.2 SeasonsService

```typescript
// GET /api/seasons — derivado de DISTINCT season em fixtures
async listSeasons(): Promise<SeasonSummaryDto[]> {
  const rows = await this.fixtureRepo
    .createQueryBuilder('f')
    .select('f.season', 'year')
    .addSelect('COUNT(*)', 'fixturesCount')
    .addSelect("COUNT(*) FILTER (WHERE f.played = true)", 'playedCount')
    .groupBy('f.season')
    .orderBy('f.season', 'DESC')
    .getRawMany();

  const maxYear = rows[0]?.year;
  return rows.map(r => ({
    year: r.year,
    label: `${r.year}/${String(parseInt(r.year) + 1).slice(2)}`,
    fixturesCount: Number(r.fixturesCount),
    playedCount: Number(r.playedCount),
    isCurrent: r.year === maxYear,
  }));
}
```

### 2.3 SeasonsController

```typescript
@ApiTags('seasons')
@Controller('seasons')
export class SeasonsController {
  @Get()
  @ApiOperation({ summary: 'Lista temporadas sincronizadas' })
  listSeasons() { return this.seasonsService.listSeasons(); }
}
```

---

## Phase 3 — Backend: Atualizar SyncService e SportsApiService

### 3.1 SportsApiService — season por chamada

Adicionar métodos com parâmetro de season:

```typescript
async fetchFixturesBySeason(season: string): Promise<ApiFixture[]>
async fetchTeamsBySeason(season: string): Promise<ApiTeam[]>
async fetchTopScorersBySeason(season: string): Promise<ApiPlayer[]>
async fetchTopAssistsBySeason(season: string): Promise<ApiPlayer[]>
```

Os métodos existentes (sem parâmetro) continuam funcionando como wrapper usando `this.season`.

### 3.2 SyncService — aceitar season param

```typescript
// DTO
class SyncTriggerDto {
  @IsOptional() @IsString() @Matches(/^\d{4}$/) season?: string;
}

// triggerSync(season?: string)
async triggerSync(season?: string): Promise<{ message: string }> {
  const targetSeason = season ?? this.sportsApi.defaultSeason;
  this.runSync(targetSeason).catch(...)
  return { message: `Sincronização iniciada para temporada ${targetSeason}.` }
}

// runSync(season: string)
private async runSync(season: string): Promise<void> {
  // ...após sucesso:
  statusRecord.lastSyncedSeason = season;
  // ...ao salvar fixtures: fixture.season = season
  // ...ao salvar playerStats: playerStat.season = season
}
```

### 3.3 SyncController — aceitar body

```typescript
@Post('trigger')
trigger(@Body() dto: SyncTriggerDto) {
  return this.syncService.triggerSync(dto.season);
}
```

---

## Phase 4 — Backend: Adicionar filtro season nos services

### 4.1 TeamsService

```typescript
// getTeamSeasonStats(id, season?: string)
// Se season fornecida, filtra MatchStats via Fixture.season
// Agregados (wins/draws/losses) calculados dinamicamente da query

async getTeamSeasonStats(id: number, season?: string) {
  const whereFixture = season ? { season } : {};
  // JOIN fixtures → match_stats WHERE fixture.season = :season
  // compute wins/draws/losses/goalsScored/goalsConceded from fixture results
  // compute averages from match_stats
}
```

### 4.2 FixturesService

```typescript
findAll(season?: string): Promise<Fixture[]>
findByTeam(teamId: number, season?: string): Promise<MatchweekDataDto[]>
getMatchweekStats(teamId: number, season?: string): Promise<MatchweekDataDto[]>
```

### 4.3 PlayersService

```typescript
findByTeam(teamId: number, season?: string): Promise<Player[]>
getPlayerStats(id: number, season?: string): Promise<PlayerStatsDetailDto>
getTopScorers(season?: string, limit?: number): Promise<PlayerWithStatsDto[]>
getTopAssists(season?: string, limit?: number): Promise<PlayerWithStatsDto[]>
```

### 4.4 Atualizar Controllers

Todos os controllers afetados passam `?season` (Query param) para os services.

---

## Phase 5 — Frontend: SeasonContext e API client

### 5.1 Atualizar api.ts

Adicionar endpoints season-aware:

```typescript
seasons: {
  list: () => fetchJson<SeasonsResponse>('/api/seasons'),
},
teams: {
  list: (season?: string) => fetchJson<TeamDto[]>(`/api/teams${qs({ season })}`),
  stats: (id: number, season?: string) => fetchJson<TeamSeasonStatsResponse>(`/api/teams/${id}/stats${qs({ season })}`),
},
fixtures: {
  byTeam: (teamId: number, season?: string) =>
    fetchJson<MatchweekDataDto[]>(`/api/fixtures/team/${teamId}/matchweeks${qs({ season })}`),
},
players: {
  byTeam: (teamId: number, season?: string) => fetchJson<PlayerWithStatsDto[]>(`/api/players/team/${teamId}${qs({ season })}`),
  stats: (id: number, season?: string) => fetchJson<PlayerStatsDetailDto>(`/api/players/${id}/stats${qs({ season })}`),
  topScorers: (season?: string, limit = 10) => fetchJson<PlayerWithStatsDto[]>(`/api/players/top-scorers${qs({ season, limit })}`),
  topAssists: (season?: string, limit = 10) => fetchJson<PlayerWithStatsDto[]>(`/api/players/top-assists${qs({ season, limit })}`),
},
```

### 5.2 SeasonContext

```typescript
// frontend/src/contexts/SeasonContext.tsx
interface SeasonContextValue {
  activeSeason: string | null;        // null = usando mockData
  availableSeasons: SeasonSummaryDto[];
  isLoadingSeasons: boolean;
  setActiveSeason: (year: string) => void;
  refetchSeasons: () => void;
}

// constitution-exception: season selection is URL-driven navigation state
// React Context + useSearchParams preferred over Redux slice per spec 001
```

**Comportamento**:
- Na montagem, chama `GET /api/seasons`
- Se lista vazia → `activeSeason = null` (fallback mockData)
- Se tem temporadas → `activeSeason = searchParams.get('season') ?? seasons[0].year`
- `setActiveSeason(year)` → `setSearchParams({ season: year })`

### 5.3 Atualizar useSyncStatus

```typescript
// Aceitar callback onSyncSuccess
export function useSyncStatus(onSyncSuccess?: () => void) {
  // Na transição syncing → success:
  if (prev === 'syncing' && data.status === 'success') {
    onSyncSuccess?.();
  }
}
```

### 5.4 Hook useSeasonData (helper)

```typescript
// wrapper com fallback mockData
export function useSeasonData<T>(
  fetcher: (season: string) => Promise<T>,
  mockFallback: T,
  season: string | null,
): { data: T; isReal: boolean; loading: boolean; error: string | null }
```

---

## Phase 6 — Frontend: Atualizar páginas e componentes

### 6.1 SeasonSelector component

```typescript
// frontend/src/components/layout/SeasonSelector.tsx
// Dropdown com temporadas disponíveis
// Opção "Sincronizar nova temporada..." abre modal com campo de ano
// Exibe "Dados simulados" quando activeSeason === null
```

### 6.2 Header.tsx — integrar SeasonSelector

- Substituir texto hardcoded "2024/25" pelo `SeasonSelector`
- Passar `season` para `triggerSync` ao sincronizar

### 6.3 Dashboard.tsx

- Usar `useSeasonData` para cada query (teams, top-scorers, fixtures)
- `useSyncStatus` com `onSyncSuccess={() => refetchSeasons(); refetchData()}`
- Indicador "Dados reais — 2024/25" ou "Dados simulados"

### 6.4 TeamComparison.tsx (P2 + P3)

- Adicionar prop `season` nas queries existentes
- Modo "mesmo time, duas temporadas":
  - Seletor de temporada secundária
  - Duas queries paralelas para o mesmo time em seasons diferentes
  - Gráfico sobreposto de gols por rodada

### 6.5 PlayerStats.tsx

- Usar `useSeasonData` para `findByTeam` e `getPlayerStats`
- Exibir temporada ativa no cabeçalho

---

## Phase 7 — Testes

### Backend (obrigatório por constituição)

| Arquivo | Cobertura mínima |
|---|---|
| `seasons.service.spec.ts` | 85% — listSeasons com 0, 1, N temporadas |
| `sync.service.spec.ts` (atualizado) | 85% — triggerSync com e sem season param |
| `fixtures.service.spec.ts` (atualizado) | 85% — findByTeam com season filter |
| `players.service.spec.ts` (atualizado) | 80% — getTopScorers/Assists com season |
| `seasons.controller.spec.ts` | 70% — GET /api/seasons |

### Frontend

| Arquivo | Cobertura mínima |
|---|---|
| `SeasonContext.test.tsx` | 60% — empty seasons, season switch, URL sync |
| `useSeasonData.test.ts` | 60% — fallback mockData, real data path |
| `useSyncStatus.test.ts` (atualizado) | 60% — onSyncSuccess callback firing |
| `SeasonSelector.test.tsx` | 60% — render, selection, URL update |

---

## Dependências entre tarefas (ordem)

```
Migrations → Entity updates → SeasonsModule
                            → SyncService update
                            → Service season filters → Controller updates
                                                     → Frontend api.ts update
                                                     → SeasonContext
                                                     → useSyncStatus update
                                                     → Page updates
```

**Paralelas possíveis** (sem conflito de arquivo):
- SeasonsModule e SyncService update (arquivos diferentes)
- SeasonContext e api.ts update (arquivos diferentes)
- Dashboard update e PlayerStats update (arquivos diferentes)

---

## Definition of Done

- [ ] 3 migrations executam sem erro (`npm run migration:run`)
- [ ] `GET /api/seasons` retorna lista correta de temporadas
- [ ] `POST /api/sync/trigger` com `{ "season": "2023" }` sincroniza a temporada correta
- [ ] `GET /api/teams?season=2023` retorna times com stats da temporada 2023
- [ ] Dashboard atualiza sem reload após sync concluída (SC-001: < 4s)
- [ ] SeasonSelector exibe apenas temporadas com dados (SC-002)
- [ ] Trocar temporada carrega dados em < 1s (SC-003)
- [ ] Dados de temporadas distintas não se sobrepõem (SC-004)
- [ ] URL reflete temporada ativa via `?season=YYYY` (SC-005, NFR-004)
- [ ] Fallback para mockData quando backend indisponível (NFR-003)
- [ ] Todos os testes obrigatórios passam (constituição — Princípio IV)
- [ ] `npx tsc --noEmit` sem erros em frontend e backend

---

## Artefatos gerados

| Artefato | Caminho |
|---|---|
| Especificação | `specs/001-season-filter-sync-refresh/spec.md` |
| Cenários de teste | `specs/001-season-filter-sync-refresh/test-scenarios.md` |
| Pesquisa | `specs/001-season-filter-sync-refresh/research.md` |
| Modelo de dados | `specs/001-season-filter-sync-refresh/data-model.md` |
| Contrato seasons | `specs/001-season-filter-sync-refresh/contracts/seasons.yaml` |
| Contrato sync | `specs/001-season-filter-sync-refresh/contracts/sync.yaml` |
| Contrato teams | `specs/001-season-filter-sync-refresh/contracts/teams.yaml` |
| Contrato fixtures | `specs/001-season-filter-sync-refresh/contracts/fixtures.yaml` |
| Contrato players | `specs/001-season-filter-sync-refresh/contracts/players.yaml` |
| Guia de quickstart | `specs/001-season-filter-sync-refresh/quickstart.md` |
| Este plano | `specs/001-season-filter-sync-refresh/plan.md` |

**Próximo passo**: `/specforge.tasks` para gerar o `tasks.md` com as tarefas de implementação detalhadas.
