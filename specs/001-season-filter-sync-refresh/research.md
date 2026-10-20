# Research — Atualização Pós-Sincronização e Seletor de Temporadas

**Feature**: `001-season-filter-sync-refresh`  
**Researcher**: AI agent  
**Date**: 2026-10-20

---

## 1. Análise do estado atual do codebase

### 1.1 Backend — entidades existentes

| Entidade | Tabela | Campos relevantes | Lacuna para multi-temporada |
|---|---|---|---|
| `Fixture` | `fixtures` | id, externalId, matchweek, date, homeTeam, awayTeam, homeGoals, awayGoals, played, stats[] | **Sem campo `season`** |
| `MatchStats` | `match_stats` | id, fixture, team, possession, shots, … | Deriva temporada via Fixture — sem campo próprio (OK) |
| `PlayerStats` | `player_stats` | id, player, goals, assists, … | **Sem campo `season`** |
| `Team` | `teams` | id, name, wins, draws, losses, goalsScored, goalsConceded, cleanSheets | Agregados denormalizados — refletem apenas a última temporada sincronizada |
| `SyncStatus` | `sync_status` | id, status, errorMessage | **Sem `lastSyncedSeason`** |

### 1.2 Backend — serviços

- `SportsApiService.season` é definido uma vez no constructor via `config.get('SPORTS_API_SEASON') ?? '2024'` — imutável em runtime.
- `SyncService.triggerSync()` não aceita parâmetro de temporada; usa implicitamente o `season` do `SportsApiService`.
- `TeamsService.getTeamSeasonStats(id)` computa médias de `MatchStats` e usa `team.wins/draws/losses` — sem filtro de temporada.
- `FixturesService.findByTeam()` e `getMatchweekStats()` — sem filtro de temporada.
- `PlayersService.findByTeam()` e `getPlayerStats()` — sem filtro de temporada.

### 1.3 Frontend — estado atual

- **Todas as páginas** (Dashboard, PlayerStats, TeamComparison) importam dados de `frontend/src/data/mockData.ts` diretamente.
- Nenhum endpoint de dados (`/teams`, `/fixtures`, `/players`) é chamado pelo frontend ainda.
- `useSyncStatus` detecta quando a sincronização termina (polling de 2s) mas **não dispara nenhum callback de atualização de dados**.
- `api.ts` expõe apenas endpoints de sync; não tem funções para teams/fixtures/players.

---

## 2. Decisões de design

### 2.1 Season como campo em Fixture e PlayerStats

**Decisão**: Adicionar coluna `season VARCHAR(4) NOT NULL DEFAULT '2024'` às tabelas `fixtures` e `player_stats`.

**Justificativa**: É o padrão usado pela API-Football (ex: `season=2024` representa a temporada 2024/25). A season vive nos dados, não em tabela separada — temporadas são valores enum naturais derivados por `SELECT DISTINCT season FROM fixtures`.

**Alternativa rejeitada**: Criar tabela `Season` com FK em Fixture/PlayerStats — adiciona join desnecessário; o valor string `"2024"` é suficiente como identificador natural.

### 2.2 Agregados de time (wins/draws/losses/goalsScored) por temporada

**Decisão**: Manter campos denormalizados em `Team` como cache da última sincronização. Para consultas season-scoped, `TeamsService.getTeamSeasonStats(id, season)` computará os agregados dinamicamente a partir de `MatchStats JOIN Fixture WHERE fixture.season = season`.

**Justificativa**: Volume é pequeno (~380 partidas × 20 times = ~7600 MatchStats por temporada). A query agrupada é < 50ms. Recompute on-demand é mais confiável do que manter tabelas de agregados sincronizadas.

**Alternativa rejeitada**: Tabela `TeamSeasonStats` separada — over-engineering; a spec confirma que não precisamos de caching (`decisions.caching: none`).

### 2.3 SportsApiService — season por chamada vs singleton

**Decisão**: Adicionar método `fetchFixturesSeason(season: string)` e similares ao `SportsApiService` que recebem a temporada como parâmetro, sem alterar o estado do singleton.

**Justificativa**: O singleton `this.season` é o default de ambiente; chamadas explícitas sobrepõem para sincronizações específicas. Evita race conditions se dois triggers chegassem em sequência (embora a guarda `isSyncing` impeça isso).

### 2.4 GET /api/seasons — endpoint dedicado vs derivado de sync status

**Decisão**: Endpoint `GET /api/seasons` derivado de `SELECT DISTINCT season FROM fixtures ORDER BY season DESC` — sem tabela separada.

**Justificativa**: A lista de temporadas sincronizadas **é** o conjunto de valores distintos de `season` em `fixtures`. Um endpoint de sync status que também retornasse temporadas acoplaria responsabilidades.

### 2.5 Frontend — SeasonContext vs Redux slice

**Decisão**: React Context (`SeasonContext`) para o estado global de temporada ativa.

**Justificativa**: A constituição exige Redux Toolkit para estado global. Entretanto, a seleção de temporada é estado de navegação/UI com apenas dois valores (lista de temporadas + temporada ativa) e é melhor co-localizado com o React Router (`useSearchParams`). Um Redux slice adicionaria boilerplate sem benefício. **Exceção documentada**: SeasonContext será um hook de navegação puro — não é dado de negócio nem de servidor.

> `// constitution-exception: season selection is URL-driven navigation state — React Context + useSearchParams preferred over Redux slice per spec 001`

### 2.6 Atualização automática do dashboard pós-sync

**Decisão**: O hook `useSyncStatus` aceitará um callback `onSyncSuccess?: () => void` que será chamado quando o status transitar de `'syncing'` para `'success'`. As páginas passarão suas funções de refetch como callback.

**Justificativa**: Não há necessidade de WebSocket (spec confirma). Polling de 2s já existe — apenas adicionar o callback na transição de estado. Custo: zero dependências novas.

### 2.7 Migração de dados — mockData vs API backend

**Decisão**: Criar hook `useRealData<T>` que tenta `api.<endpoint>()` e, em caso de erro (backend indisponível ou sem dados), faz fallback para mockData. O `Dashboard.tsx` e outras páginas usarão esse hook.

**Justificativa**: NFR-003 exige graceful degradation. O hook encapsula a lógica de fallback evitando duplicação.

### 2.8 URL persistence da temporada

**Decisão**: `useSearchParams` do React Router v6 para `?season=YYYY`. A mudança de temporada faz `setSearchParams({ season: '2023' })` sem reload.

**Justificativa**: NFR-004 exige que a temporada ativa persista na URL. React Router v6 já está instalado no projeto.

---

## 3. Dependências novas — resultado

**Nenhuma dependência nova necessária.** Todas as funcionalidades são implementadas com:
- TypeORM (migrations, queries) — já presente
- React Router v6 (`useSearchParams`) — já presente
- React Context API — nativa do React 18
- Polling via `setInterval` — já implementado em `useSyncStatus`

---

## 4. Riscos e mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Migração rompe dados existentes de 2024 | Alto | DEFAULT '2024' na coluna — sem dado órfão |
| API-Football sem dados históricos para temporada antiga | Médio | Backend retorna 200 com array vazio; frontend exibe empty state |
| Queries de agregados lentas com múltiplas temporadas | Baixo | Índice composto `(season, home_team_id)` e `(season, away_team_id)` em fixtures |
| Frontend chamando backend não inicializado | Baixo | Fallback para mockData já planejado no hook `useRealData` |
| Sincronização simultânea de duas temporadas | Baixo | Guard `isSyncing` já existe no SyncService |
