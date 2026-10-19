---
description: Convert existing tasks, estimate, and test scenarios into Azure DevOps work items (Sprints, PBIs, Tasks, Test Cases) using the Azure DevOps MCP.
model: claude-sonnet-5
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Project Structure

This project uses **SpecForge** for Spec-Driven Development. Key paths:

- **Config**: `.specforge.yaml` (project root) — contains `stack`, `projectName`, `specsDir`, `decisions`, optionally `azureDevOps` (org, project, areaPath, iterationPath), and optionally `team` (team members with roles)
- **Specs directory**: Configured in `.specforge.yaml` under `specsDir` (default: `specs/`)
- **Feature directories**: `<specsDir>/NNN-feature-name/`

## Output Rules

> **IMPORTANT**: This command reads `tasks.md`, `estimate.md`, and `test-scenarios.md` and creates work items in Azure DevOps via the **Azure DevOps MCP**. It does NOT modify any local files. NEVER write to files inside `<specsDir>/templates/` or `<specsDir>/shared/`.

| Artifact | Output | Notes |
|---|---|---|
| Iterations (Sprints) | Azure DevOps project | From `estimate.md` sprint roadmap |
| Product Backlog Items (PBI) | Azure DevOps project | One per feature or user story |
| Tasks | Azure DevOps (child of PBI) | One per task in `tasks.md` |
| Test Cases | Azure DevOps (if MCP supports) | From `test-scenarios.md` |

## Prerequisites

- The **Azure DevOps MCP** must be configured in this client (Cursor, Claude Desktop, etc.). If you run `specforge setup-ai`, it configures `.cursor/mcp.json` for Cursor and provides examples for Claude Desktop. See [Azure DevOps MCP](https://github.com/microsoft/azure-devops-mcp). Use domains `core`, `work`, `work-items` (and `test-plans` for Test Cases).
- `.specforge.yaml` must contain an `azureDevOps` block with `org` and `project` (and optionally `areaPath`, `iterationPath`). Do NOT create work in a different org/project than configured. Authentication is via the MCP (browser login or PAT in env).

## Branch-Per-Feature Workflow

This command can run per feature (current branch) or for the whole project. For a single feature, the current branch name matches the feature directory (e.g., branch `001-user-auth` → directory `specs/001-user-auth/`).

### Branch Guard (when syncing a single feature)

```bash
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
```

- If `$CURRENT_BRANCH` matches pattern `NNN-feature-name`: **PROCEED** — use the branch name to locate `<specsDir>/<branch-name>/`.
- If `$CURRENT_BRANCH` is `main`, `master`, or `develop`: you may sync **all features** under `specs/` (project-wide), or **STOP** and tell the user to checkout a feature branch for single-feature sync.
- If the user specified scope in `$ARGUMENTS`, follow it (e.g. "all features" vs "current feature only").

## Outline

1. **Setup**: Read `.specforge.yaml` from the project root. Obtain `azureDevOps.org`, `azureDevOps.project`, and optionally `azureDevOps.areaPath`, `azureDevOps.iterationPath`. If `azureDevOps` is missing, **STOP** and tell the user to add it and run again. Also read `team` (if present) to resolve role-based assignments.

2. **Locate artifacts**:
   - For **project-wide** sync: read `specs/estimate.md` (project root or under specs), then for each feature directory under `specs/` (e.g. `specs/001-foo/`, `specs/002-bar/`) read `tasks.md` and, if present, `test-scenarios.md`.
   - For **single-feature** sync: use the current branch name to find the feature directory; read that feature's `tasks.md`, and if available `specs/estimate.md` and the feature's `test-scenarios.md`.

3. **Use only the Azure DevOps MCP tools**. Do not call GitHub or other trackers. Typical tool names (refer to the MCP's TOOLSET/docs for the exact names in your client):
   - Create or update **iterations** (sprints) — from the sprint roadmap in `estimate.md` (table "Sprint | Dates | Focus | Key Deliverables" or "Detailed Sprint Plan").
   - Create **work items**: type **Product Backlog Item** (PBI) for each feature or user story; type **Task** for each task from `tasks.md`, linked as child of the corresponding PBI.
   - Create **links**: parent-child between PBI and Tasks; optionally assign work items to iterations (sprints).
   - If the Azure DevOps MCP exposes **Test Case** or test-plan tools (domain `test-plans`), create test cases from `test-scenarios.md` and link them to the PBI or iteration as appropriate.

4. **Order of creation**:
   - (1) Create iterations (sprints) from `estimate.md` so they exist before assigning work.
   - (2) For each feature: create one PBI (title from feature name; description from spec.md → Business Proposition section — business-oriented, no technical details); then create one Task per line in `tasks.md` (T001, T002, …), with description, phase, and [P] / user story labels preserved in the work item body; link each Task to the feature's PBI as child.
   - (3) If Test Cases are supported, create them from `test-scenarios.md` (per user story / scenario) and link to the corresponding PBI or iteration.

5. **Role-based assignment** (when `team` is present in `.specforge.yaml`):

   Tasks in `tasks.md` may contain `@role` tags (e.g., `@developer`, `@tester`, `@architect`). When creating ADO work items:

   - **Resolve `@role` to a team member**: Find the member in `.specforge.yaml` `team` array whose `roles` array contains the matching role. Use their `email` to set `System.AssignedTo` on the work item.
   - **AI agent members** (`isAgent: true`): Set `System.AssignedTo` using the agent's `email` just like any human member. Additionally, add the tag `AI-Agent` to the work item for visibility and filtering.
   - **Multiple members with the same role**: If more than one member has the role, distribute tasks round-robin among them (e.g., T001 → member A, T005 → member B, T012 → member A, …).
   - **No matching member for role**: If a `@role` tag has no matching team member, leave `System.AssignedTo` unset and add a note in the work item description: "⚠ No team member assigned to role: @role".
   - **No `@role` tag on task**: Leave `System.AssignedTo` unset (backward compatible).
   - **No `team` in config**: Skip all assignment logic; proceed as before.

6. **Dependencies**: Where `tasks.md` implies order (e.g. T002 after T001), use the MCP's link types (e.g. Predecessor/Successor) if available; otherwise add a note in the Task description (e.g. "Depends on T001").

7. **Report**: Output a summary with:
   - Org and project used
   - Number of iterations created
   - Number of PBIs and Tasks created (and Test Cases if any)
   - Tasks assigned per team member (with count) — including AI agent assignments
   - Any tasks or scenarios that could not be converted (with reasons)
   - Remind the user that the feature branch name (for single-feature sync) is the implementation context for developers.

## Key Rules

- **UNDER NO CIRCUMSTANCES** create work items in an Azure DevOps org or project other than the one in `.specforge.yaml` under `azureDevOps`.
- Use absolute paths when referencing files in work item descriptions.
- Preserve task ordering and dependency information (T001, T002, … and phase labels).
- Each task in `tasks.md` becomes exactly one Task work item; link them to the feature PBI.
- **Do not modify any local files.**
- Include the feature directory or branch name in PBI/Task descriptions so developers know which feature and branch to work on.
