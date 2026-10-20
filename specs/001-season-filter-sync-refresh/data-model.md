# Data Model — Atualização Pós-Sincronização e Seletor de Temporadas

**Feature**: `001-season-filter-sync-refresh`  
**Date**: 2026-10-20

---

## Visão geral

Esta feature **não cria novas tabelas**. As mudanças são:
1. Adição do campo `season` em `fixtures` e `player_stats`
2. Adição do campo `last_synced_season` em `sync_status`
3. Os agregados de time (`wins`, `draws`, etc.) em `teams` **permanecem** como cache da última sync; a lógica de consulta passa a computar por temporada via `MatchStats ↔ Fixture.season`

---

## 1. Entidade: Fixture (modificada)

**Tabela**: `fixtures`

| Campo | Tipo | Novo? | Descrição |
|---|---|---|---|
| `id` | PK (serial) | — | Identificador interno |
| `externalId` | integer (nullable) | — | ID na API-Football |
| `season` | varchar(4) NOT NULL | **✅ NOVO** | Ano de início da temporada (ex: `"2024"`) |
| `matchweek` | integer | — | Número da rodada (1–38) |
| `date` | date | — | Data da partida |
| `home_team_id` | FK → teams.id | — | Time mandante |
| `away_team_id` | FK → teams.id | — | Time visitante |
| `homeGoals` | integer (default 0) | — | Gols do mandante |
| `awayGoals` | integer (default 0) | — | Gols do visitante |
| `played` | boolean (default false) | — | Se a partida já ocorreu |

**Índices novos**:
- `idx_fixtures_season` on `(season)`
- `idx_fixtures_season_home` on `(season, home_team_id)`
- `idx_fixtures_season_away` on `(season, away_team_id)`

**Migration**: `ALTER TABLE fixtures ADD COLUMN season VARCHAR(4) NOT NULL DEFAULT '2024';`

---

## 2. Entidade: PlayerStats (modificada)

**Tabela**: `player_stats`

| Campo | Tipo | Novo? | Descrição |
|---|---|---|---|
| `id` | PK (serial) | — | Identificador interno |
| `player_id` | FK → players.id | — | Jogador |
| `season` | varchar(4) NOT NULL | **✅ NOVO** | Ano de início da temporada |
| `goals` | integer | — | Total de gols na temporada |
| `assists` | integer | — | Total de assistências |
| `appearances` | integer | — | Jogos disputados |
| `minutesPlayed` | integer (nullable) | — | Minutos totais |
| (demais campos existentes) | … | — | Mantidos sem alteração |

**Índices novos**:
- `idx_player_stats_season` on `(season)`
- `idx_player_stats_player_season` on `(player_id, season)` — UNIQUE

**Migration**: `ALTER TABLE player_stats ADD COLUMN season VARCHAR(4) NOT NULL DEFAULT '2024';`

---

## 3. Entidade: SyncStatus (modificada)

**Tabela**: `sync_status`

| Campo | Tipo | Novo? | Descrição |
|---|---|---|---|
| `id` | PK (serial) | — | Identificador |
| `status` | varchar | — | `'idle'` \| `'syncing'` \| `'success'` \| `'error'` |
| `errorMessage` | text (nullable) | — | Mensagem de erro |
| `lastSyncedSeason` | varchar(4) (nullable) | **✅ NOVO** | Temporada da última sync bem-sucedida |
| `updatedAt` | timestamp | — | Momento da última atualização |

**Migration**: `ALTER TABLE sync_status ADD COLUMN last_synced_season VARCHAR(4);`

---

## 4. Entidade: Team (sem mudança estrutural)

Os campos `wins`, `draws`, `losses`, `goalsScored`, `goalsConceded`, `cleanSheets` permanecem como cache denormalizado da última temporada sincronizada. Para consultas season-scoped, `TeamsService.getTeamSeasonStats(id, season)` computará os valores a partir de `MatchStats ↔ Fixture.season`.

---

## 5. DTOs de resposta — novos contratos

### SeasonSummaryDto (novo — não é tabela)

```typescript
interface SeasonSummaryDto {
  year: string;        // ex: "2024"
  label: string;       // ex: "2024/25"
  fixturesCount: number;
  playedCount: number;
  isCurrent: boolean;  // true se for a temporada com maior ano
}
```

### SeasonsResponseDto (novo)

```typescript
interface SeasonsResponseDto {
  seasons: SeasonSummaryDto[];
}
```

### SyncTriggerDto (atualizado)

```typescript
class SyncTriggerDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}$/)
  season?: string;  // ex: "2024" — se omitido, usa SPORTS_API_SEASON do .env
}
```

### SyncStatusResponseDto (atualizado)

```typescript
interface SyncStatusResponseDto {
  status: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage?: string;
  lastSyncedSeason?: string;  // NOVO
}
```

---

## 6. Diagrama de relacionamentos (simplificado)

```
Team ──┐
       ├── Fixture (season) ──── MatchStats
Team ──┘
                                      │
Player ──────── PlayerStats (season)  │
                                      │
                          SyncStatus (lastSyncedSeason)
```

---

## 7. Migração de dados

### Estratégia
TypeORM migrations com `up()` e `down()` reversíveis.

| Migration | Descrição |
|---|---|
| `AddSeasonToFixtures` | `ALTER TABLE fixtures ADD COLUMN season VARCHAR(4) NOT NULL DEFAULT '2024'` |
| `AddSeasonToPlayerStats` | `ALTER TABLE player_stats ADD COLUMN season VARCHAR(4) NOT NULL DEFAULT '2024'` |
| `AddLastSyncedSeasonToSyncStatus` | `ALTER TABLE sync_status ADD COLUMN last_synced_season VARCHAR(4)` |

### Rollback
Cada migration terá `down()` com `ALTER TABLE ... DROP COLUMN ...`.

> **Nota**: O DEFAULT `'2024'` garante que todos os dados existentes fiquem associados à temporada 2024/25 — sem dados órfãos após a migration.
