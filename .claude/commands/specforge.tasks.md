---
description: Generate an actionable, dependency-ordered tasks.md for the feature based on available design artifacts.
model: claude-sonnet-5
handoffs:
  - label: Analyze For Consistency
    agent: specforge.analyze
    prompt: Run a project analysis for consistency
  - label: Implement Project
    agent: specforge.implement
    prompt: Start the implementation in phases
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

> **IMPORTANT**: Template files under `<specsDir>/templates/` and `<specsDir>/shared/` are **READ-ONLY references**. NEVER modify, overwrite, or write to any file inside the `templates/` or `shared/` directories. Always create NEW files at the designated output paths in the feature directory.

| Artifact | Output Path | Notes |
|---|---|---|
| Task breakdown | `<feature-dir>/tasks.md` | **New file** — write here, NOT to the template |

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

## Outline

1. **Setup**: Read `.specforge.yaml` from the project root. Extract `projectName`, `stack`, `specsDir`, and `team` (if present). The `team` array contains members with `name`, `email`, `roles`, and optional `isAgent` flag (AI coding agents).

2. **Locate feature directory**: Use the current branch name to find `<specsDir>/<branch-name>/`. If the branch doesn't match a feature directory, fall back to scanning `<specsDir>/` and asking the user.

3. **Load design documents**: Read from the feature directory:
   - **Required**: `<feature-dir>/plan.md` (tech stack, libraries, structure), `<feature-dir>/spec.md` (user stories with priorities)
   - **Optional**: `<feature-dir>/data-model.md` (entities), `<feature-dir>/contracts/` (interface contracts), `<feature-dir>/research.md` (decisions), `<feature-dir>/quickstart.md` (test scenarios)
   - Note: Not all projects have all documents. Generate tasks based on what's available.

4. **Execute task generation workflow**:
   - Load `plan.md` and extract tech stack, libraries, project structure
   - Load `spec.md` and extract user stories with their priorities (P1, P2, P3, etc.)
   - If `data-model.md` exists: Extract entities and map to user stories
   - If `contracts/` exists: Map interface contracts to user stories
   - If `research.md` exists: Extract decisions for setup tasks
   - Generate tasks organized by user story (see Task Generation Rules below)
   - Generate dependency graph showing user story completion order
   - Create parallel execution examples per user story
   - Validate task completeness

5. **Generate tasks.md**: Use `.specforge/templates/tasks-template.md` (or shared fallback) as structure, fill with:
   - Correct feature name from `plan.md`
   - Phase 1: Setup tasks (project initialization)
   - Phase 2: Foundational tasks (blocking prerequisites for all user stories)
   - Phase 3+: One phase per user story (in priority order from `spec.md`)
   - Each phase includes: story goal, independent test criteria, implementation tasks
   - Final Phase: Polish & cross-cutting concerns
   - Clear file paths for each task
   - Dependencies section showing story completion order

6. **Write the completed tasks** to `<feature-dir>/tasks.md`. This is a NEW file in the feature directory — NOT the template.

7. **Commit tasks to the feature branch**:

   ```bash
   git add <feature-dir>/tasks.md
   git commit -m "feat(<short-name>): add task breakdown"
   ```

8. **Report**: Output path to generated `<feature-dir>/tasks.md` and summary:
   - Total task count
   - Task count per user story
   - Task count per role (if `team` config is present)
   - Parallel opportunities identified
   - Suggested MVP scope (typically User Story 1)
   - If AI agents are in the team: list which roles are AI-assigned and the count of tasks they will handle

## Task Generation Rules

**CRITICAL**: Tasks MUST be organized by user story to enable independent implementation and testing.

### Checklist Format (REQUIRED)

Every task MUST strictly follow this format:

```text
- [ ] [TaskID] [@role?] [P?] [Story?] Business-oriented title describing the outcome
```

**Format Components**:

1. **Checkbox**: ALWAYS start with `- [ ]` (markdown checkbox)
2. **Task ID**: Sequential number (T001, T002, T003...) in execution order
3. **[@role] tag**: Role responsible for the task (see Role Assignment below). **Required** when `team` is defined in `.specforge.yaml`; omit otherwise.
4. **[P] marker**: Include ONLY if task is parallelizable
5. **[Story] label**: REQUIRED for user story phase tasks only — Format: [US1], [US2], etc.
6. **Title**: Business-oriented description of the **outcome or capability** being delivered (NOT the technical artifact). File paths and class names belong in the detail block below, not in the title.

**Title rules**: Task titles MUST describe business value, not implementation mechanics. Think "what does this unlock for the product?" not "what file do I create?". Technical details (file paths, class names, method signatures) go in the **What** bullet of the detail block.

| BAD (too technical) | GOOD (business-oriented) |
|---|---|
| Create User model and migration | Enable persistent storage for user accounts |
| Implement JWT authentication middleware | Secure API endpoints with token-based identity verification |
| Set up Redis caching layer | Accelerate read-heavy queries with response caching |
| Create OrderService business logic | Enforce order placement rules and inventory checks |
| Add health check endpoints | Expose service availability for zero-downtime deployments |
| Create project directory structure | Establish project foundation and developer tooling |

**Examples** (with team config):

- `- [ ] T001 @developer Establish project foundation and developer tooling`
- `- [ ] T005 @devops [P] Guarantee reproducible local development environment`
- `- [ ] T012 @developer [P] [US1] Enable persistent storage for user accounts`
- `- [ ] T017 @tester [P] [US1] Validate user registration end-to-end with real data`

**Examples** (without team config — backward compatible):

- `- [ ] T001 Establish project foundation and developer tooling`
- `- [ ] T005 [P] Secure API endpoints with token-based identity verification`

### Role Assignment

When `.specforge.yaml` contains a `team` section, assign `@role` to **every** task based on the task type:

| Role | Assign to |
|---|---|
| `@developer` | Implementation tasks: models, services, endpoints, infrastructure setup, code cleanup, security |
| `@tester` | Test tasks: unit tests, integration tests, E2E tests, contract tests |
| `@architect` | Architecture review, design validation, infrastructure decisions verification |
| `@po` | Acceptance criteria validation, backlog prioritization |
| `@devops` | CI/CD, Docker, deployment, environment configuration |
| `@designer` | UI/UX design, component styling, accessibility |

Team members with `isAgent: true` are AI coding agents. Tasks assigned to roles held by AI agents will be executed automatically by the AI during `/specforge.implement`. This is transparent — the `@role` tag is the same regardless of whether a human or AI holds the role.

### Phase Structure

- **Phase 1**: Setup (project initialization)
- **Phase 2**: Foundational (blocking prerequisites — MUST complete before user stories)
- **Phase 3+**: User Stories in priority order (P1, P2, P3...)
  - Within each story: Models -> Services -> Endpoints -> Integration
  - Each phase should be a complete, independently testable increment
- **Final Phase**: Polish & Cross-Cutting Concerns

## Key Rules

- Use absolute paths when referencing files
- Each task must be specific enough that an AI agent can complete it without additional context
- Reference the project stack from `.specforge.yaml` for technology-specific task patterns
- The tasks.md should be immediately executable
- **Must run on the feature branch** created by `/specforge.specify` — STOP if on main/master
- Commit tasks to the feature branch before handing off
