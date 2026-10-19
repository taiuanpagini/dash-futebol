---
description: Prime context for the active feature—load constitution, architectural decisions, best practices, optional handoff, and feature spec artifacts in one pass.
model: claude-sonnet-5
---

## User Input

```text
$ARGUMENTS
```

Provide the **feature directory name** (e.g. `001-user-auth`) if not obvious from the current branch. You **MUST** use `$ARGUMENTS` when the user supplies it.

## Project paths

- **Config:** `.specforge.yaml`
- **Specs root:** from `specsDir` (default `specs/`)
- **Feature dir:** `<specsDir>/<NNN-feature-name>/`
- **Constitution:** `constitution.md`
- **AD:** `architectural-decisions.md`
- **Best practices:** `best-practices.md` or `.specforge/templates/best-practices.md`
- **Optional:** `specs/shared/architectural-decisions-guide.md`
- **Handoff (L1):** `<feature-dir>/handoff.md`

## Instructions

1. Resolve the active feature from `$ARGUMENTS` or from `git branch --show-current` (branch name often matches `NNN-feature`).
2. **Read in order:**
   - `constitution.md`
   - `architectural-decisions.md`
   - Best practices (first path that exists)
   - Architectural decisions guide if present
   - `handoff.md` in the feature dir if present
   - `spec.md`, `plan.md`, `tasks.md`, `test-scenarios.md` in the feature dir
3. **Memory recall** (optional — skip if MemPalace MCP is not available):
   - If `mempalace_search` is available, search for the feature name and project name to load relevant past context (decisions, patterns, learnings from prior sessions)
   - Include a "Memory Context" section in the output summarizing any relevant memories found
   - Skip silently if MemPalace tools are not available or return no results
4. Output a **short checklist** confirming each file was loaded or missing (and OK to skip if optional).
5. Do **not** modify files unless the user asks—this command is **read-first** priming.

## Conflict reminder

Constitution → architectural decisions → best practices. Stop and ask if they conflict for the work ahead.
