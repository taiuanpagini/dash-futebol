---
description: Execute the implementation planning workflow to generate design artifacts from the feature specification.
model: claude-opus-4-8
handoffs:
  - label: Create Tasks
    agent: specforge.tasks
    prompt: Break the plan into tasks
  - label: Create Checklist
    agent: specforge.checklist
    prompt: Create a checklist for the following domain...
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Project Structure

This project uses **SpecForge** for Spec-Driven Development. Key paths:

- **Config**: `.specforge.yaml` (project root) — contains `stack`, `projectName`, `specsDir`, `decisions`
- **Specs directory**: Configured in `.specforge.yaml` under `specsDir` (default: `specs/`)
- **Feature directories**: `<specsDir>/NNN-feature-name/` (e.g., `specs/001-user-auth/`)
- **Templates**: `.specforge/templates/` (stack-specific) and `.specforge/shared/` (common)
- **Constitution**: `constitution.md` (project root)
- **Architectural Decisions**: `architectural-decisions.md` (project root)

## Output Rules

> **IMPORTANT**: Template files under `<specsDir>/templates/` and `<specsDir>/shared/` are **READ-ONLY references**. NEVER modify, overwrite, or write to any file inside the `templates/` or `shared/` directories. Always create NEW files at the designated output paths in the feature directory.

| Artifact | Output Path | Notes |
|---|---|---|
| Implementation plan | `<feature-dir>/plan.md` | **New file** — the main plan document |
| Research findings | `<feature-dir>/research.md` | New file |
| Data model | `<feature-dir>/data-model.md` | New file |
| API contracts | `<feature-dir>/contracts/*.yaml` | New files |
| Quickstart guide | `<feature-dir>/quickstart.md` | New file |

## Branch-Per-Feature Workflow

This command expects to run on a **feature branch** created by `/specforge.specify`. The feature branch name matches the feature directory (e.g., branch `001-user-auth` → directory `specs/001-user-auth/`).

### Branch Guard (MANDATORY — run BEFORE any other step)

```bash
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
```

- If `$CURRENT_BRANCH` matches pattern `NNN-feature-name` (e.g., `001-user-auth`): **PROCEED** — use the branch name to locate the matching feature directory `<specsDir>/<branch-name>/`.
- If `$CURRENT_BRANCH` is `main`, `master`, or `develop`: **STOP** — do NOT proceed. Tell the user:
  > "You are on the `$CURRENT_BRANCH` branch. This command must run on a feature branch. Run `/specforge.specify` to create a new feature branch, or checkout an existing one: `git checkout <NNN>-<feature-name>`"
- If `$CURRENT_BRANCH` doesn't match any expected pattern: **STOP** — ask the user which feature branch to use.

## Memory Integration (optional — skip if MemPalace MCP is not available)

If `mempalace_search` tool is available (check by calling `mempalace_status` — if it errors, skip all memory steps):

### Memory Recall (before planning)

Search memory for relevant past context to inform the plan:

1. `mempalace_search` with the feature name + "architecture design patterns" as query, filtered to `wing_<projectName>`
2. `mempalace_search` with key technical topics from the spec (e.g., "authentication", "database schema", "API design") — look for past plans that addressed similar concerns
3. If results are found, note relevant patterns, decisions, and lessons learned as additional context for the plan. Mention in `research.md` if a past feature addressed a similar challenge.

Do NOT block on empty results — proceed normally if memory returns nothing.

## Outline

1. **Setup**: Read `.specforge.yaml` from the project root. Extract `projectName`, `stack`, `specsDir`, and `decisions`. If missing, instruct user to run `specforge init` first.

2. **Locate feature**: Use the current branch name to find `<specsDir>/<branch-name>/`. If the directory doesn't exist, ask the user which feature to plan. If `$ARGUMENTS` contains a feature name/number, use that.

3. **Load context**:
   - Read `<feature-dir>/spec.md` (REQUIRED — abort if missing, instruct user to run `/specforge.specify`)
   - Read `constitution.md` from project root for guiding principles
   - Read `architectural-decisions.md` for infrastructure choices
   - Read `.specforge/templates/plan-template.md` (or shared fallback) as the plan template

4. **Execute plan workflow**: Using the template structure as a guide, generate the plan and write it to `<feature-dir>/plan.md` (NOT to the template file):
   - Fill Summary from `spec.md` → Business Proposition section (business-oriented, technology-agnostic — do NOT add implementation details to the summary)
   - Fill Technical Context from `$ARGUMENTS` (user provides tech stack choices)
   - Fill Constitution Check section from constitution
   - Evaluate gates (ERROR if constitution violations are unjustified)
   - **Phase 0**: Generate `<feature-dir>/research.md` (resolve all NEEDS CLARIFICATION items)
   - **Phase 1**: Generate `<feature-dir>/data-model.md`, `<feature-dir>/contracts/`, `<feature-dir>/quickstart.md`
   - Re-evaluate Constitution Check post-design

### Phase 0: Outline & Research

1. **Extract unknowns from Technical Context**:
   - For each NEEDS CLARIFICATION item -> research task
   - For each dependency -> best practices task
   - For each integration -> patterns task

2. **Consolidate findings** in `<feature-dir>/research.md`:
   - Decision: what was chosen
   - Rationale: why chosen
   - Alternatives considered: what else evaluated

**Output**: `research.md` with all unknowns resolved

### Phase 1: Design & Contracts

**Prerequisites**: `research.md` complete

1. **Extract entities from feature spec** -> `<feature-dir>/data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate interface contracts** from functional requirements:
   - For each user action -> endpoint/interface
   - Use patterns appropriate for the project stack (from `.specforge.yaml`)
   - Output to `<feature-dir>/contracts/`

3. **Generate quickstart** -> `<feature-dir>/quickstart.md`:
   - Integration scenarios
   - Example usage patterns
   - Testing entry points

**Output**: `<feature-dir>/data-model.md`, `<feature-dir>/contracts/*`, `<feature-dir>/quickstart.md`

5. **Write the completed plan** to `<feature-dir>/plan.md`. This is a NEW file in the feature directory — NOT the template.

6. **Commit plan artifacts to the feature branch**:

   ```bash
   git add <feature-dir>/
   git commit -m "feat(<short-name>): add implementation plan and design artifacts"
   ```

7. **Stop and report**: Command ends after planning. Report:
   - **Current branch name**
   - Feature directory path
   - Plan file path
   - All generated design artifacts
   - Readiness for next phase (`/specforge.tasks`)
   - Remind user: continue working on this feature branch for all subsequent commands

## Memory Save — Design Decisions (after committing, if MemPalace is available)

After the plan is committed, save design decisions to memory:

1. Call `mempalace_add_drawer` with:
   - `wing`: `wing_<projectName>`
   - `room`: `<feature-short-name>`
   - `content`: A summary of key technical decisions from the plan: chosen patterns, data model highlights, technology choices, and rationale for non-obvious decisions.
   - `source_file`: `specforge.plan`
2. If research.md resolved significant unknowns, save the most important findings (chosen approach + rationale) as separate drawers.

Skip gracefully if MemPalace tools are not available.

## Key Rules

- Use absolute paths
- ERROR on gate failures or unresolved clarifications
- Reference the project stack from `.specforge.yaml` for technology-specific guidance
- Reference architectural decisions for infrastructure choices (caching, queues, etc.)
- All design artifacts go into the feature directory
- **Must run on the feature branch** created by `/specforge.specify` — STOP if on main/master
- Commit all plan artifacts to the feature branch before handing off
