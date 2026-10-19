---
description: Walk through an existing repository and generate required documentation — either following the SpecForge standard artifact layout or a plain documentation structure at a user-chosen location.
model: claude-opus-4-8
handoffs:
  - label: Discover Architecture
    agent: specforge.discover
    prompt: Discover architecture, agents, and ADRs from the existing source code.
  - label: Establish Constitution
    agent: specforge.constitution
    prompt: Create or update the project constitution based on the generated documentation.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Project Structure

This project uses **SpecForge** for Spec-Driven Development. Key paths:

- **Config**: `.specforge.yaml` (project root)
- **Constitution**: `constitution.md` (project root)
- **Architectural Decisions**: `architectural-decisions.md` (project root)
- **Specs directory**: Configured in `.specforge.yaml` under `specsDir` (default: `specs/`)
- **Templates**: `.specforge/templates/` and `.specforge/shared/` (READ-ONLY — use as output schemas)
- **ADRs**: `docs/adr/` (if present from `/specforge.discover`)

## Output Rules

> **IMPORTANT**: Template files under `.specforge/templates/` and `.specforge/shared/` are **READ-ONLY references**. NEVER modify, overwrite, or write to any file inside those directories. Use them as schemas for generated output.

### SpecForge Standard Layout (when user chooses standard mode)

| Artifact | Output Path | Schema Reference |
|---|---|---|
| Constitution | `constitution.md` | `.specforge/templates/constitution-template.md` |
| Architectural decisions | `architectural-decisions.md` | Existing file + `.specforge/shared/architectural-decisions-guide.md` |
| Best practices | `best-practices.md` or stack template | `.specforge/templates/best-practices.md` |
| As-built feature spec | `specs/000-as-built/spec.md` | `.specforge/shared/spec-template.md` |
| As-built plan | `specs/000-as-built/plan.md` | `.specforge/templates/plan-template.md` |
| As-built tasks | `specs/000-as-built/tasks.md` | `.specforge/shared/tasks-template.md` |
| As-built data model | `specs/000-as-built/data-model.md` | `.specforge/templates/data-model-template.md` |
| As-built quickstart | `specs/000-as-built/quickstart.md` | `.specforge/templates/quickstart-template.md` |
| Module/domain docs | `docs/<module>/README.md` | Conventional markdown |

### Plain Documentation Layout (when user chooses non-standard mode)

| Artifact | Output Path | Notes |
|---|---|---|
| Overview | `<outputDir>/README.md` | Project overview |
| Architecture | `<outputDir>/architecture.md` | System architecture |
| Module docs | `<outputDir>/<module>.md` | Per-module documentation |
| API reference | `<outputDir>/api.md` | If applicable |
| Setup guide | `<outputDir>/setup.md` | Development setup |

## Branch-Per-Feature Workflow

Unlike feature commands, `/specforge.reverse-doc` operates at the **project level** and should typically run on the `main` (or default) branch.

### Branch Guard (MANDATORY — run BEFORE any other step)

```bash
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
```

- If `$CURRENT_BRANCH` is `main` or `master`: **PROCEED**.
- If `$CURRENT_BRANCH` matches pattern `NNN-feature-name`: **STOP** — tell the user to switch to `main`.
- If on another branch: **WARN** and allow proceed if user confirms.

## Outline

You are performing **reverse documentation** on an existing codebase — walking through the repository and generating documentation that describes what exists today (as-built baseline), not what should be built.

Follow this execution flow:

1. **Ask the user up front** (MANDATORY — do NOT proceed without answers):

   **Question A — Output location:**
   > "Where should I generate the documentation? Default: `docs/` at project root. You can specify another path (e.g., `documentation/`, `wiki/`)."

   **Question B — Documentation standard:**
   > "Should I follow the **SpecForge standard layout** (constitution, architectural-decisions, specs/000-as-built/, module docs under docs/) or generate **plain documentation** at your chosen location?"

   If user input (`$ARGUMENTS`) already specifies these choices, confirm them instead of re-asking.

2. **Load project context**:
   - Read `.specforge.yaml`, existing `constitution.md`, `architectural-decisions.md`, `docs/adr/` if present.
   - Read `.specforge/templates/` and `.specforge/shared/` templates as output schemas (READ-ONLY).
   - Scan README, existing docs, and source structure.

3. **Walk the repository module-by-module** (read-only scan):
   - Identify top-level modules, services, packages, or bounded contexts.
   - For each module, note: purpose, public API, dependencies, data stores, external integrations.
   - Track infrastructure: Docker, CI, env vars, deployment.
   - Note test coverage and patterns.

4. **Generate documentation** based on user's choice:

   ### If SpecForge Standard:
   - Create or update `constitution.md` from as-built principles inferred from code (mark inferred sections with `<!-- as-built: inferred -->`).
   - Create or update `architectural-decisions.md` reconciling with existing decisions and ADRs.
   - Create `specs/000-as-built/` with:
     - `spec.md` — as-built feature specification describing the entire system
     - `plan.md` — as-built technical plan (layers, modules, data flow)
     - `tasks.md` — checklist of documentation gaps and recommended follow-up work (not implementation tasks)
     - `data-model.md` — entities and relationships found in code
     - `quickstart.md` — how to run/develop based on actual setup
   - Create `docs/<module>/README.md` for each major module.
   - Use `.specforge/shared/spec-template.md` and stack templates as structural guides.

   ### If Plain Documentation:
   - Generate files at `<outputDir>/` per the plain layout table above.
   - Use clear markdown with tables, diagrams (mermaid where helpful), and code references.
   - Do not create SpecForge-specific artifacts unless the user asks.

5. **Coverage report** (output to user):
   - Modules documented vs. skipped
   - Files created vs. updated vs. skipped (with reasons)
   - Gaps: undocumented modules, missing tests, unclear ownership
   - Recommended next steps (`/specforge.discover`, `/specforge.constitution`, `/specforge.specify` for new features)

6. **Commit artifacts** (if user confirms):

   ```bash
   git add constitution.md architectural-decisions.md specs/000-as-built/ docs/
   git commit -m "docs: reverse-document repository (as-built baseline)"
   ```

## Key Rules

- Use absolute paths when referencing files
- **Ask before writing** — confirm output location and standard mode
- Generated docs describe **what exists today** (as-built), not aspirational design
- Mark inferred content clearly — do not present guesses as facts
- Never overwrite existing docs without noting changes in the summary
- SpecForge standard output uses `specs/000-as-built/` as a single as-built feature folder — do not create feature branches for this
- Templates under `.specforge/` are READ-ONLY schemas — write to designated output paths only
- **Should run on `main` branch** — reverse documentation is project-level
