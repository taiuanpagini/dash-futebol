# Test Scenarios: 001-season-filter-sync-refresh

**Feature**: Atualização Pós-Sincronização e Seletor de Temporadas  
**Created**: 2026-10-20

---

## User Story 1 — Atualização automática após sincronização

### TS-US01-001 — Dashboard atualiza após sync bem-sucedido (Happy Path)

**Covers**: FR-001, FR-002  
**Type**: Integration (frontend + backend)

```gherkin
Given o backend retorna status { status: "success", lastSyncedAt: <timestamp> }
  And o dashboard estava exibindo dados simulados
When o hook useSyncStatus detecta status "success" (transição de "syncing")
Then o hook de dados do dashboard dispara novo fetch para /api/teams e /api/fixtures/team/:id/matchweeks
  And os componentes KpiCards, GoalsChart, PossessionChart e RecentMatchesTable re-renderizam com dados reais
  And o indicador de fonte mostra "Dados reais — 2024/25"
```

### TS-US01-002 — Fallback para mockData quando backend indisponível (Alternative Path)

**Covers**: FR-001, NFR-003  
**Type**: Frontend unit

```gherkin
Given o backend retorna 502 ou não responde em 3s
When o hook de dados tenta buscar /api/teams
Then o hook captura o erro e carrega mockData como fallback
  And o banner "Modo Demonstração" é exibido
  And nenhuma tela de erro quebra o layout
```

### TS-US01-003 — Erro de sync não remove dados anteriores (Error Path)

**Covers**: FR-002  
**Type**: Frontend unit

```gherkin
Given o dashboard exibe dados reais de uma sync anterior
When o status de sync transita para "error"
Then os dados atuais permanecem renderizados
  And o banner vermelho de erro aparece acima dos gráficos
  And nenhum novo fetch de dados é disparado
```

---

## User Story 2 — Seletor de temporada dinâmico

### TS-US02-001 — Listar temporadas disponíveis (Happy Path)

**Covers**: FR-005, FR-007  
**Type**: Integration

```gherkin
Given o banco contém fixtures para as temporadas "2024" e "2023"
When o frontend faz GET /api/seasons
Then a resposta inclui [{ season: "2024", fixturesCount: 38, label: "2024/25" }, { season: "2023", fixturesCount: 38, label: "2023/24" }]
  And o dropdown de temporada exibe ambas as opções
```

### TS-US02-002 — Trocar de temporada recarrega dados (Happy Path)

**Covers**: FR-006, FR-007, FR-008, NFR-004  
**Type**: Integration

```gherkin
Given as temporadas 2024 e 2023 estão disponíveis
  And a temporada ativa é "2024"
When o usuário seleciona "2023/24" no dropdown
Then a URL atualiza para ?season=2023
  And o fetch para /api/fixtures/team/:id/matchweeks?season=2023 é disparado
  And KpiCards e gráficos refletem dados de 2023
  And a seleção persiste ao navegar entre Dashboard e Jogadores
```

### TS-US02-003 — Sincronizar temporada específica (Happy Path)

**Covers**: FR-003, FR-004  
**Type**: Backend integration

```gherkin
Given a temporada 2024 já está no banco
When POST /api/sync/trigger é chamado com body { season: "2023" }
Then SyncService baixa partidas/times/jogadores com season=2023
  And cada fixture salvo tem season="2023"
  And os dados de season="2024" não são alterados
  And GET /api/seasons retorna ambas as temporadas
```

### TS-US02-004 — Estado vazio para temporada não sincronizada (Edge Case)

**Covers**: FR-007  
**Type**: Frontend unit

```gherkin
Given apenas a temporada "2024" está no banco
When o usuário seleciona uma temporada futura ou ainda não sincronizada
Then a mensagem "Sem dados para esta temporada. Clique em Sincronizar." é exibida
  And os gráficos mostram estado vazio (empty state) em vez de erros
```

---

## User Story 3 — Comparação entre temporadas

### TS-US03-001 — Modo "mesmo time, temporadas diferentes" (Happy Path)

**Covers**: FR-009  
**Type**: Integration

```gherkin
Given as temporadas 2024 e 2023 estão sincronizadas
When o usuário na página Comparativo seleciona "mesmo time" = Arsenal e temporadas "2024" e "2023"
Then o gráfico exibe duas linhas sobrepostas de gols por rodada: 2024/25 e 2023/24
  And a tabela de KPIs mostra colunas separadas com os valores de cada temporada
  And o modo comparativo anterior (dois times, mesma temporada) continua acessível via toggle
```

### TS-US03-002 — Comparativo entre times mantido intacto (Regression)

**Covers**: FR-009  
**Type**: Frontend regression

```gherkin
Given as temporadas 2024 e 2023 estão disponíveis
When o usuário acessa a página Comparativo no modo "dois times, mesma temporada"
Then o comportamento atual (radar chart + tabela de stats) é renderizado corretamente
  And nenhum elemento de UI do modo "temporadas" interfere na visualização
```

---

## Edge Cases

### TS-EC-001 — Sync parcial preserva dados

**Covers**: FR-003, FR-004

```gherkin
Given a sincronização de 2023 começa e salva 20 fixtures antes de falhar
When o usuário abre o seletor de temporada
Then a temporada 2023 aparece como disponível (com indicador de dados incompletos se fixturesCount < 38)
  And os 20 fixtures já salvos podem ser visualizados
```

### TS-EC-002 — Troca de temporada durante sincronização ativa

**Covers**: FR-007, FR-008

```gherkin
Given uma sincronização está em andamento (status = "syncing")
When o usuário troca a temporada ativa no seletor
Then a troca é permitida; o dashboard exibe dados da temporada selecionada
  And o botão Sincronizar permanece em estado "Sincronizando…" até completar
  And ao completar, o dashboard atualiza para os dados recém-sincronizados somente se a temporada sincronizada coincidir com a selecionada
```

### TS-EC-003 — API-Football sem dados para temporada solicitada

**Covers**: FR-004

```gherkin
Given o usuário solicita sync da temporada "2010" (fora do histórico da API)
When POST /api/sync/trigger { season: "2010" } é chamado
Then a API-Football retorna array vazio ou erro
  And o backend salva status = "error" com mensagem "Nenhum dado encontrado para a temporada 2010"
  And nenhum dado parcial é inserido no banco para 2010
```

---

## Non-Functional Requirements

### TS-NFR-001 — Tempo de troca de temporada

**Covers**: NFR-001

```gherkin
Given o banco contém ~380 fixtures para a temporada selecionada
When o usuário troca de temporada
Then a resposta do backend chega em < 500ms
  And o re-render do dashboard completa em < 1000ms total (medido via browser perf)
```

### TS-NFR-002 — URL persistência de temporada

**Covers**: NFR-004

```gherkin
Given o usuário está no dashboard com temporada 2023 ativa (?season=2023)
When o usuário copia e cola a URL em outra aba
Then a outra aba abre com a temporada 2023 selecionada automaticamente
  And o seletor mostra "2023/24" como ativo
```
