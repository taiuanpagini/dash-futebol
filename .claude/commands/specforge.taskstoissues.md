---
description: Convert existing tasks into actionable, dependency-ordered GitHub issues for the feature based on available design artifacts.
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

## Output Rules

> **IMPORTANT**: This command reads `<feature-dir>/tasks.md` and creates GitHub issues. It does NOT modify any local files. NEVER write to files inside `<specsDir>/templates/` or `<specsDir>/shared/`.

| Artifact | Output Path | Notes |
|---|---|---|
| GitHub issues | GitHub repository (remote) | One issue per task |

## Branch-Per-Feature Workflow

This command expects to run on a **feature branch** created by `/specforge.specify`. The feature branch name matches the feature directory (e.g., branch `001-user-auth` → directory `specs/001-user-auth/`). Issues created will reference the feature branch for implementation context.

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

1. **Setup**: Read `.specforge.yaml` from the project root. Extract `team` (if present) to resolve role-based assignments.

2. **Locate feature and load tasks**: Use the current branch name to find the feature directory. Read `<feature-dir>/tasks.md` (REQUIRED — abort if missing, instruct user to run `/specforge.tasks`).

3. **Get the Git remote** by running:

   ```bash
   git config --get remote.origin.url
   ```

   **ONLY PROCEED TO NEXT STEPS IF THE REMOTE IS A GITHUB URL.**

4. **Parse tasks.md**: Extract all tasks with their:
   - Task ID (T001, T002, etc.)
   - Role tag (@developer, @tester, @architect, etc.) if present
   - Description
   - Phase grouping
   - Parallel markers [P]
   - User Story labels [US1], [US2], etc.
   - File paths referenced
   - Dependencies (inferred from ordering and phase)

5. **Create GitHub issues**: For each task in the list, create a new GitHub issue in the repository matching the Git remote:
   - **Title**: `[TaskID] Title` (e.g., `[T001] Establish project foundation and developer tooling`)
   - **Body**: Include:
     - Task description
     - Phase information
     - Related user story (if any)
     - File paths to create/modify
     - Dependencies (link to prerequisite issue numbers)
     - Parallel execution note (if [P] marker present)
   - **Labels**: Add labels based on phase:
     - `setup` for Phase 1 tasks
     - `foundation` for Phase 2 tasks
     - `feature` + `US-N` for user story tasks
     - `polish` for final phase tasks
   - **Milestone**: Create or use existing milestone for the feature name

6. **Role-based assignment** (when `team` is present in `.specforge.yaml`):

   Tasks may contain `@role` tags. When creating GitHub issues:

   - **Resolve `@role` to a team member**: Find the member in the `team` array whose `roles` contains the matching role. Use their `name` or `email` to derive the GitHub username and set as the issue assignee.
   - **AI agent members** (`isAgent: true`): Also add the label `ai-agent` to the issue for visibility and filtering.
   - **Multiple members with the same role**: Distribute issues round-robin among them.
   - **No matching member**: Leave unassigned, add note in issue body.
   - **No `@role` tag or no `team` config**: Leave unassigned (backward compatible).

7. **Create dependency links**: After all issues are created:
   - Add "Depends on #N" references in issue bodies for sequential tasks
   - Add "Can run in parallel with #N" for [P] tasks in the same phase

8. **Report**: Output summary with:
   - **Current branch name**
   - Total issues created
   - Issues per phase
   - Issues assigned per team member (with count)
   - Milestone link
   - Any tasks that couldn't be converted (with reasons)
   - Remind user: issues reference the feature branch for implementation context

## Key Rules

- **UNDER NO CIRCUMSTANCES EVER CREATE ISSUES IN REPOSITORIES THAT DO NOT MATCH THE REMOTE URL**
- Use absolute paths when referencing files
- Preserve task ordering and dependency information
- Each task becomes exactly one issue
- Link issues to their dependencies
- **Must run on the feature branch** created by `/specforge.specify` — STOP if on main/master
- Include the feature branch name in each issue body so developers know which branch to work on

---

For **Azure DevOps** (Sprints, PBIs, Tasks, Test Cases), use `/specforge.taskstoazure` instead. It requires the [Azure DevOps MCP](https://github.com/microsoft/azure-devops-mcp) to be configured in your client; run `specforge setup-ai cursor` (or `all`) to add it to `.cursor/mcp.json`, and set `azureDevOps.org` and `azureDevOps.project` in `.specforge.yaml`.
