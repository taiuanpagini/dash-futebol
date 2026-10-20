# Tasks: Atualização Pós-Sincronização e Seletor de Temporadas

**Feature**: `001-season-filter-sync-refresh`  
**Input**: `specs/001-season-filter-sync-refresh/` — spec.md, plan.md, data-model.md, contracts/  
**Date**: 2026-10-20  
**Status**: Pronto para implementação

---

## Formato: `[ID] [P?] [Story] Título orientado ao resultado de negócio`

- **[P]**: Pode rodar em paralelo (arquivos distintos, sem dependências intra-fase)
- **[Story]**: A qual user story a tarefa pertence (US1, US2, US3)
- Cada tarefa possui bloco de detalhes (**What / Why / Acceptance / Depends on**)

---

## Phase 1: Fundação — Schema e Entidades (Pré-requisito para todas as stories)

**Objetivo**: Preparar o banco de dados e as entidades TypeORM para suportar múltiplas temporadas. DEVE ser concluída antes de qualquer user story começar.

**Requisitos cobertos**: FR-003

**CRÍTICO**: Nenhuma user story pode ser iniciada antes desta fase estar completa.

- [ ] T001 Preparar o banco de dados para armazenar dados por temporada
  - **What**: Criar 3 migration files em `backend/src/migrations/` com os nomes timestamp correspondentes:
    1. `<timestamp>-AddSeasonToFixtures.ts` — `ALTER TABLE fixtures ADD COLUMN season VARCHAR(4) NOT NULL DEFAULT '2024'`; criar índices `idx_fixtures_season(season)`, `idx_fixtures_season_home(season, home_team_id)`, `idx_fixtures_season_away(season, away_team_id)`; `down()` dropa índices e coluna
    2. `<timestamp>-AddSeasonToPlayerStats.ts` — `ALTER TABLE player_stats ADD COLUMN season VARCHAR(4) NOT NULL DEFAULT '2024'`; criar índice `idx_player_stats_season(season)` e constraint UNIQUE `(player_id, season)`; `down()` reverte
    3. `<timestamp>-AddLastSyncedSeasonToSyncStatus.ts` — `ALTER TABLE sync_status ADD COLUMN last_synced_season VARCHAR(4)`; `down()` dropa coluna
  - **Why**: FR-003 — cada fixture e player_stats precisa do campo `season` para isolar partidas e estatísticas por edição do campeonato; sem isso nenhuma query season-aware é possível
  - **Acceptance**: `npm run migration:run` no diretório `backend/` executa as 3 migrations sem erro; `npm run migration:revert` (3x) desfaz tudo sem erro; `SELECT DISTINCT season FROM fixtures` retorna `['2024']` para dados existentes

- [ ] T002 Atualizar entidades TypeORM para refletir os novos campos do banco
  - **What**:
    - `backend/src/fixtures/entities/fixture.entity.ts` — adicionar `@Column({ length: 4, default: '2024' }) season: string`
    - `backend/src/players/entities/player-stats.entity.ts` — adicionar `@Column({ length: 4, default: '2024' }) season: string`
    - `backend/src/sports-api/entities/sync-status.entity.ts` (ou onde `SyncStatus` estiver definido) — adicionar `@Column({ nullable: true }) lastSyncedSeason?: string`
    - Criar/atualizar `backend/src/seasons/dto/season-summary.dto.ts` com campos: `year: string`, `label: string`, `fixturesCount: number`, `playedCount: number`, `isCurrent: boolean`
    - Atualizar `backend/src/sports-api/dto/sync-status-response.dto.ts` (ou equivalente) para incluir `lastSyncedSeason?: string`
  - **Why**: Garante que o TypeORM mapeie corretamente as novas colunas; sem isso as queries TypeORM não enxergam os campos adicionados pela migration
  - **Depends on**: T001
  - **Acceptance**: `npx tsc --noEmit` no diretório `backend/` retorna código 0 sem erros de tipo; as 3 entidades compilam e seus campos novos estão corretamente tipados

---

**Checkpoint**: Banco de dados atualizado e entidades compilando — user stories podem começar

---

## Phase 2: US1 — Atualização automática após sincronização (Priority: P1) — MVP

**Goal**: O dashboard exibe os dados reais recém-sincronizados em ≤ 4 segundos após a sincronização concluir, sem que o usuário precise recarregar a página. O dashboard também usa dados reais do banco quando disponíveis, com fallback automático para dados simulados.

**Linked requirements**: FR-001, FR-002, FR-004, NFR-002, NFR-003, SC-001

**Independent Test**: Clicar em "Sincronizar", aguardar conclusão e observar os KPI cards e gráficos do dashboard atualizarem automaticamente sem F5.

- [ ] T003 [US1] Permitir que o backend sincronize uma temporada específica por chamada
  - **What**:
    - `backend/src/sports-api/sports-api.service.ts` — adicionar parâmetros `season: string` nos métodos de busca à API (ex.: `fetchFixturesBySeason(season)`, `fetchTopScorersBySeason(season)`); métodos existentes sem parâmetro continuam como wrappers usando `this.season` (não quebrar retrocompatibilidade)
    - `backend/src/sports-api/dto/sync-trigger.dto.ts` (criar se não existir) — `class SyncTriggerDto { @IsOptional() @IsString() @Matches(/^\d{4}$/) season?: string; }`
    - `backend/src/sports-api/sync.service.ts` — refatorar `triggerSync(season?: string)` passando `season ?? defaultSeason` para `runSync(season)`; dentro de `runSync`, gravar `fixture.season = season` em cada fixture persistido e `playerStat.season = season` em cada player_stat persistido; após sync bem-sucedida, gravar `statusRecord.lastSyncedSeason = season`
    - `backend/src/sports-api/sync.controller.ts` — alterar `@Post('trigger')` para `trigger(@Body() dto: SyncTriggerDto)` e passar `dto.season` para `triggerSync`
  - **Why**: FR-004 — POST /api/sync/trigger deve aceitar `season` opcional; sem isso todos os dados são gravados sem identificador de temporada e o seletor nunca funciona
  - **Depends on**: T002
  - **Acceptance**: `POST /api/sync/trigger` com body `{"season":"2024"}` executa sync e grava `lastSyncedSeason = '2024'` no banco; `POST /api/sync/trigger` sem body usa temporada padrão do ambiente (`SPORTS_API_SEASON`); `GET /api/sync/status` retorna `{ status: 'success', lastSyncedSeason: '2024' }` após sync

- [ ] T004 [P] [US1] Disponibilizar informação da última temporada sincronizada no status da API
  - **What**:
    - `backend/src/sports-api/sync.service.ts` — método `getStatus()` (ou equivalente) deve incluir `lastSyncedSeason` na resposta, lendo do registro `SyncStatus` no banco
    - Garantir que o DTO de resposta de status inclua `lastSyncedSeason?: string` (T002 já cobre o DTO, mas confirmar o service popula o campo)
  - **Why**: FR-002 — o frontend precisa saber qual temporada foi sincronizada para disparar a recarga correta; sem `lastSyncedSeason` o frontend não tem como saber qual temporada buscar após a sync
  - **Depends on**: T002
  - **Acceptance**: Após uma sync com season='2024', `GET /api/sync/status` retorna `{ "status": "success", "lastSyncedSeason": "2024" }`; antes da primeira sync, `lastSyncedSeason` é `null` ou ausente

- [ ] T005 [US1] Conectar o dashboard aos dados reais do banco com fallback para dados simulados
  - **What**:
    - `frontend/src/lib/api.ts` — adicionar/atualizar métodos para todos os endpoints necessários pelo dashboard: `teams.list(season?)`, `players.topScorers(season?, limit?)`, `players.topAssists(season?, limit?)`, `fixtures.byTeam(teamId, season?)`; utilizar `?season=YYYY` como query param quando fornecido; usar utilitário `qs({season})` para montar a querystring
    - `frontend/src/hooks/useSeasonData.ts` (criar) — hook `useSeasonData<T>(fetcher: (season: string) => Promise<T>, mockFallback: T, season: string | null): { data: T; isReal: boolean; loading: boolean; error: string | null }`: quando `season === null` retorna `{ data: mockFallback, isReal: false, loading: false, error: null }`; quando `season` é string, chama `fetcher(season)` com tratamento de erro e loading state
  - **Why**: FR-001 — o dashboard deve buscar dados reais quando disponíveis; NFR-003 — fallback para mockData quando backend indisponível; NFR-002 — contratos de dados compatíveis entre mock e real
  - **Depends on**: T003, T004
  - **Acceptance**: Com dados reais no banco, `useSeasonData` retorna `{ isReal: true, data: <dados reais> }`; com `season = null`, retorna `{ isReal: false, data: <mockData> }`; em caso de erro de rede, retorna o fallback e `error` preenchido

- [ ] T006 [US1] Dashboard atualiza automaticamente os dados ao concluir uma sincronização
  - **What**:
    - `frontend/src/hooks/useSyncStatus.ts` — aceitar parâmetro opcional `onSyncSuccess?: () => void`; na detecção da transição `status: 'syncing' → 'success'`, chamar `onSyncSuccess?.()`; a transição deve ser detectada comparando o status anterior com o atual (manter ref do status anterior)
    - `frontend/src/pages/Dashboard.tsx` (ou arquivo principal do dashboard) — usar `useSeasonData` para buscar: lista de times, artilheiros, assistentes, partidas por rodada; usar `useSyncStatus({ onSyncSuccess: () => { refetchSeasons(); refetchAllData(); } })`; adicionar indicador visual no topo: badge "Dados reais — YYYY/YY" (verde) quando `isReal === true` ou "Dados simulados" (âmbar) quando `isReal === false`
    - Garantir que os componentes de gráfico (Recharts) re-renderizem ao receber novos dados via hook
  - **Why**: FR-001, FR-002 — atualização automática sem reload; SC-001 — dados atualizados em ≤ 4s após sync concluída
  - **Depends on**: T005
  - **Acceptance**: SC-001 — após sync concluída, KPI cards, gráficos e tabela refletem dados novos em ≤ 4s; badge muda para "Dados reais" ao primeiro carregamento de dados reais; erro de sync mostra banner sem remover dados já exibidos

---

**Checkpoint**: US1 completa e testável de forma independente — demonstrar antes de avançar

---

## Phase 3: US2 — Seletor de temporada dinâmico (Priority: P2)

**Goal**: O usuário pode selecionar qual temporada analisar em um dropdown no header do dashboard. Apenas temporadas com dados no banco aparecem como opções. Trocar de temporada recarrega todos os dados em < 1s. A temporada ativa persiste na URL via `?season=YYYY`.

**Linked requirements**: FR-005, FR-006, FR-007, FR-008, NFR-001, NFR-004, SC-002, SC-003, SC-004, SC-005

**Independent Test**: Sincronizar temporada 2023, depois selecionar "2023/24" no seletor e verificar que gráficos e KPIs mostram dados de 2023.

- [ ] T007 [US2] Expor a lista de temporadas sincronizadas via endpoint dedicado
  - **What**:
    - `backend/src/seasons/seasons.service.ts` (criar) — `class SeasonsService` com método `listSeasons(): Promise<SeasonSummaryDto[]>` implementado com query builder do TypeORM: `SELECT f.season AS year, COUNT(*) AS fixturesCount, COUNT(*) FILTER (WHERE f.played = true) AS playedCount FROM fixtures f GROUP BY f.season ORDER BY f.season DESC`; computar `label = 'YYYY/YY'` e `isCurrent = (year === maxYear)` em JS
    - `backend/src/seasons/seasons.controller.ts` (criar) — `@Controller('seasons') @ApiTags('seasons') class SeasonsController` com `@Get() listSeasons()` retornando `SeasonsResponseDto`
    - `backend/src/seasons/seasons.module.ts` (criar) — importar `TypeOrmModule.forFeature([Fixture])`, declarar controller e service, exportar `SeasonsService`
    - `backend/src/app.module.ts` — registrar `SeasonsModule` nos imports
  - **Why**: FR-005 — GET /api/seasons deve retornar temporadas sincronizadas com contagem de partidas; pré-requisito para o seletor de temporada no frontend
  - **Depends on**: T001, T002
  - **Acceptance**: `GET /api/seasons` retorna `{ seasons: [{ year: '2024', label: '2024/25', fixturesCount: N, playedCount: M, isCurrent: true }] }` quando dados de 2024 estão no banco; retorna `[]` quando banco está vazio; com 2 temporadas, retorna 2 itens ordenados DESC

- [ ] T008 [P] [US2] Habilitar filtro por temporada nas consultas de partidas
  - **What**:
    - `backend/src/fixtures/fixtures.service.ts` — adicionar `season?: string` como parâmetro em `findAll(season?)`, `findByTeam(teamId, season?)`, `getMatchweekStats(teamId, season?)` (ou método equivalente que retorna dados por rodada); incluir `where: season ? { season } : {}` na query TypeORM
    - `backend/src/fixtures/fixtures.controller.ts` — `@Query('season') season?: string` nos endpoints `GET /fixtures` e `GET /fixtures/team/:id/matchweeks`; passar `season` para o service
  - **Why**: FR-006 — `/api/fixtures/team/:id/matchweeks` aceita `?season=YYYY` para filtrar partidas por temporada
  - **Depends on**: T002
  - **Acceptance**: `GET /api/fixtures/team/1/matchweeks?season=2024` retorna rodadas apenas da temporada 2024; `GET /api/fixtures/team/1/matchweeks` sem query param retorna todos; banco com 2 temporadas retorna dados separados por season

- [ ] T009 [P] [US2] Habilitar filtro por temporada nas consultas de times
  - **What**:
    - `backend/src/teams/teams.service.ts` — método `getTeamSeasonStats(id: number, season?: string)`: quando `season` fornecido, computar wins/draws/losses/goalsScored/goalsConceded via query builder fazendo JOIN de `match_stats` com `fixtures WHERE season = :season`; médias de posse/finalizações/passes de `match_stats` filtradas pela season via fixture
    - `backend/src/teams/teams.controller.ts` — `@Query('season') season?: string` em `GET /teams` e `GET /teams/:id/stats`; passar `season` para os métodos do service
  - **Why**: FR-006 — `/api/teams` e `/api/teams/:id/stats` precisam aceitar `?season` para que cards de time e gráficos mostrem dados da temporada correta
  - **Depends on**: T002
  - **Acceptance**: `GET /api/teams/1/stats?season=2024` retorna estatísticas computadas da temporada 2024; sem `?season` retorna totais de todas as temporadas (ou da última, conforme comportamento atual)

- [ ] T010 [P] [US2] Habilitar filtro por temporada nas consultas de jogadores
  - **What**:
    - `backend/src/players/players.service.ts` — adicionar `season?: string` em `findByTeam(teamId, season?)`, `getPlayerStats(id, season?)`, `getTopScorers(season?, limit?)`, `getTopAssists(season?, limit?)`; filtrar `player_stats` por `where: season ? { season } : {}` nas queries TypeORM
    - `backend/src/players/players.controller.ts` — `@Query('season') season?: string` em `GET /players/top-scorers`, `GET /players/top-assists`, `GET /players/team/:id`, `GET /players/:id/stats`
  - **Why**: FR-006 — todos os endpoints de jogadores devem aceitar `?season` para que artilheiros e estatísticas reflitam a temporada selecionada
  - **Depends on**: T002
  - **Acceptance**: `GET /api/players/top-scorers?season=2024` retorna artilheiros de 2024 com gols corretos; `GET /api/players/top-scorers?season=2023` (se dados existirem) retorna artilheiros diferentes; sem `?season` retorna todos

- [ ] T011 [US2] Gerenciar a temporada ativa globalmente no frontend com persistência na URL
  - **What**:
    - `frontend/src/contexts/SeasonContext.tsx` (criar) — `interface SeasonContextValue { activeSeason: string | null; availableSeasons: SeasonSummaryDto[]; isLoadingSeasons: boolean; setActiveSeason: (year: string) => void; refetchSeasons: () => void; }`. Implementação: na montagem, chama `api.seasons.list()`; se lista vazia → `activeSeason = null`; se tem temporadas → `activeSeason = searchParams.get('season') ?? seasons[0].year`; `setActiveSeason(year)` chama `setSearchParams({ season: year })`; exportar `SeasonProvider` e hook `useSeason()`. Adicionar comentário obrigatório: `// constitution-exception: season selection is URL-driven navigation state — React Context + useSearchParams preferred over Redux slice per spec 001`
    - `frontend/src/lib/api.ts` — adicionar método `seasons: { list: () => fetchJson<SeasonsResponseDto>('/api/seasons') }` e atualizar todos os métodos de teams/fixtures/players para aceitar `season?: string` montando `?season=YYYY` via helper `qs({season})`
    - `frontend/src/types/football.ts` (ou arquivo de tipos existente) — adicionar interface `SeasonSummaryDto { year: string; label: string; fixturesCount: number; playedCount: number; isCurrent: boolean }`
  - **Why**: FR-007, FR-008, NFR-004 — seletor de temporada + propagação global para todas as páginas + URL persistida para compartilhamento de links
  - **Depends on**: T007, T005
  - **Acceptance**: `setActiveSeason('2023')` atualiza URL para `?season=2023`; ao carregar a página com `?season=2023` na URL, `activeSeason` é `'2023'`; quando `GET /api/seasons` retorna lista vazia, `activeSeason` é `null`; SC-005 — URL reflete temporada ativa

- [ ] T012 [US2] Exibir o seletor de temporada no cabeçalho do dashboard
  - **What**:
    - `frontend/src/components/layout/SeasonSelector.tsx` (criar) — componente dropdown que consome `useSeason()` do SeasonContext; lista `availableSeasons` como opções com `label` formatado (ex.: "2024/25"); quando `availableSeasons` vazio, mostra "Dados simulados" desabilitado; mostrar temporada ativa com destaque visual; ao selecionar opção, chamar `setActiveSeason(year)`
    - `frontend/src/components/layout/Header.tsx` — substituir texto hardcoded "2024/25" pelo componente `<SeasonSelector />`; ao acionar sincronização, passar `activeSeason ?? defaultSeason` no body da requisição `POST /api/sync/trigger`
    - `frontend/src/App.tsx` (ou `main.tsx`) — envolver a árvore de componentes com `<SeasonProvider>`
  - **Why**: FR-007 — seletor de temporada visível para o usuário; FR-004 — trigger de sync ciente da temporada
  - **Depends on**: T011
  - **Acceptance**: SC-002 — seletor exibe apenas temporadas com dados no banco; SC-005 — trocar opção no seletor atualiza URL `?season=YYYY` imediatamente; com 2 temporadas no banco, seletor mostra 2 opções

- [ ] T013 [US2] Propagar a temporada ativa para todas as páginas e consultas de dados
  - **What**:
    - `frontend/src/pages/Dashboard.tsx` — consumir `activeSeason` do `useSeason()`; passar `season` para cada chamada via `useSeasonData` (times, artilheiros, assistentes, rodadas por partida); ao trocar `activeSeason`, todos os dados são recarregados automaticamente via react re-render
    - `frontend/src/pages/Jogadores.tsx` (ou página de jogadores existente) — consumir `activeSeason`; passar para queries de jogadores; exibir a temporada ativa no cabeçalho da página (ex.: "Temporada 2024/25")
    - Verificar todas as demais páginas que fazem queries de dados e garantir que `season` é passado como parâmetro
    - Tratar estado vazio: quando `GET /api/teams?season=2023` retorna array vazio, exibir mensagem "Sem dados para esta temporada. Clique em Sincronizar." com CTA linkando ao botão de sync
  - **Why**: FR-008 — temporada propagada globalmente para Dashboard, Comparativo e Jogadores; NFR-001 — troca de temporada recarrega dados em < 1s (resposta API local)
  - **Depends on**: T011, T006
  - **Acceptance**: SC-003 — trocar temporada no seletor atualiza dados do dashboard em < 1s; SC-004 — com 2 temporadas sincronizadas, os dados não se sobrepõem (cada temporada exibe seus standings); estado vazio exibido quando temporada sem dados é selecionada

---

**Checkpoint**: US1 + US2 funcionam de forma independente — demonstrar seletor de temporada antes de avançar para US3

---

## Phase 4: US3 — Comparação entre temporadas (Priority: P3)

**Goal**: Na página de Comparativo, o usuário pode selecionar o mesmo time em duas temporadas diferentes e ver gráficos sobrepostos e uma tabela de KPIs lado a lado. O modo atual de "dois times na mesma temporada" permanece intacto.

**Linked requirements**: FR-009, SC-004

**Independent Test**: Selecionar "Arsenal — 2024/25 vs 2023/24" e ver gráfico de gols por rodada sobreposto e tabela comparativa de posse/finalizações/pontos.

- [ ] T014 [US3] Habilitar comparação do mesmo time em duas temporadas diferentes
  - **What**:
    - `frontend/src/pages/Comparativo.tsx` (ou arquivo de comparação existente) — adicionar toggle de modo: "Dois times / Mesma temporada" (comportamento atual) vs "Mesmo time / Duas temporadas" (novo). No modo "duas temporadas":
      - Seletor de um único time (dropdown de `availableTeams`)
      - Seletor de temporada principal (usa `activeSeason` do SeasonContext)
      - Seletor de temporada secundária (dropdown de `availableSeasons`, excluindo a temporada principal)
      - Duas chamadas paralelas usando `api.teams.stats(teamId, season1)` e `api.teams.stats(teamId, season2)` + `api.fixtures.byTeam(teamId, season1)` e `api.fixtures.byTeam(teamId, season2)`
      - Gráfico de linhas Recharts sobreposto: eixo X = rodada, duas séries com cores distintas representando cada temporada (usar cores primárias do tema)
      - Tabela de KPIs lado a lado: colunas "Métrica | YYYY/YY | YYYY/YY", linhas para posse média, finalizações totais, vitórias, empates, derrotas, gols marcados
    - Preservar completamente o modo "dois times / mesma temporada" (radar chart + tabela existente) — sem alterações no comportamento atual
    - Tratar estados de loading (skeleton) e erro (mensagem inline) para cada query independentemente
  - **Why**: FR-009 — modo "mesmo time, temporadas diferentes" na página Comparativo; spec.md cenário: "Comparativo lado a lado de duas temporadas para o mesmo time"
  - **Depends on**: T013
  - **Acceptance**: "Arsenal 2024/25 vs 2023/24" exibe gráfico sobreposto de gols por rodada e tabela de KPIs com dados de ambas as temporadas; modo "dois times / mesma temporada" permanece funcional inalterado; quando uma das temporadas não tem dados, exibe mensagem de temporada indisponível naquela coluna sem quebrar a outra

---

**Checkpoint**: Todas as 3 user stories funcionais — demonstração end-to-end antes da fase de polimento

---

## Phase 5: Polimento, Testes e Validação Final

**Objetivo**: Cobertura de testes obrigatória por constituição, validação de TypeScript, edge cases de UX e limpeza.

- [ ] T015 [P] Garantir cobertura de testes do SeasonsService no backend
  - **What**: `backend/src/seasons/seasons.service.spec.ts` — criar testes unitários com mock do repositório TypeORM (usando `createMock` ou `jest.fn()`):
    1. Quando query retorna `[]`, `listSeasons()` retorna `[]`
    2. Quando query retorna 1 registro (season='2024'), retorna `[{ year: '2024', label: '2024/25', isCurrent: true, ... }]`
    3. Quando query retorna múltiplos (season='2024' e '2023'), retorna ordenado DESC, `isCurrent: true` apenas para '2024'
    4. `label` formatado corretamente: '2024' → '2024/25', '2023' → '2023/24'
    Cobertura ≥ 85% do arquivo `seasons.service.ts`
  - **Why**: Constituição — Princípio IV (Test-First); plan.md — cobertura mínima 85% para `seasons.service.spec.ts`
  - **Depends on**: T007
  - **Acceptance**: `npm test -- --testPathPattern=seasons.service` no backend executa sem erro; cobertura ≥ 85%; os 4 cenários acima têm assertions passando

- [ ] T016 [P] Garantir cobertura de testes do SyncService atualizado
  - **What**: `backend/src/sports-api/sync.service.spec.ts` — atualizar ou adicionar casos de teste:
    1. `triggerSync()` sem season usa `defaultSeason` do ambiente e passa para `runSync`
    2. `triggerSync('2023')` passa `season='2023'` para `runSync`
    3. `runSync('2023')` ao concluir com sucesso grava `statusRecord.lastSyncedSeason = '2023'`
    4. `getStatus()` inclui `lastSyncedSeason` na resposta quando preenchido
    Cobertura ≥ 85% das linhas alteradas
  - **Why**: Constituição — Princípio IV; regression safety para a lógica central de sincronização
  - **Depends on**: T003, T004
  - **Acceptance**: `npm test -- --testPathPattern=sync.service` executa sem erro; os 4 casos acima têm assertions passando

- [ ] T017 [P] Garantir cobertura de testes do SeasonContext e useSeasonData no frontend
  - **What**:
    - `frontend/src/contexts/SeasonContext.test.tsx` — casos:
      1. Quando `GET /api/seasons` retorna `[]`, `activeSeason` é `null`
      2. Quando `GET /api/seasons` retorna `[{year:'2024'}]`, `activeSeason` é `'2024'`
      3. `setActiveSeason('2023')` atualiza URL para `?season=2023`
      4. Carregar página com `?season=2023` na URL e seasons=['2024','2023'] → `activeSeason='2023'`
    - `frontend/src/hooks/useSeasonData.test.ts` — casos:
      1. `season=null` → retorna `{ data: mockFallback, isReal: false, loading: false }`
      2. `season='2024'` → chama fetcher e retorna `{ data: <resultado>, isReal: true }`
      3. Fetcher lança erro → retorna `{ data: mockFallback, error: <mensagem>, isReal: false }`
    Cobertura ≥ 60% em cada arquivo
  - **Why**: Constituição — Princípio IV; valida a lógica central de fallback e propagação de temporada que toda a feature depende
  - **Depends on**: T011, T005
  - **Acceptance**: `npm test` no frontend executa todos os casos sem erro; cobertura ≥ 60% em `SeasonContext.tsx` e `useSeasonData.ts`

- [ ] T018 [P] Garantir cobertura de testes do SeasonSelector e useSyncStatus atualizado
  - **What**:
    - `frontend/src/components/layout/SeasonSelector.test.tsx`:
      1. Com `availableSeasons=[]`, exibe texto "Dados simulados" desabilitado
      2. Com `availableSeasons=[{year:'2024',...},{year:'2023',...}]`, renderiza 2 opções
      3. Selecionar opção '2023' chama `setActiveSeason('2023')`
    - `frontend/src/hooks/useSyncStatus.test.ts` (atualizar):
      4. Transição de status `syncing → success` dispara o callback `onSyncSuccess`
      5. Transição `idle → syncing` não dispara o callback
    Cobertura ≥ 60% em cada arquivo
  - **Why**: Constituição — Princípio IV; garante que o fluxo de sincronização → callback → refresh funciona corretamente
  - **Depends on**: T006, T012
  - **Acceptance**: `npm test` no frontend executa os 5 casos sem erro; cobertura ≥ 60% em `SeasonSelector.tsx` e `useSyncStatus.ts`

- [ ] T019 Validar ausência de erros de TypeScript em frontend e backend
  - **What**: Executar `npx tsc --noEmit` nos diretórios `frontend/` e `backend/`. Corrigir todos os erros de tipo resultantes das alterações desta feature (campos novos em entidades, novos parâmetros em hooks, novas interfaces). Não introduzir `any` implícito.
  - **Why**: Constituição — Princípio II (Type Safety); garante que a feature não degrada o baseline de qualidade de tipo
  - **Depends on**: T013, T014
  - **Acceptance**: `npx tsc --noEmit` em `frontend/` retorna código 0; `npx tsc --noEmit` em `backend/` retorna código 0; zero ocorrências de `any` implícito introduzidas

- [ ] T020 [P] Garantir experiência adequada em edge cases de dados vazios e falhas parciais
  - **What**:
    - `frontend/src/pages/Dashboard.tsx` — quando `activeSeason` não-null mas API retorna dados vazios (array vazio), exibir estado vazio com ícone e mensagem: "Sem dados para esta temporada. Clique em Sincronizar." com botão que aciona o trigger de sync; não exibir gráficos vazios/quebrados
    - Verificar que falha na sincronização (status='error') exibe banner de erro vermelho mas preserva os dados já renderizados no dashboard (cards e gráficos não são limpos)
    - Verificar que trocar de temporada enquanto sync está em andamento não causa erro — a sync continua em background e o frontend mostra a temporada nova (possivelmente com dados vazios ou da temporada anterior como fallback)
  - **Why**: Edge cases do spec.md — banco sem dados para a temporada selecionada e falha parcial de sync; NFR-003 — degradação graciosa
  - **Depends on**: T006
  - **Acceptance**: Com banco vazio (ou temporada sem dados), dashboard exibe estado vazio com CTA em vez de gráficos quebrados; erro de sync não limpa KPI cards; mudar de temporada durante sync não causa erro no console

---

## Dependências e Ordem de Execução

### Ordem por fase

```
Phase 1: T001 → T002
          ↓
Phase 2:  T003 [US1]    T004 [US1] (paralelos entre si)
          └── T005 [US1] (depende T003, T004)
              └── T006 [US1]
Phase 3:  T007 [US2]    T008 [US2]  T009 [US2]  T010 [US2] (paralelos entre si)
          └── T011 [US2] (depende T007, T005)
              └── T012 [US2]
                  └── T013 [US2] (depende T011, T006)
Phase 4:  T014 [US3] (depende T013)
Phase 5:  T015–T020 (paralelos após suas dependências)
```

### Oportunidades de paralelismo

| Tarefas | Por que são paralelas |
|---|---|
| T003 e T004 | Arquivos distintos: `sync.service.ts` vs DTO de status |
| T008, T009, T010 | Arquivos distintos: fixtures, teams, players services |
| T015, T016 | Testes de services diferentes no backend |
| T017, T018, T020 | Testes e validações de componentes diferentes no frontend |

---

## Estratégia de Implementação

### MVP (User Story 1 apenas)

1. Completar **Phase 1** (T001, T002) — migrations e entidades
2. Completar **Phase 2** (T003–T006) — auto-refresh pós-sync + dados reais
3. **PARAR e VALIDAR**: dashboard atualiza sozinho após sync, mostra dados reais
4. Demo / deploy incremental se pronto

### Entrega incremental completa

1. Phase 1 → database pronto
2. Phase 2 (US1) → dashboard ao vivo → Demo MVP
3. Phase 3 (US2) → seletor de temporada → Demo com múltiplas temporadas
4. Phase 4 (US3) → comparação de temporadas → Demo comparativo histórico
5. Phase 5 → testes + polish → Pronto para produção

---

## Definition of Done (da spec)

- [ ] 3 migrations executam e revertem sem erro
- [ ] `GET /api/seasons` retorna lista correta de temporadas
- [ ] `POST /api/sync/trigger` com `{ "season": "2023" }` sincroniza temporada correta
- [ ] `GET /api/teams?season=2023` retorna stats da temporada 2023
- [ ] Dashboard atualiza sem reload após sync concluída (SC-001: ≤ 4s)
- [ ] SeasonSelector exibe apenas temporadas com dados (SC-002)
- [ ] Trocar temporada carrega dados em < 1s (SC-003)
- [ ] Dados de temporadas distintas não se sobrepõem (SC-004)
- [ ] URL reflete temporada ativa via `?season=YYYY` (SC-005)
- [ ] Fallback para mockData quando backend indisponível (NFR-003)
- [ ] Todos os testes obrigatórios passam (Princípio IV da constituição)
- [ ] `npx tsc --noEmit` sem erros em frontend e backend

---

## Notas

- **[P]** = pode rodar em paralelo (toca arquivos distintos, sem dependência intra-fase)
- **[USN]** mapeia cada tarefa à user story correspondente para rastreabilidade completa
- Os títulos descrevem o **resultado de negócio** — detalhes técnicos (caminhos de arquivo, nomes de classe) estão no bloco **What**
- **FR-NNN / NFR-NNN** nos campos **Why** provêm rastreabilidade bidirecional para `spec.md`
- **Depends on** está presente apenas quando há dependência intra-fase real; ausente significa que pode começar após a fase anterior
- Parar em cada **Checkpoint** para validar a story independentemente antes de prosseguir
- Commitar após cada tarefa ou grupo lógico de tarefas paralelas
- Total de tarefas: **20** | US1: 4 | US2: 7 | US3: 1 | Fundação: 2 | Polimento/Testes: 6
