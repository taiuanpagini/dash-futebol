---
description: Coordinator (autopilot-style)—assess tasks.md, handoff, and checklists; output ONE next action and dispatch prompt for Implement/Review/Test; respect iteration limits and human gates on the SDD spine.
model: claude-opus-4-8
---

## User Input

```text
$ARGUMENTS
```

Optional: feature dir (e.g. `001-user-auth`), mode hints: `implement` (default for loops), `sdd-propose` (only suggest next SDD step with human gate), `max-rounds N`.

## Boundaries (read first)

1. `constitution.md`, `architectural-decisions.md`, best practices (root or `.specforge/templates/best-practices.md`).
2. Active feature: `specs/<feature>/tasks.md`, `handoff.md`, checklists, recent analyze summary if available.
3. If using MCP: `get_feature_progress` / `list_features` for status.

## Truth sources

- **`tasks.md`** — `[ ]` vs `[x]`
- **`handoff.md`** — blockers (P0/P1)
- Checklists / **`/specforge.analyze`** — quality gates
- Optional: CI or test script result if documented in handoff

## Loop (one cycle per invocation unless user asks to repeat)

1. **Assess** done vs remaining against a clear **done definition** (e.g. all tasks checked, tests passing if required, no open P0 in handoff).
2. If **done** → summarize and stop.
3. If **blocked** → surface blocker; suggest human action; optionally append to `handoff.md`.
4. Else choose **exactly one** next step:
   - Dispatch **Implement** (concrete tasks from `tasks.md`)
   - Dispatch **Review** (files/diff scope)
   - Dispatch **Test** (scenarios slice)
   - **SDD spine:** only **propose** next slash (`/specforge.plan`, etc.) and **require human confirmation** unless user passed explicit auto-advance (document risk).

## Output format

- **Next role** (Implement / Review / Test / Human / SDD-proposal)
- **Dispatch prompt** (copy-paste sub-prompt for that agent or session)
- **Success criteria** for this micro-step
- **Remaining budget** — default **stop after 5** coordinator cycles per session unless user overrides; cap flaky test retries (e.g. 2).

## Writes

- Coordinator may **append** `handoff.md` (Coordinator section). Do **not** silently edit `spec.md` / `plan.md` / `tasks.md`.

## Parallelism

Do not schedule two writers on the same file without explicit scope split (see `docs/specforge-ai-orchestration.md`).
