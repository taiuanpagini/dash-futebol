# Quickstart — Atualização Pós-Sincronização e Seletor de Temporadas

**Feature**: `001-season-filter-sync-refresh`  
**Date**: 2026-10-20

---

## Para desenvolvedores

### 1. Setup local

```bash
# Rodar migrations para adicionar campo season
cd backend
npm run migration:run

# O backend irá:
# 1. Adicionar season VARCHAR(4) DEFAULT '2024' em fixtures e player_stats
# 2. Adicionar last_synced_season em sync_status
```

### 2. Sincronizar uma temporada específica

```bash
# Via curl — temporada 2023/24
curl -X POST http://localhost:5174/api/sync/trigger \
  -H "Content-Type: application/json" \
  -d '{"season": "2023"}'

# Resposta esperada:
# { "message": "Sincronização iniciada para temporada 2023." }

# Acompanhar status
curl http://localhost:5174/api/sync/status
# { "status": "syncing", "lastSyncedSeason": null }
# ... aguardar ...
# { "status": "success", "lastSyncedSeason": "2023" }
```

### 3. Consultar temporadas disponíveis

```bash
curl http://localhost:5174/api/seasons
# {
#   "seasons": [
#     { "year": "2024", "label": "2024/25", "fixturesCount": 380, "playedCount": 214, "isCurrent": true },
#     { "year": "2023", "label": "2023/24", "fixturesCount": 380, "playedCount": 380, "isCurrent": false }
#   ]
# }
```

### 4. Consultar dados por temporada

```bash
# Times da temporada 2023/24
curl "http://localhost:5174/api/teams?season=2023"

# Stats de um time na temporada 2023/24
curl "http://localhost:5174/api/teams/1/stats?season=2023"

# Rodadas de um time na temporada 2023/24
curl "http://localhost:5174/api/fixtures/team/1/matchweeks?season=2023"

# Artilheiros da temporada 2023/24
curl "http://localhost:5174/api/players/top-scorers?season=2023"
```

---

## Cenários de uso no frontend

### Cenário A — Primeira visita (sem dados reais)

1. Frontend carrega, chama `GET /api/seasons` → retorna `{ seasons: [] }` (nenhuma temporada sincronizada)
2. `SeasonContext` detecta lista vazia → ativa fallback para mockData
3. Dashboard exibe dados simulados com banner "Modo demonstração"
4. Usuário configura API key e clica "Sincronizar" → `POST /api/sync/trigger` sem body (usa temporada padrão do env)
5. `useSyncStatus` detecta transição `syncing → success` → chama `onSyncSuccess()`
6. Dashboard refaz `GET /api/seasons` → lista inclui "2024/25"
7. Dashboard carrega dados reais via `GET /api/teams?season=2024` etc.
8. Banner "Modo demonstração" desaparece

### Cenário B — Alternando entre temporadas

1. Usuário sincronizou 2024 e 2023
2. SeasonSelector exibe dropdown: `["2024/25", "2023/24"]`
3. Usuário seleciona "2023/24"
4. URL muda para `?season=2023`
5. `SeasonContext.activeSeason` atualiza para `"2023"`
6. Todas as queries re-executam com `?season=2023`
7. Gráficos e tabelas exibem dados de 2023/24

### Cenário C — Sincronizar temporada histórica

1. Usuário clica em "Sincronizar" → modal/dropdown permite selecionar temporada
2. Seleciona "2023" → `POST /api/sync/trigger` com `{ "season": "2023" }`
3. Após conclusão, SeasonSelector ganha nova opção "2023/24"

### Cenário D — Comparação entre temporadas (P3)

1. Usuário vai para página Comparativo
2. Ativa modo "Mesmo time, duas temporadas"
3. Seleciona Arsenal + 2024/25 vs 2023/24
4. Frontend faz duas queries paralelas:
   - `GET /api/teams/1/stats?season=2024`
   - `GET /api/teams/1/stats?season=2023`
5. Gráfico de linhas exibe gols por rodada sobrepostos

---

## Pontos de extensão

### Adicionar nova liga (futuro)

O sistema atualmente é hardcoded para Premier League (`leagueId = 39`). Para suportar múltiplas ligas, seria necessário adicionar campo `leagueId` em `Fixture` e `PlayerStats`. Isso está **fora do escopo** desta feature.

### Adicionar auto-sync programado (futuro)

`caching: none` e `backgroundJobs: none` são decisões do projeto. Auto-sync não deve ser implementado aqui.

---

## Estrutura de arquivos a criar

### Backend

```
backend/src/
  seasons/
    seasons.module.ts
    seasons.controller.ts
    seasons.service.ts
  sports-api/
    sync.service.ts        (atualizado — aceita season param)
    sports-api.service.ts  (atualizado — fetchFixturesSeason, fetchTeamsSeason)
    entities/
      sync-status.entity.ts  (atualizado — lastSyncedSeason)
  fixtures/
    entities/
      fixture.entity.ts    (atualizado — season column)
    fixtures.service.ts    (atualizado — season filter)
  players/
    entities/
      player-stats.entity.ts  (atualizado — season column)
    players.service.ts         (atualizado — season filter)
  teams/
    teams.service.ts           (atualizado — season filter)
  migrations/
    YYYYMMDDHHMMSS-AddSeasonToFixtures.ts
    YYYYMMDDHHMMSS-AddSeasonToPlayerStats.ts
    YYYYMMDDHHMMSS-AddLastSyncedSeasonToSyncStatus.ts
```

### Frontend

```
frontend/src/
  contexts/
    SeasonContext.tsx       (NOVO — activeSeason, availableSeasons, setActiveSeason)
  hooks/
    useSyncStatus.ts        (atualizado — aceita onSyncSuccess callback)
    useSeasonData.ts        (NOVO — fetches com fallback mockData)
  components/
    layout/
      Header.tsx            (atualizado — SeasonSelector + sync param)
      SeasonSelector.tsx    (NOVO — dropdown de temporadas)
  lib/
    api.ts                  (atualizado — todos os endpoints com ?season)
  pages/
    Dashboard.tsx           (atualizado — usa useSeasonData)
    TeamComparison.tsx      (atualizado — modo season comparison)
    PlayerStats.tsx         (atualizado — usa useSeasonData)
```
