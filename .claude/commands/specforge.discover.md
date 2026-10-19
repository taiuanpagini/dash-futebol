---
description: Discover architecture, agents, and ADRs from existing source code in a brownfield repository. Scans the codebase, asks clarifying questions, and generates project-specific role agents and numbered Architecture Decision Records.
model: claude-opus-4-8
handoffs:
  - label: Establish Constitution
    agent: specforge.constitution
    prompt: Create or update the project constitution based on the discovered architecture and ADRs.
  - label: Reverse-Document Repository
    agent: specforge.reverse-doc
    prompt: Walk through the repository and generate the required documentation following the SpecForge standard.
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
- **ADRs**: `docs/adr/ADR-NNN-<slug>.md` (numbered Architecture Decision Records)
- **Role agents**: `.cursor/agents/`, `.claude/agents/` (project-specific, aligned with SpecForge role patterns)
- **Templates**: `.specforge/templates/` and `.specforge/shared/` (READ-ONLY references)
- **Reference agents**: `.specforge/` does not ship agents — use `templates/agents/` patterns from SpecForge as the baseline when generating project agents

## Output Rules

> **IMPORTANT**: Template files under `.specforge/templates/` and `.specforge/shared/` are **READ-ONLY references**. NEVER modify, overwrite, or write to any file inside those directories. Always write output to the designated output paths below.

| Artifact | Output Path | Notes |
|---|---|---|
| Architecture Decision Records | `docs/adr/ADR-NNN-<slug>.md` | Numbered sequentially (001, 002, …); one decision per file |
| ADR index | `docs/adr/README.md` | Table of all ADRs with status and summary |
| Project role agents | `.cursor/agents/`, `.claude/agents/` | One file per role; align with SpecForge agent patterns |
| Architectural decisions summary | `architectural-decisions.md` | Reconcile discovered decisions with existing file (merge, do not blindly overwrite) |

## Branch-Per-Feature Workflow

Unlike feature commands, `/specforge.discover` operates at the **project level** and should typically run on the `main` (or default) branch — NOT on a feature branch. Discovery governs the whole repository.

### Branch Guard (MANDATORY — run BEFORE any other step)

```bash
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
```

- If `$CURRENT_BRANCH` is `main` or `master`: **PROCEED** — this is the correct branch for discovery.
- If `$CURRENT_BRANCH` matches pattern `NNN-feature-name` (e.g., `001-user-auth`): **STOP** — do NOT proceed. Tell the user:
  > "You are on the `$CURRENT_BRANCH` feature branch. Discovery must run on the `main` branch because it analyzes the whole repository. Run: `git checkout main` first, then re-run `/specforge.discover`."
- If `$CURRENT_BRANCH` is `develop` or another non-main branch: **WARN** — suggest switching to `main` but allow the user to proceed if they confirm.

## Outline

You are performing **brownfield discovery** on an existing codebase. Your job is to (a) scan the repository, (b) ask the user clarifying questions where intent is ambiguous, (c) generate numbered ADRs and project-specific role agents, and (d) reconcile findings with existing documentation.

Follow this execution flow:

1. **Load project context**:
   - Read `.specforge.yaml` for stack, project name, specs directory, and existing decisions.
   - Read `constitution.md`, `architectural-decisions.md`, and `README.md` if they exist.
   - Read `.specforge/shared/architectural-decisions-guide.md` for decision criteria.
   - Note what already exists — you will merge, not blindly overwrite.

2. **Scan the repository** (read-only):
   - **Source code**: module/layer structure, entry points, domain boundaries, key services.
   - **Dependencies**: `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, etc.
   - **Infrastructure**: Docker, docker-compose, CI/CD configs, deployment manifests.
   - **Configuration**: env examples, config files, feature flags.
   - **Existing docs**: any `docs/`, ADRs, wikis, inline architecture notes.
   - **Tests**: test layout, coverage patterns, integration vs unit split.

3. **Ask clarifying questions** (MANDATORY before writing):
   - Present a short summary of what you found (stack, layers, key modules, infra).
   - Ask the user about **ambiguous or undocumented decisions**, such as:
     - Bounded contexts and domain ownership
     - Why specific infrastructure was chosen (cache, queue, DB, auth provider)
     - Intentional trade-offs vs technical debt
     - Team ownership of modules
     - Whether existing docs are authoritative or outdated
   - **Do NOT write ADRs or agents until the user answers** (or explicitly says "proceed with best-effort inference").

4. **Generate Architecture Decision Records**:
   - Create `docs/adr/` if it does not exist.
   - For each significant decision discovered, write `docs/adr/ADR-NNN-<slug>.md` using this structure:

     ```markdown
     # ADR-NNN: <Title>

     **Status**: Proposed | Accepted | Deprecated | Superseded by ADR-XXX
     **Date**: YYYY-MM-DD
     **Context**: What situation led to this decision?
     **Decision**: What was decided?
     **Consequences**: Positive and negative outcomes.
     **Alternatives Considered**: What else was evaluated?
     ```

   - Number sequentially starting at the next available number (scan existing `docs/adr/ADR-*.md`).
   - Create or update `docs/adr/README.md` with a table of all ADRs.
   - Reconcile with `architectural-decisions.md`: add cross-references to ADR files; update decision keys where they align with manifest decisions in `.specforge.yaml`.

5. **Generate project-specific role agents**:
   - Read SpecForge reference patterns from deployed agents (`.cursor/agents/specforge-*.md` or `.claude/agents/specforge-*.md`) if present; otherwise infer from standard SpecForge roles: sdd, implement, review, test, coordinator.
   - Create **project-tailored** agents under `.cursor/agents/` and `.claude/agents/` that:
     - Reference this project's actual paths, stack, and conventions
     - Include discovered bounded contexts and module ownership
     - Preserve SpecForge governance (constitution → AD → best practices)
     - Use YAML frontmatter: `name`, `description`, `model`
   - If an agent file already exists, **merge or update** — note changes in your summary; do not silently overwrite without telling the user.

6. **Produce a Discovery Report** (output to user, not a file unless asked):
   - Modules and layers identified
   - ADRs created vs. skipped (with reasons)
   - Agents created vs. updated
   - Gaps requiring human input
   - Recommended next steps (`/specforge.constitution`, `/specforge.reverse-doc`, `/specforge.specify`)

7. **Commit artifacts** (if user confirms):

   ```bash
   git add docs/adr/ architectural-decisions.md .cursor/agents/ .claude/agents/
   git commit -m "docs: discover architecture — add ADRs and project agents"
   ```

## Key Rules

- Use absolute paths when referencing files
- **Ask before writing** when intent is ambiguous — discovery is collaborative, not silent inference
- Never overwrite existing ADRs or agents without explicit user confirmation
- ADRs document **decisions that were made**, not aspirational choices
- Project agents complement (not replace) SpecForge generic agents deployed via `specforge setup-ai`
- **Should run on `main` branch** — discovery is project-level, not feature-level
- After updating on main, feature branches should merge main to pick up changes
