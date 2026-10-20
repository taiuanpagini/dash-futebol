# Feature Specification: Atualização Pós-Sincronização e Seletor de Temporadas

**Feature Branch**: `001-season-filter-sync-refresh`
**Created**: 2026-10-20
**Status**: Draft

## Business Proposition

O dashboard exibe dados reais somente depois de reiniciar a página após uma sincronização, e a temporada analisada é sempre 2024/25 fixo. Esta feature permite que o painel atualize automaticamente os gráficos e tabelas ao concluir uma sincronização, sem que o usuário precise recarregar a página. Além disso, adiciona um seletor de temporada no painel para que o usuário possa alternar entre diferentes edições do campeonato (ex.: 2023/24, 2022/23) e comparar a evolução de desempenho de um time ao longo de múltiplas temporadas.

---

## User Scenarios & Testing

### User Story 1 — Atualização automática após sincronização (Priority: P1)

**As a** analista de futebol  
**I want** que os gráficos e cards do dashboard atualizem imediatamente quando uma sincronização terminar  
**So that** eu veja os dados reais sem precisar recarregar a página manualmente

Hoje o dashboard lê apenas dados simulados (`mockData.ts`) mesmo quando o banco já foi populado pela sincronização com a API. O polling do botão "Sincronizar" detecta o fim da sincronização mas não aciona nenhuma recarga dos dados. O usuário precisa apertar F5 para ver qualquer mudança.

**Why this priority**: É o bloqueio mais crítico — sem ele, sincronizar não tem efeito visível nenhum, tornando o botão de sincronização inútil do ponto de vista do usuário.

**Independent Test**: Realizar uma sincronização completa e observar os cards e gráficos atualizarem sem reload de página.

**Acceptance Scenarios**:

```gherkin
Scenario: Dashboard atualiza ao concluir sincronização
  Given o usuário está com o dashboard aberto
  And o status de sincronização é "idle" ou "success"
  When o usuário clica em "Sincronizar" e a sincronização conclui com sucesso
  Then os KPI cards, gráficos e tabela de partidas refletem os dados recém-sincronizados
  And nenhum reload de página é necessário

Scenario: Dashboard continua mostrando dados simulados enquanto API não está configurada
  Given a chave de API não está configurada
  When o usuário acessa o dashboard
  Then os dados do mockData são exibidos com o banner de "modo demonstração"
  And o indicador de fonte de dados mostra "Dados simulados"

Scenario: Erro na sincronização não limpa os dados já exibidos
  Given o dashboard exibe dados reais de uma sincronização anterior
  When o usuário dispara nova sincronização que falha
  Then os dados anteriores permanecem visíveis
  And o banner de erro informa o problema sem remover os gráficos
```

---

### User Story 2 — Seletor de temporada dinâmico (Priority: P2)

**As a** analista de futebol  
**I want** escolher qual temporada quero analisar em um seletor no dashboard  
**So that** eu possa ver a evolução histórica de um time e não ficar restrito à temporada corrente

A cada sincronização, o sistema baixa dados de uma temporada específica. O usuário deve poder sincronizar múltiplas temporadas (ex.: 2024, 2023, 2022) e depois alternar entre elas no painel sem precisar re-sincronizar.

**Why this priority**: Expande muito o valor analítico; sem isso o dashboard sempre mostra o mesmo recorte temporal.

**Independent Test**: Sincronizar a temporada 2023/24, depois selecionar essa temporada no seletor e ver os dados correspondentes.

**Acceptance Scenarios**:

```gherkin
Scenario: Usuário alterna entre temporadas sincronizadas
  Given duas ou mais temporadas foram sincronizadas (ex.: 2024 e 2023)
  When o usuário seleciona "2023/24" no seletor de temporada
  Then todos os gráficos, KPIs e tabelas recarregam com dados da temporada 2023/24
  And o seletor exibe a temporada ativa como "2023/24"

Scenario: Apenas temporadas disponíveis aparecem no seletor
  Given somente a temporada 2024 foi sincronizada
  When o usuário abre o seletor de temporada
  Then apenas "2024/25" aparece como opção disponível
  And as temporadas não sincronizadas aparecem como indisponíveis / "Não sincronizada"

Scenario: Sincronizar nova temporada sem sobrescrever a existente
  Given a temporada 2024 já está no banco
  When o usuário aciona sincronização para a temporada 2023
  Then os dados de 2023 são salvos separadamente no banco
  And ao trocar para 2023/24 no seletor, os dados corretos são exibidos
  And os dados de 2024/25 permanecem intactos

Scenario: Primeira sincronização define a temporada padrão
  Given nenhuma temporada foi sincronizada anteriormente
  When a primeira sincronização termina (padrão: temporada atual)
  Then a temporada sincronizada é automaticamente selecionada no seletor
```

---

### User Story 3 — Comparação entre temporadas (Priority: P3)

**As a** analista de futebol  
**I want** comparar as estatísticas de desempenho de um mesmo time entre duas temporadas diferentes  
**So that** eu possa avaliar se o time melhorou ou piorou em métricas chave ao longo dos anos

Uma nova visão de "Comparação de Temporadas" (ou expansão da página de Comparativo existente) mostrará dois conjuntos de dados lado a lado: mesmas métricas (gols, posse, passes, vitórias) para o mesmo time em temporadas diferentes.

**Why this priority**: Recurso analítico avançado; requer que P2 já esteja funcionando.

**Independent Test**: Selecionar "Arsenal — 2024/25 vs 2023/24" e ver gráfico comparativo de gols por rodada e tabela de KPIs.

**Acceptance Scenarios**:

```gherkin
Scenario: Comparativo lado a lado de duas temporadas para o mesmo time
  Given as temporadas 2024 e 2023 estão sincronizadas
  When o usuário acessa a página de Comparativo e seleciona "mesmo time, temporadas diferentes"
  Then um gráfico de linha sobreposto exibe gols por rodada para as duas temporadas
  And uma tabela de KPIs mostra posse média, finalizações e pontos para cada temporada

Scenario: Comparativo entre dois times na mesma temporada (comportamento atual preservado)
  Given dois times são selecionados na mesma temporada
  When o usuário acessa o comparativo
  Then o comportamento atual (radar chart + tabela) é mantido inalterado
```

---

### Edge Cases

- E se o banco não tiver dados para a temporada selecionada? → Exibir estado vazio com mensagem "Sem dados para esta temporada. Clique em Sincronizar."
- E se a sincronização de uma temporada antiga falhar parcialmente? → Preservar os dados parciais já salvos; exibir aviso de dados incompletos.
- E se a API-Football não tiver dados históricos para a liga/temporada solicitada? → Propagar mensagem de erro clara no banner.
- E se o usuário trocar de temporada enquanto uma sincronização está em andamento? → Permitir a troca; a sincronização continua em background.
- E se duas janelas do browser estiverem abertas e uma sincronizar? → A outra janela não precisa atualizar automaticamente (sem WebSocket — polling no status é suficiente).

---

## Requirements

### Functional Requirements

- **FR-001**: O dashboard DEVE buscar dados reais do backend (PostgreSQL via API REST) em vez de `mockData.ts`, quando dados reais estiverem disponíveis.
- **FR-002**: O frontend DEVE recarregar todos os dados do dashboard automaticamente quando o status de sincronização transitar de `syncing` para `success`.
- **FR-003**: O backend DEVE persistir os dados por temporada — cada fixture, estatística de partida e dados de jogadores DEVEM incluir o campo `season` (ex.: `"2024"`).
- **FR-004**: O endpoint `POST /api/sync/trigger` DEVE aceitar um parâmetro opcional `season` (padrão: temporada configurada no ambiente) para sincronizar uma temporada específica.
- **FR-005**: O endpoint `GET /api/seasons` DEVE retornar a lista de temporadas já sincronizadas no banco, com contagem de partidas e status de completude.
- **FR-006**: Todos os endpoints de consulta (`/teams`, `/fixtures/team/:id/matchweeks`, `/players/team/:id`) DEVEM aceitar query param `?season=YYYY` para filtrar por temporada.
- **FR-007**: O frontend DEVE exibir um seletor de temporada (dropdown) no header ou no topo do dashboard, listando apenas temporadas disponíveis no banco.
- **FR-008**: A temporada selecionada DEVE ser propagada globalmente (React Context ou Redux slice) para todas as páginas (Dashboard, Comparativo, Jogadores).
- **FR-009**: A página de Comparativo DEVE oferecer modo "mesmo time, temporadas diferentes" além do modo atual "dois times, mesma temporada".
- **FR-010**: O dashboard DEVE indicar visualmente a fonte dos dados: "Dados reais — 2024/25" ou "Dados simulados".

### Non-Functional Requirements

- **NFR-001 (Performance)**: Trocar de temporada no seletor DEVE recarregar os dados em menos de 1s (resposta da API local).
- **NFR-002 (Compatibilidade)**: A mudança de fonte de dados (mock → API) NÃO DEVE quebrar o layout ou componentes de visualização; os contratos de dados permanecem compatíveis.
- **NFR-003 (Graceful Degradation)**: Se o backend estiver indisponível, o dashboard DEVE usar `mockData.ts` como fallback e exibir banner informativo.
- **NFR-004 (Consistência)**: A temporada ativa DEVE persistir na URL (query param `?season=2024`) para que o link possa ser compartilhado.

### Key Entities

- **Season** (conceitual): Representa uma edição do campeonato (ex.: `"2024"` = temporada 2024/25). Identificada pelo ano de início. Não é uma entidade nova no banco — é um campo em `Fixture` e `PlayerStats`.
- **Fixture** (já existe): Precisa receber campo `season: string` para isolar partidas por edição do campeonato.
- **MatchStats** (já existe): Associada indiretamente à temporada via `Fixture` — não precisa de campo próprio.
- **Player / PlayerStats** (já existe): `PlayerStats` precisa do campo `season: string` para separar artilheiros por temporada.
- **SyncStatus** (já existe): Pode ser estendido com campo `season` para registrar qual temporada foi sincronizada por último.

---

## Architectural Considerations

### Caching

- **Needed?** NO
- **Justification**: Volume de dados pequeno (Premier League: ~380 partidas/temporada × 2–5 temporadas). Consultas locais ao PostgreSQL completam em < 50ms. Caching adicionaria complexidade sem benefício mensurável. Decisão do projeto: `caching: none`.

### Message Queues / Async Processing

- **Needed?** NO
- **Justification**: A sincronização já é processada de forma assíncrona em background no `SyncService.runSync()`. O polling de 2s no frontend é suficiente para detectar conclusão. Filas adicionariam overhead sem necessidade.

### Event Streaming

- **Needed?** NO
- **Justification**: O polling de 2s no `useSyncStatus` já cobre o caso de uso de "notificar conclusão de sync". WebSocket seria over-engineering para este volume e frequência de updates.

### Background Jobs / Scheduled Tasks

- **Needed?** NO
- **Justification**: Sincronização é disparada manualmente pelo usuário (limitação do plano gratuito da API: 100 req/dia). Auto-agendamento poderia esgotar a cota inadvertidamente.

---

## Test Scenarios

> **Test scenarios para esta feature estão documentados em [`test-scenarios.md`](./test-scenarios.md)**.
> Total scenarios: 12 | Per user story: US1=3, US2=4, US3=2 | Edge cases: 3 | NFR: 2

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Após sincronização concluída, o dashboard exibe dados atualizados em até 4 segundos (intervalo de polling + render) sem reload de página.
- **SC-002**: O seletor de temporada lista corretamente apenas as temporadas que possuem dados no banco.
- **SC-003**: Trocar de temporada no seletor recarrega os dados do dashboard em menos de 1 segundo.
- **SC-004**: Dados de temporadas distintas sincronizadas não se sobrepõem — cada temporada exibe seus próprios standings e estatísticas.
- **SC-005**: A URL reflete a temporada ativa via `?season=YYYY`, permitindo compartilhamento de links.
