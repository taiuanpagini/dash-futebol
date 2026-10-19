# Project Memory

Living document maintained by the AI agent. Read before every task;
update after significant changes. Keep concise (~3k chars max).

## Architecture & Stack

- Project: Analisador de desempenho futebol
- Template: Dashboard SaaS

## User Preferences

- Initial description: Analisar o desempenho dos times de futebol
- Qual o foco principal da análise de desempenho dos times de futebol?: Desempenho em campo (gols, posse de bola, estatísticas de jogo)
- Quais componentes você gostaria de incluir no dashboard para análise de desempenho em campo?: Gráficos de gols e finalizações, KPI Cards (posse de bola, passes, duelos), Tabelas de estatísticas por partida, Comparativo entre times, Mapa de calor / posicionamento em campo
- Precisa de autenticação para acessar o dashboard?: Não, acesso público
- Qual será a origem dos dados de desempenho dos times?: API esportiva (ex: Football-Data, API-Football)
- Qual estilo visual você prefere para o dashboard?: Colorido / Vibrante (cores dos times)
- Detalhes do projeto: Quero fazer várias analises estatísticas dos times de futebol, desempenho de jogadores ao longo dos anos, times

## Development Log

- 2026-10-19 — Integração com API-Football implementada: SportsApiModule (SportsApiService, SyncService, SyncController), entidades com externalId/logoUrl/photoUrl, seed service com 20 times da PL, botão de sincronização no Header com polling, banner de modo demonstração, endpoints GET /api/sync/status e POST /api/sync/trigger.
- 2026-10-19 — Dashboard completo implementado: KPI cards, 4 gráficos (gols, posse, chutes, mapa de campo), tabela de partidas, artilheiros, comparativo entre times com radar chart, análise de jogadores por rodada. Mock data completo com 15 rodadas, 20 times, top jogadores (Saka, Haaland, Salah, Palmer).

## Conventions & Patterns

- Frontend: React + TypeScript + Tailwind v3 + Recharts para gráficos
- Mock data em `frontend/src/data/mockData.ts` (20 times, 75 fixtures, 5 jogadores com stats)
- Types em `frontend/src/types/football.ts`
- Páginas: Dashboard (`/`), Comparativo (`/comparativo`), Jogadores (`/jogadores`)
- Componentes: `layout/`, `dashboard/`, `comparison/`
- Backend NestJS na porta 5174, frontend Vite na 5173
- CSS variables Premier League theme: primary=purple (#38003c dark mode), accent=green

## Architecture & Stack

- Frontend: React 18 + TypeScript + Vite + Tailwind v3 + Recharts + react-router-dom
- Backend: NestJS + TypeORM + PostgreSQL (porta 5174)
- Entidades TypeORM: Team, Fixture, MatchStats, Player, PlayerStats
- Módulos backend: teams, fixtures, players, seed
- .webbuilder.json configurado para rodar backend em paralelo com Vite

## Conventions & Patterns

- (to be defined by AI after first execution)

## Known Issues & Limitations

- API-Football plano gratuito: 100 req/dia. Uma sincronização completa usa ~42 chamadas (1 times + 1 partidas + 38 stats + 2 jogadores). Cuidado ao sincronizar várias vezes no mesmo dia.
- PlayerStats por rodada (matchweekStats) não é sincronizado da API (custo alto); mantém dados simulados do seed. Apenas stats agregadas da temporada são sincronizadas via /players/topscorers e /players/topassists.
- seed.service.ts cria 20 times com dados base; externalId é preenchido na primeira sincronização com a API.

## Next Steps / Planned

- Continue discovery from the wizard context above.

---

_Session logs: `sessions/` (platform appends automatically)_
_Handoff (if any): `specs/<feature>/handoff.md`_
