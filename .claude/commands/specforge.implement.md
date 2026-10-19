---
description: Execute the implementation plan by processing and executing all tasks defined in tasks.md.
model: claude-sonnet-5
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
- **Feature directories**: `<specsDir>/NNN-feature-name/`
- **Constitution**: `constitution.md` (project root)
- **Architectural Decisions**: `architectural-decisions.md` (project root)

## Output Rules

> **IMPORTANT**: Template files under `<specsDir>/templates/` and `<specsDir>/shared/` are **READ-ONLY references**. NEVER modify, overwrite, or write to any file inside the `templates/` or `shared/` directories. Implementation code goes into the project source directories. Only `<feature-dir>/tasks.md` is modified (to mark tasks as completed).

| Artifact | Output Path | Notes |
|---|---|---|
| Source code | Project source directories (e.g., `src/`) | New files per task |
| Updated task status | `<feature-dir>/tasks.md` | Mark completed tasks `[X]` |
| ADO work item updates | Azure DevOps (via MCP) | Set state to "Done" when task completes (if ADO is configured) |

## Branch-Per-Feature Workflow

This command expects to run on a **feature branch** created by `/specforge.specify`. The feature branch name matches the feature directory (e.g., branch `001-user-auth` → directory `specs/001-user-auth/`). All implementation work happens on this branch, and a pull request is created when implementation is complete.

### Branch Guard (MANDATORY — run BEFORE any other step)

```bash
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
```

- If `$CURRENT_BRANCH` matches pattern `NNN-feature-name` (e.g., `001-user-auth`): **PROCEED** — use the branch name to locate the matching feature directory `<specsDir>/<branch-name>/`.
- If `$CURRENT_BRANCH` is `main`, `master`, or `develop`: **ERROR — STOP IMMEDIATELY.** Implementation MUST happen on a feature branch. Tell the user:
  > "You are on the `$CURRENT_BRANCH` branch. Implementation MUST run on a feature branch. Run `/specforge.specify` to create a new feature branch, or checkout an existing one: `git checkout <NNN>-<feature-name>`"
- If `$CURRENT_BRANCH` doesn't match any expected pattern: **STOP** — ask the user which feature branch to use.

## Memory Integration (optional — skip if MemPalace MCP is not available)

If `mempalace_search` tool is available (check by calling `mempalace_status` — if it errors, skip all memory steps):

### Memory Recall (before implementing)

Search memory for relevant implementation patterns:

1. `mempalace_search` with the feature name + stack name as query, filtered to `wing_<projectName>` — look for implementation patterns, utilities, and workarounds from past features
2. If results reference reusable code patterns, utilities, or past approaches, consider them when implementing tasks

### Memory Save (after implementation is complete)

After all tasks are implemented and committed, save implementation learnings:

1. Call `mempalace_add_drawer` with:
   - `wing`: `wing_<projectName>`
   - `room`: `<feature-short-name>`
   - `content`: A brief summary of implementation highlights: new utilities created, patterns applied, non-obvious workarounds, and any deviation from the plan with rationale.
   - `source_file`: `specforge.implement`

Skip gracefully if MemPalace tools are not available.

## Outline

1. **Setup**: Read `.specforge.yaml` from the project root. All paths must be absolute. Extract `team` (if present) to determine which roles this AI agent holds.

2. **Locate feature directory**: Use the current branch name to find `<specsDir>/<branch-name>/`.

3. **Check checklists status** (if `<feature-dir>/checklists/` exists):
   - Scan all checklist files in the checklists/ directory
   - For each checklist, count total, completed, and incomplete items
   - Create a status table:

     | Checklist | Total | Completed | Incomplete | Status |
     |-----------|-------|-----------|------------|--------|
     | ux.md     | 12    | 12        | 0          | PASS   |
     | test.md   | 8     | 5         | 3          | FAIL   |

   - **If any checklist is incomplete**: STOP and ask user if they want to proceed anyway
   - **If all complete**: Automatically proceed

4. **Load and analyze implementation context**:
   - **REQUIRED**: Read `tasks.md` for the complete task list
   - **REQUIRED**: Read `plan.md` for tech stack, architecture, and file structure
   - **IF EXISTS**: Read `data-model.md` for entities and relationships
   - **IF EXISTS**: Read `contracts/` for API specifications
   - **IF EXISTS**: Read `research.md` for technical decisions
   - **IF EXISTS**: Read `quickstart.md` for integration scenarios

5. **Project Setup Verification**:
   - Create/verify ignore files based on project setup:
     - `.gitignore` — if in a git repo
     - `.dockerignore` — if Dockerfiles exist or Docker in `plan.md`
     - `.eslintignore` / `.prettierignore` — if those tools are configured
   - Use patterns appropriate for the stack in `.specforge.yaml`:
     - **Node.js/TypeScript** (nestjs stacks): `node_modules/`, `dist/`, `build/`, `*.log`, `.env*`
     - **Python** (fastapi stacks): `__pycache__/`, `*.pyc`, `.venv/`, `dist/`, `*.egg-info/`
     - **Universal**: `.DS_Store`, `Thumbs.db`, `*.tmp`, `*.swp`, `.vscode/`, `.idea/`

6. **Parse tasks.md structure** and extract:
   - Task phases: Setup, Foundational, User Stories, Polish
   - Task dependencies: Sequential vs parallel execution rules
   - Task details: ID, `@role` tag (if present), description, file paths, parallel markers [P]
   - Execution flow: Order and dependency requirements

7. **Filter tasks by AI agent role** (when `team` is present):

   If `.specforge.yaml` has a `team` section, find the member(s) with `isAgent: true` and check their `roles` array. When executing tasks:

   - **Tasks with `@role` matching an AI agent role**: Execute these tasks — they are assigned to this AI agent.
   - **Tasks with `@role` NOT matching any AI agent role**: **Skip** these tasks. Output a message: "⏭ Skipping T0XX (@role) — assigned to a human team member". Continue to the next task.
   - **Tasks without `@role` tag**: Execute normally (backward compatible).
   - **No `team` config**: Execute all tasks (backward compatible).

   This ensures the AI agent only implements tasks within its assigned responsibilities, leaving human-assigned tasks untouched.

8. **Execute implementation** following the task plan:
   - **Phase-by-phase execution**: Complete each phase before moving to the next
   - **Respect dependencies**: Run sequential tasks in order, parallel tasks [P] can run together
   - **Follow TDD approach**: Execute test tasks before their corresponding implementation tasks (if test tasks exist)
   - **File-based coordination**: Tasks affecting the same files must run sequentially
   - **Validation checkpoints**: Verify each phase completion before proceeding

9. **Implementation execution rules**:
   - **Setup first**: Initialize project structure, dependencies, configuration
   - **Tests before code** (if test tasks present): Write tests for contracts, entities
   - **Core development**: Implement models, services, endpoints
   - **Integration work**: Database connections, middleware, logging, external services
   - **Polish and validation**: Optimization, documentation

10. **Progress tracking and error handling**:
    - Report progress after each completed task
    - Halt execution if any non-parallel task fails
    - For parallel tasks [P], continue with successful tasks, report failed ones
    - **IMPORTANT**: For completed tasks, mark the task off as `[X]` in tasks.md
    - For skipped tasks (human-assigned roles), leave as `[ ]` — do NOT mark them
    - **ADO sync** (if `azureDevOps` is configured in `.specforge.yaml` and the Azure DevOps MCP is available):
      - After marking a task `[X]`, search for the corresponding ADO work item by querying for Task work items whose title contains `[T0XX]` (the task ID) in the configured ADO project
      - Update the work item state to **"Done"** (or "Closed" depending on the ADO process template)
      - If no matching work item is found (task was never synced to ADO), skip silently
      - If the MCP is not available or the update fails, log a warning and continue — do NOT halt implementation
      - For skipped tasks (human-assigned), do NOT update their ADO state

11. **Commit implementation work**: Commit regularly as you complete phases:

    ```bash
    git add -A
    git commit -m "feat(<short-name>): implement <phase description>"
    ```

    - Commit after each phase completion (Setup, Foundational, each User Story, Polish)
    - Use descriptive commit messages referencing the task IDs completed
    - Push the branch to remote periodically: `git push origin <branch-name>`

12. **Create pull request**: After all AI-assignable tasks are completed, push the branch and create a PR:

    ```bash
    git push origin <branch-name>
    ```

    - Create a PR from `<branch-name>` into the base branch (usually `main`)
    - The PR title should reference the feature: `feat(<short-name>): <feature description>`
    - The PR body should include a summary of implemented tasks, link to the spec, and any relevant notes
    - If some tasks were skipped (human-assigned), list them in the PR body so the team knows what remains

13. **Completion validation**:
    - Verify all AI-assignable tasks are completed
    - Check that implemented features match the original specification
    - Validate that tests pass and coverage meets requirements
    - Confirm the implementation follows the technical plan
    - Report final status with summary of completed work, skipped tasks (if any), **branch name**, and **PR link**
    - If ADO sync was active: report how many work items were updated to "Done" and any that failed to sync

## Key Rules

- Use absolute paths when referencing files
- If tasks are incomplete or missing, suggest running `/specforge.tasks` first
- Reference the project stack from `.specforge.yaml` for technology-specific patterns
- Mark each completed task with `[X]` in tasks.md as you go
- **Must run on the feature branch** created by `/specforge.specify` — ERROR and STOP if on main/master
- Commit after each phase and push regularly to the remote
- Create a pull request when implementation is complete — the PR merges the feature branch into main
- **ADO sync is best-effort**: If `azureDevOps` is configured, update work items as tasks complete by searching ADO for matching task IDs. If the MCP is unavailable or an update fails, continue implementation — never block code work for a tracking update
