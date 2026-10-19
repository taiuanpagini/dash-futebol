---
description: Concept-to-delivery orchestrator—run the feature SDD spine (specify through analyze), then implementation and verification, coordinating SpecForge role agents (and optional Claude Code agent teams). Excludes estimate, taskstoissues, and taskstoazure. High risk; explicit stop conditions and human gates.
model: claude-opus-4-8
---

## User Input

```text
$ARGUMENTS
```

Provide a **natural-language product or feature proposition** (what to build) and optionally:

- **Feature id** if continuing an existing feature (e.g. `001-user-auth`).
- **Modifiers** (plain text): `stop-after-spec`, `stop-after-plan`, `stop-after-tasks`, `stop-after-analyze`, `no-review` (skip Azure DevOps PR review via `/specforge.review`), `use-teams` (prefer [Claude Code agent teams](https://code.claude.com/docs/en/agent-teams) for parallel delivery work when the environment supports it—see team section below).

You **MUST** honor `$ARGUMENTS` when the user supplies it.

## Your role: orchestrator (team lead)

You are the **orchestrator**: you carry the product from **concept** through **delivery-ready** software (implemented code, checked-off `tasks.md`, tests and local review as appropriate). You **coordinate** the work; you do not replace **`spec.md` / `plan.md` / `tasks.md`** as source of truth.

**SpecForge role agents** (after `specforge setup-ai`, under `.claude/agents/` / `.cursor/agents/`):

| Phase | Primary role | Notes |
| ----- | ------------ | ----- |
| **SDD** (specify → analyze) | **specforge-sdd** | One logical **writer** for spec artifacts; run MCP `sdd_specify` … `sdd_analyze` or the equivalent `/specforge.*` work **sequentially** in this session—do not parallelize competing edits to `spec.md` / `plan.md` / `tasks.md`. |
| **Delivery** (implement loop) | **specforge-implement** | Code + `tasks.md` checkboxes. |
| **Local verification** | **specforge-review**, **specforge-test** | Disjoint files (`review-notes.md`, tests) vs implementer’s `src/`. |
| **Meta loop** | **specforge-coordinator** semantics | Use **`/specforge.coordinate`**-style assessments between implement/review/test cycles (iteration ceiling, one next action when delegating). |

**How to orchestrate:**

1. **Single session (default):** You perform each phase yourself, following the same rules as the per-step slash commands and the **specforge-sdd** / **specforge-implement** agents as prompts-in-the-head.
2. **Subagents (when the product supports it):** Delegate with explicit prompts: e.g. spawn **specforge-implement** for a slice of `tasks.md`, then **specforge-review** / **specforge-test** with **non-overlapping paths** (see `docs/specforge-ai-orchestration.md` — **Parallelism**).
3. **Claude Code agent teams (experimental):** If the user passed **`use-teams`** and agent teams are available, act as **team lead**: create or steer a team, spawn teammates using **subagent types** `specforge-implement`, `specforge-review`, `specforge-test` with spawn prompts that cite feature dir, `tasks.md`, and boundaries. Mirror runtime team tasks from **`tasks.md`**; teammates still **update `tasks.md`** when they complete implementer work. Full detail: [orchestration doc](../../docs/specforge-ai-orchestration.md) (section **Claude Code agent teams**).

**Out of scope for this command:** **`/specforge.estimate`**, **`/specforge.taskstoissues`**, **`/specforge.taskstoazure`**—run those separately when you need pricing, GitHub issues, or Azure Boards. Do **not** invoke MCP `sdd_estimate`, `sdd_tasks_to_issues`, or `sdd_tasks_to_azure` as part of autopilot.

## Warning (read first)

End-to-end orchestration increases **token cost**, **spec drift**, and **coordination mistakes**. Prefer stepwise slashes or **`/specforge.coordinate`** when you want tighter control.

**Hard stops — do not proceed without the human when:**

- **`[NEEDS CLARIFICATION]`** remains in `spec.md` after a clarify pass.
- **Constitution**, **architectural decisions**, or **analyze** surfaces **P0** / blocking issues.
- **Git** or **CI** fails in a way that blocks honest delivery, or credentials are missing.
- The user’s modifiers say to stop at a phase boundary.

## Boundaries (before any phase)

1. Read **`constitution.md`**, **`architectural-decisions.md`**, and **best practices** (root or `.specforge/templates/best-practices.md`).
2. Resolve **`.specforge.yaml`** (`specsDir`, stack).
3. If SpecForge **MCP** is available, use **`get_sdd_pipeline`** for reference ordering; call **`sdd_*` only for feature steps through analyze and for implement (and review if used)**—**not** for estimate or tasks-to-issues/Azure.

## Delivery pipeline (this command only)

**Feature branch, in order:**

1. **`/specforge.specify`** — proposition → `spec.md`, `test-scenarios.md`, requirements checklist (branch rules per that command).
2. **`/specforge.clarify`** — resolve clarifications or **stop** for human input.
3. **`/specforge.plan`** — `plan.md`, research / data-model / quickstart per plan command.
4. **`/specforge.tasks`** — `tasks.md`.
5. **`/specforge.checklist`** — validation checklists.
6. **`/specforge.analyze`** — read-only analysis; address or escalate P0 findings.

**Delivery (concept → shippable increment):**

7. **`/specforge.implement`** — until **`tasks.md`** is fully checked **or** blocked. Internally: next unchecked task → implement → mark `[x]` → repeat. When delegating to an implementer agent/teammate, pass **scoped** prompts (paths, acceptance, no edits to `spec.md` / `plan.md`).
8. **Verification** — run **specforge-review** and **specforge-test** work (local review vs spec/plan, tests from `test-scenarios.md`), or delegate with disjoint ownership. Repeat implement ↔ review ↔ test with a **bounded** iteration count (align with **`/specforge.coordinate`**).
9. **Optional:** **`/specforge.review`** (Azure DevOps PR review) only if configured and user did not pass **`no-review`**.

**Optional:** **`/specforge.prime`** once when the feature dir is known, to load boundaries + feature artifacts.

## Execution rules

- **One SDD phase at a time:** finish phase *N* outputs before *N+1*. After each major phase, **brief status** (paths, what’s next).
- **Modifiers:** honor `stop-after-*` and **`no-review`**.
- **Templates:** never write under `<specsDir>/templates/` or `<specsDir>/shared/` (read-only).
- **Single writer for spec pipeline:** only SDD-phase work touches `spec.md` / `plan.md` / `tasks.md` structure; implementers only mark tasks and write application/test code per **`/specforge.implement`**.
- **Branch discipline:** follow stricter rules from specify/implement (e.g. feature branch for implementation).

## When finished

Summarize: branch, feature directory, artifacts touched, what was orchestrated (solo vs subagents vs team), remaining human steps (PR, deploy, sign-off), and optional **`handoff.md`** notes.
