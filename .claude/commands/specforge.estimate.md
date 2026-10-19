---
description: Estimate project size, effort, team composition, and pricing using AI-accelerated delivery and value-based pricing.
model: claude-opus-4-8
handoffs:
  - label: Generate Tasks
    agent: specforge.tasks
    prompt: Break the plan into implementation tasks
  - label: Create Report
    agent: specforge.implement
    prompt: Start the implementation
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Project Structure

This project uses **SpecForge** for Spec-Driven Development. Key paths:

- **Config**: `.specforge.yaml` (project root) — contains `stack`, `projectName`, `specsDir`, `decisions`, and optionally `team` (team members with roles)
- **Specs directory**: Configured in `.specforge.yaml` under `specsDir` (default: `specs/`)
- **Feature directories**: `<specsDir>/NNN-feature-name/` (e.g., `specs/001-user-auth/`)
- **Constitution**: `constitution.md` (project root)
- **Architectural Decisions**: `architectural-decisions.md` (project root)

## Output Rules

> **IMPORTANT**: Template files under `<specsDir>/templates/` and `<specsDir>/shared/` are **READ-ONLY references**. NEVER modify, overwrite, or write to any file inside the `templates/` or `shared/` directories. The estimate is a NEW file at the designated output path.

| Artifact | Output Path | Notes |
|---|---|---|
| Project estimate | `<specsDir>/estimate.md` | New file at specs root (not inside a feature dir) |

## Branch-Per-Feature Workflow

The `/specforge.estimate` command operates at the **project level** — it scans ALL feature directories to produce a consolidated estimate. It can run from any branch (main or a feature branch), since it reads all `<specsDir>/NNN-*` directories regardless of the current branch.

However, for the most accurate estimate, ensure all feature branches have been merged (or at least their spec artifacts are available on the current branch). If running from a feature branch, the estimate will only include features whose directories exist on that branch.

## AI-Accelerated Delivery Model

SpecForge projects assume **~70% of code is produced by AI** (coding assistants, Copilot, Claude Code, Cursor, Devin, etc.). This fundamentally changes how we estimate:

- **Sprint velocity increases ~3.3x** — AI agents reduce ~70% of coding effort, so time is multiplied by 0.3
- **Team focus shifts** — developers spend more time on architecture, code review, prompt engineering, and quality assurance than on writing boilerplate
- **AI tooling has a cost** — approximately **US$ 300 per FTE per month** for AI subscriptions (Copilot, Claude, Cursor, etc.)

### AI Acceleration Factor

AI agents impact primarily the coding phase (~70% of total effort). The acceleration factor is applied as a **0.3 multiplier** on traditional sprint estimates (i.e., 70% reduction in time).

```
AI-Adjusted Sprints = CEIL(Traditional Sprints × 0.3)
```

## Pricing Philosophy: Selling Rates

The estimate uses **selling rates** that already include all costs (salary, taxes, overhead, and margin). This produces **two separate views** of the same project:

### 1. Client-Facing Investment (Part 1 — shared with client)

Calculated directly from selling rates × dedication × hours × sprints. The client sees:
- Total investment and monthly investment (no rate breakdown)
- Sprint roadmap and milestones
- ROI analysis

### 2. Internal Cost Analysis (Part 2 — CONFIDENTIAL)

Compares the client investment (from selling rates) against actual operational costs to track profitability:
- Actual internal cost rates (lower than selling rates)
- AI tooling subscriptions (from rate card, pro-rata by dedication)
- Gross margin analysis (client investment − internal cost)

> **RULE**: The client should NEVER see internal cost rates, AI tooling costs, or margin analysis. The client sees only the **total investment** calculated from selling rates. Do NOT add margin on top of selling rates — margin is already embedded.

## Outline

1. **Setup**: Read `.specforge.yaml` from the project root. Extract `projectName`, `stack`, `specsDir`, `decisions`, and `team` (if present). If missing, instruct user to run `specforge init` first. The `team` array contains members with `name`, `email`, `roles`, and optional `isAgent` flag.

2. **Gather artifacts**: Scan all feature directories under `<specsDir>/` and collect:
   - `spec.md` — feature specification (Business Proposition, user stories, acceptance criteria)
   - `plan.md` — implementation plan (summary, tech stack, design artifacts)
   - `tasks.md` — task breakdown (**required** — run `/specforge.tasks` first for accurate estimates)
   - `data-model.md` — data model (entities, relationships)
   - `contracts/` — API contracts
   - Count the number of features, user stories, entities, endpoints, and **tasks per feature**
   - If `tasks.md` is missing for any feature, **warn the user** and recommend running `/specforge.tasks` first. Proceed with reduced accuracy if the user confirms

3. **Read rate card**: Look for rate card configuration in this order:
   - `$ARGUMENTS` may contain custom rates or team preferences
   - `.specforge.yaml` under `ratecard` key (if present)
   - Fetch from **https://specforge.apdigitalservices.com.br/assets/ratecard.md** (the single source of truth for selling rates, dedications, and AI tooling costs)

4. **Classify project complexity**: Based on the collected artifacts, determine:
   - **Small** (1-3 features, simple integrations, basic CRUD) — multiplier: 1.0x
   - **Medium** (4-8 features, moderate integrations, business rules) — multiplier: 1.5x
   - **Large** (9+ features, complex integrations, high availability) — multiplier: 2.5x

5. **Calculate effort with AI acceleration**:

### Rate Card

Selling rates, team composition, dedication percentages, and AI tooling costs are defined in the **published rate card** (not hardcoded here). When executing this command:

1. Read rate card values from `$ARGUMENTS` or `.specforge.yaml` under `ratecard` key (if present)
2. If not provided, fetch from **https://specforge.apdigitalservices.com.br/assets/ratecard.md**
3. The rate card defines: selling rates per role, dedication percentages, AI tooling costs, and sprint parameters

Key principles from the rate card:
- Rates are **selling prices** (already include salary, taxes, overhead, and margin) — do NOT add margin on top
- The Architect role has **partial dedication** (shared across projects) — not full-time
- AI tooling cost is **internal only** — apply pro-rata by dedication, never expose to client

### Team Composition (Base Team — 3 people)

All projects use a **base team of 3 people** with partial allocation for Architect and PO.
Team roles, dedication percentages, and hours/sprint are defined in the rate card.
Calculate effective FTEs and hours from the rate card dedication values.

#### Role Focus by Project Archetype

Read the project `stack` from `.specforge.yaml` and adapt role descriptions accordingly:

| Archetype | Stacks | Dev Profile + Focus | Architect Focus | PO Focus |
|---|---|---|---|---|
| Web/Fullstack | web-nestjs, web-fastapi, web-dotnet | Fullstack — Frontend + Backend, UI/UX, integrations | Full-stack architecture, Clean Arch, code review | Backlog, acceptance, UX review |
| Mobile | mobile-nestjs, mobile-fastapi | Mobile — React Native app + API, offline-first, push | Mobile + API architecture, performance | Backlog, acceptance, device testing |
| API/Backend | api-nestjs, api-fastapi, api-dotnet | Desenvolvedor — REST/GraphQL APIs, business logic, integrations | API architecture, security, contracts | API contracts, docs, acceptance |
| Data + ML | data-ml | Cientista de Dados — ML models, training pipelines, feature engineering | MLOps architecture, experiment tracking, serving | Business metrics, model validation |
| Data Eng | data-engineering | Engenheiro de Dados — ETL/ELT, data pipelines, dbt transformations | Data architecture (Medallion), orchestration | Data validation, lineage |
| MCP | mcp-python, mcp-typescript | Desenvolvedor — Tools, resources, prompts, LLM integration | MCP architecture, security, transport | Tool tests, docs, acceptance |

### Sprint Parameters

| Parameter | Value |
|---|---|
| Sprint Duration | 2 weeks |
| Hours per Sprint (per person) | 80 hours |
| Working Days per Sprint | 10 days |
| Hours per Day | 8 hours |

### Traditional vs AI-Accelerated Sprints (Base Team — 3 people)

AI-adjusted sprints use the **0.3 multiplier** (70% reduction). Values are rounded up.

| Complexity | Traditional | AI-Accelerated | Duration |
|---|---|---|---|
| Small (1-3 features) | ~4 sprints (8 wk) | ~2 sprints (4 wk) | ~1 month |
| Medium (4-8 features) | ~8 sprints (16 wk) | ~3 sprints (6 wk) | ~1.5 months |
| Large (9+ features) | ~14 sprints (28 wk) | ~5 sprints (10 wk) | ~2.5 months |

These estimates serve as **guidelines**. For projects with `tasks.md` available, derive sprint count from the actual task breakdown instead.

6. **Calculate client investment** (selling rates — direct pricing, no margin step):

```
# Investment per role per sprint
Role Investment = rate_per_hour × hours_per_sprint × dedication × headcount

# Investment per sprint (sum all roles)
Sprint Investment = SUM(Role Investment) for each role

# Total investment
Base Investment = Sprint Investment × AI-Adjusted Sprints

# Apply complexity multiplier
Total Investment = Base Investment × Complexity Multiplier

# Monthly investment
Monthly Investment = Total Investment / project_duration_months
```

> The selling rates already include margin. Do NOT add an additional markup.

7. **Present investment to client**:
   The Total Investment from step 6 IS the client price (rates already include margin). Present as:
   - Total investment (not "cost")
   - Monthly investment breakdown
   - Value delivered (business outcomes, not features)
   - ROI projection (investment vs expected return)


8. **Calculate traditional approach comparison** (for the client-facing "Traditional vs AI-Accelerated" section):

   **Traditional sprint count**: Reverse the AI acceleration to get the traditional estimate:
   ```
   Traditional Sprints = AI-Adjusted Sprints / 0.3  (i.e., undo the 70% reduction)
   ```
   Round to the nearest integer. This gives the number of sprints the same project would take with a traditional (non-AI) team.

   **Traditional team composition**: A traditional team for the same scope would typically need:
   - **Web/Mobile projects**: 1 Frontend + 1 Backend + 1 Architect (50%) + 1 PO (100%) + 1 QA (100%) = ~5 people
   - **API/Backend projects**: 2 Developers + 1 Architect (50%) + 1 PO (100%) + 1 QA (100%) = ~5 people
   - **Data/ML projects**: 1 Cientista de Dados + 1 Engenheiro de Dados + 1 Architect (50%) + 1 PO (100%) + 1 QA (100%) = ~5 people
   - **MCP projects**: 2 Developers + 1 Architect (50%) + 1 PO (50%) + 1 QA (50%) = ~4 people

   Use the appropriate profiles and rates from the rate card to calculate the traditional cost. Key differences from AI-accelerated:
   - More people (4-6 vs 3)
   - Full-time dedications for most roles (no partial Architect/PO)
   - More sprints (no 0.3 multiplier)

   ```
   Traditional Investment = SUM(profile_rate × hours_per_sprint × dedication × traditional_sprints) for each role
   ```

   Present both approaches in the "Traditional vs AI-Accelerated Development" section of Part 1, with a clear comparison table showing team size, timeline, investment, and savings.

9. **Internal team allocation**: Use the **base team of 3 people** with dedication percentages (Dev 100%, Architect 30%, PO 50%) for internal cost calculations. The team composition goes in Part 2 (confidential) only — the client sees only the total investment and timeline.

10. **Plan sprints with roadmap**: Using the tasks from `tasks.md` for each feature, create a sprint-by-sprint roadmap:
   - Map task phases to sprints (each sprint = 2 weeks)
   - Apply AI acceleration factor to sprint assignments (tasks complete faster)
   - Assign user stories to sprints based on dependencies and priority
   - Identify parallel work opportunities ([P] markers)
   - Show a visual timeline with milestones and deliverables per sprint
   - Include a Gantt-style text roadmap showing overlapping work streams
   - Flag any sprint that exceeds capacity and suggest redistribution
   - **Note**: AI acceleration means more user stories can fit per sprint

11. **Generate estimate document**: Create `<specsDir>/estimate.md` with:

### Estimate Document Structure

The estimate document has **two parts**: an internal section (confidential) and a client-facing section.

```markdown
# Project Estimate: {{projectName}}

---

# PART 1: CLIENT-FACING PROPOSAL (share with client)

## Executive Summary
- **Project**: {{projectName}}
- **Stack**: (from .specforge.yaml)
- **Features**: (count)
- **Complexity**: Small/Medium/Large
- **Delivery Model**: AI-Accelerated Development
- **Estimated Timeline**: X weeks (Y months)

## Delivery Approach

We leverage **AI-accelerated development** to deliver faster and with higher quality:
- Modern AI coding assistants accelerate boilerplate, testing, and scaffolding
- Our team focuses on architecture, business logic, and quality assurance
- This approach delivers **~3x faster** than traditional development
- Continuous integration and automated testing ensure quality at speed

## Feature Breakdown
For each feature:
- Feature name
- Business proposition (from spec.md → Business Proposition — technology-agnostic, focused on who benefits and what they can do)
- Key capabilities (in business terms, not technical components)
- Estimated complexity contribution

## Delivery Timeline

- **Duration**: Y weeks (Z months)
- **Sprints**: X (2-week sprints)
- **AI-Accelerated**: ~3x faster than traditional development

## Investment

> The investment reflects the **value delivered** to your business — including accelerated time-to-market, reduced technical risk, and production-ready quality.

- **Total Investment**: R$ ...
- **Monthly Investment**: R$ .../month
- **Duration**: Z months

## Traditional vs AI-Accelerated Development

> This section compares what this project would cost and how long it would take
> using a **traditional development approach** (no AI acceleration) versus
> our **AI-accelerated model**. The goal is to make the value advantage clear.

### Traditional Approach (without AI)

A traditional delivery for this project would require:

**Traditional Team** (X people, all full-time):

| Profile | Count | Dedication | Hours/Sprint | Selling Rate/hr | Sprints | Subtotal |
|---|---|---|---|---|---|---|
| (e.g., Frontend) | 1 | 100% | 80h | (from rate card) | X | R$ ... |
| (e.g., Backend/Fullstack) | 1 | 100% | 80h | (from rate card) | X | R$ ... |
| Arquiteto de Software | 1 | 50% | 40h | (from rate card) | X | R$ ... |
| Product Owner | 1 | 100% | 80h | (from rate card) | X | R$ ... |
| Tester / QA / Automacao | 1 | 100% | 80h | (from rate card) | X | R$ ... |

- **Team size**: X people
- **Timeline**: X sprints (Y weeks / Z months)
- **Total Investment**: R$ ...
- **Monthly Investment**: R$ .../month

### AI-Accelerated Approach (AP Digital Services)

Our AI-empowered model delivers the same scope with a leaner team and faster timeline:

- **Team size**: 3 people (1 Dev + 1 Architect 30% + 1 PO 50%)
- **Timeline**: X sprints (Y weeks / Z months)
- **Total Investment**: R$ ...
- **Monthly Investment**: R$ .../month

### Comparison Summary

| Dimension | Traditional | AI-Accelerated | Advantage |
|---|---|---|---|
| Team size | X people | 3 people | Y fewer people |
| Timeline | X months | Y months | Z months faster |
| Total Investment | R$ ... | R$ ... | R$ ... savings (XX%) |
| Monthly Investment | R$ .../month | R$ .../month | R$ ... savings |
| Time-to-market | X months | Y months | Z months earlier |
| Quality | Manual testing | AI-assisted testing + human review | Higher coverage |

> **Why the difference?** Our AI-accelerated model uses advanced coding assistants
> (Copilot, Claude, Cursor) that produce ~70% of boilerplate, tests, and scaffolding
> code. Our specialists focus on what AI cannot replace: architecture decisions,
> business logic validation, code review, and quality assurance. The result is
> **faster delivery, lower investment, and equal or superior quality**.

## Return on Investment (ROI)
- **Problem cost**: What the current situation costs (manual processes, lost revenue, inefficiency)
- **Solution value**: What the delivered system enables (automation, revenue, competitive advantage)
- **Payback period**: Expected time to recover the investment
- **12-month ROI**: Projected return after 1 year

## Sprint Roadmap

### Timeline Overview
| Sprint | Dates | Focus | Key Deliverables |
|---|---|---|---|
| Sprint 1 | Wk 1-2 | Setup + Foundation | Project skeleton, DB schema, auth |
| Sprint 2 | Wk 3-4 | Feature A - Core | Core API + basic UI |
| ... | ... | ... | ... |

### Roadmap View
```
Sprint 1  |████ Setup + Foundation          |
Sprint 2  |████ Feature A Core              |████ Feature A Secondary        |
Sprint 3  |████ Feature B Core              |████ Feature B Secondary        |
...       |                                  |
Sprint N  |████ Polish + QA + UAT           |
```

### Milestones
| Milestone | Sprint | Date | Deliverable |
|---|---|---|---|
| MVP | Sprint X | Week Y | Core features functional |
| Beta | Sprint X | Week Y | All features, internal testing |
| Launch | Sprint X | Week Y | Production release |

## Assumptions & Risks
- List key assumptions about scope, integrations, dependencies
- Identify risks that could affect the estimate
- Note any items that need clarification before commitment

## Recommendation
- Recommended option with justification
- Suggested timeline and milestones
- Next steps

---

# PART 2: INTERNAL COST ANALYSIS (CONFIDENTIAL — DO NOT SHARE WITH CLIENT)

> ⚠️ **THIS SECTION IS FOR INTERNAL USE ONLY.** It contains actual costs, margins, and AI tooling expenses. Remove this section before sharing with the client.

## Investment Breakdown (Selling Rates)

Shows how the client investment was calculated from selling rates × dedication × sprints.
Use the selling rates from the rate card.

| Role | Count | Dedication | Hours/Sprint | Sprints | Selling Rate/hr | Subtotal |
|---|---|---|---|---|---|---|
| (Dev profile per archetype) | 1 | (from rate card) | (dedication × 80h) | X | (from rate card) | R$ ... |
| Arquiteto de Software | 1 | (from rate card) | (dedication × 80h) | X | (from rate card) | R$ ... |
| Product Owner | 1 | (from rate card) | (dedication × 80h) | X | (from rate card) | R$ ... |

- **Base Investment**: R$ ...
- **Complexity Multiplier** (Nx): R$ ...
- **Total Client Investment**: R$ ...
- **Monthly Client Investment**: R$ .../month

## Internal Cost Analysis

Actual internal costs for margin tracking. These rates are CONFIDENTIAL.

| Profile | Count | Dedication | Hours/Sprint | Sprints | Internal Cost/hr | Subtotal |
|---|---|---|---|---|---|---|
| (Dev profile per archetype) | 1 | (from rate card) | (dedication × 80h) | X | (actual internal rate) | R$ ... |
| Arquiteto de Software | 1 | (from rate card) | (dedication × 80h) | X | (actual internal rate) | R$ ... |
| Product Owner | 1 | (from rate card) | (dedication × 80h) | X | (actual internal rate) | R$ ... |

| Item | Calculation | Value |
|---|---|---|
| **Internal Team Cost** | sum of subtotals | R$ ... |
| **Complexity Multiplier** (Nx) | team cost × N | R$ ... |
| **AI Tooling Cost** | (from rate card, pro-rata by dedication) × Z months | R$ ... |
| **Total Internal Cost** | | **R$ ...** |
| **Monthly Internal Cost** | ÷ Z months | **R$ .../month** |

## AI Acceleration Impact
| Metric | Traditional | AI-Accelerated | Savings |
|---|---|---|---|
| Sprints | X | Y | Z fewer sprints |
| Duration | X weeks | Y weeks | Z weeks saved |
| Team hours | X hrs | Y hrs | Z hrs saved |
| Time-to-market | X months | Y months | Z months faster |

## Margin Analysis
| Metric | Value |
|---|---|
| Client Investment (selling rates) | R$ ... |
| Total Internal Cost | R$ ... |
| **Gross Margin** | **R$ ... (XX%)** |

> **Gross Margin** = Client Investment − Total Internal Cost.

## Detailed Sprint Plan (Internal)
For each sprint:
- Sprint goal
- Tasks assigned (from tasks.md) with task IDs and `@role` tags (if present)
- Team role allocation (Dev, Architect, PO — who works on what). Use generic role names, NOT individual team member names.
- AI agent capacity: if `team` config has members with `isAgent: true`, note which roles they cover and how many tasks are AI-assignable per sprint
- Parallel work streams
- Sprint deliverables
- Dependencies on previous sprints
```

12. **Stop and report**: Command ends after generating the estimate. Report:
   - Path to generated `estimate.md`
   - Summary: feature count, complexity, base team (3 people), client investment
   - **Remind**: Part 2 (internal cost) must be removed before sharing with client
   - Next steps: `/specforge.tasks` to generate implementation tasks or `/specforge.implement` to begin

## Key Rules

- Use absolute paths when referencing files
- Always use the base team of 3 people (Dev 100%, Architect 30%, PO 50%) — team details go in Part 2 only
- **Can run from any branch** — but for the most complete estimate, run from `main` after merging feature branches
- **`tasks.md` is required** for accurate estimates — if missing, warn the user and recommend running `/specforge.tasks` first
- Use task counts, phases, and [P] markers from `tasks.md` to build the sprint roadmap
- The sprint roadmap must map every task to a specific sprint — no task should be unassigned
- If rate card values are provided in `$ARGUMENTS` or `.specforge.yaml`, use those instead of defaults
- Reference architectural decisions for infrastructure complexity assessment (caching, queues, streams add effort)
- Currency defaults to BRL; if `$ARGUMENTS` mentions USD, present both currencies
- Round all monetary values to 2 decimal places
- The client-facing section should be actionable — a sales team member should be able to present it directly to a client
- When features have `contracts/` with many endpoints, factor endpoint count into complexity
- Consider architectural decisions (caching, queues, real-time features) as complexity multipliers
- **AI acceleration is assumed for ALL projects** — always apply the 0.3 multiplier (70% reduction) to traditional sprint estimates
- **NEVER expose internal costs or AI tooling costs to the client** — the client sees only the total investment calculated from selling rates
- **Selling rates already include margin** — do NOT add additional markup. The selling rate × hours × dedication = client price directly
- **AI tooling cost** is for internal margin analysis only — apply pro-rata by dedication (Dev 100%, Arch 30%, PO 50%)
- **Architect at 30% dedication** — the architect works across multiple projects; their hours per sprint are 24h (30% of 80h)
- The estimate document must have a clear separation between Part 1 (client) and Part 2 (internal)
- **Remind the user** to remove Part 2 before sharing with the client
