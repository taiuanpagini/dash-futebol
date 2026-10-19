---
description: Create or update the project constitution from interactive or provided principle inputs, ensuring all dependent templates stay in sync.
model: claude-opus-4-8
handoffs:
  - label: Build Specification
    agent: specforge.specify
    prompt: Implement the feature specification based on the updated constitution. I want to build...
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
- **Templates**: `.specforge/templates/` and `.specforge/shared/`

## Output Rules

> **IMPORTANT**: Template files under `<specsDir>/templates/` and `<specsDir>/shared/` are **READ-ONLY references**. NEVER modify, overwrite, or write to any file inside the `templates/` or `shared/` directories. Always write output to the designated output path.

| Artifact | Output Path | Notes |
|---|---|---|
| Constitution | `constitution.md` (project root) | Create new or overwrite existing |

## Branch-Per-Feature Workflow

Unlike other SpecForge commands, `/specforge.constitution` operates at the **project level** and should typically run on the `main` (or default) branch — NOT on a feature branch. The constitution governs all features and should be established before any feature work begins.

### Branch Guard (MANDATORY — run BEFORE any other step)

```bash
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
```

- If `$CURRENT_BRANCH` is `main` or `master`: **PROCEED** — this is the correct branch for constitution changes.
- If `$CURRENT_BRANCH` matches pattern `NNN-feature-name` (e.g., `001-user-auth`): **STOP** — do NOT proceed. Tell the user:
  > "You are on the `$CURRENT_BRANCH` feature branch. The constitution must be updated on the `main` branch because it governs all features. Run: `git checkout main` first, then re-run `/specforge.constitution`."
- If `$CURRENT_BRANCH` is `develop` or another non-main branch: **WARN** — suggest switching to `main` but allow the user to proceed if they confirm.

After updating the constitution on `main`, feature branches should merge the changes:

```bash
git checkout <feature-branch>
git merge main
```

## Outline

You are updating the project constitution at `constitution.md` in the project root. This file contains the governing principles and development guidelines for the project. Your job is to (a) collect/derive concrete values, (b) fill or update the constitution, and (c) propagate any amendments across dependent artifacts.

Follow this execution flow:

1. **Load existing constitution**: Read `constitution.md` from the project root.
   - If it doesn't exist, read `.specforge.yaml` to get the stack name, then look for a constitution template at `.specforge/templates/constitution-template.md` or `.specforge/shared/constitution-template.md`. Copy it to `constitution.md` as a starting point.
   - Identify every placeholder token of the form `[ALL_CAPS_IDENTIFIER]`.
   - The user might require fewer or more principles than the template. Respect their requirements.

2. **Collect/derive values for placeholders**:
   - If user input supplies a value, use it.
   - Otherwise infer from existing repo context (README, docs, `.specforge.yaml`, prior constitution).
   - For governance dates: `RATIFICATION_DATE` is the original adoption date (if unknown, ask or mark TODO). `LAST_AMENDED_DATE` is today if changes are made.
   - `CONSTITUTION_VERSION` must increment using semantic versioning:
     - MAJOR: Backward-incompatible governance/principle removals or redefinitions
     - MINOR: New principle/section added or materially expanded guidance
     - PATCH: Clarifications, wording, typo fixes

3. **Draft the updated constitution**:
   - Replace every placeholder with concrete text (no bracketed tokens left)
   - Preserve heading hierarchy
   - Ensure each Principle section has: name, non-negotiable rules, explicit rationale
   - Ensure Governance section lists amendment procedure and versioning policy

4. **Consistency propagation**:
   - Read `.specforge/templates/plan-template.md` and ensure any "Constitution Check" aligns with updated principles
   - Read `.specforge/templates/spec-template.md` for scope/requirements alignment
   - Read `.specforge/templates/tasks-template.md` and ensure task categorization reflects new principles
   - Read `architectural-decisions.md` and verify alignment with constitution principles

5. **Produce a Sync Impact Report** (prepend as HTML comment at top of constitution):
   - Version change: old -> new
   - List of modified principles
   - Added/removed sections
   - Templates requiring updates (with file paths)
   - Follow-up TODOs if any placeholders deferred

6. **Validation before final output**:
   - No remaining unexplained bracket tokens
   - Version line matches report
   - Dates in ISO format YYYY-MM-DD
   - Principles are declarative, testable, and free of vague language

7. **Write the completed constitution** back to `constitution.md` (overwrite).

8. **Commit the constitution**:

   ```bash
   git add constitution.md
   git commit -m "docs: amend constitution to vX.Y.Z"
   ```

9. **Output final summary** to the user with:
   - New version and bump rationale
   - Files flagged for manual follow-up
   - Suggested commit message
   - Remind user: if on `main`, feature branches should merge main to pick up the updated constitution

## Key Rules

- Use absolute paths when referencing files
- Always operate on the existing `constitution.md` file
- Preserve heading hierarchy from the template
- If critical info is missing, insert `TODO(): explanation`
- The constitution is the supreme authority for all project principles
- **Should run on `main` branch** — the constitution is project-level, not feature-level
- After updating on main, feature branches should merge main to pick up changes
