---
description: Generate a custom checklist for the current feature based on user requirements — "Unit Tests for English".
model: claude-sonnet-5
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
- **Feature directories**: `<specsDir>/NNN-feature-name/`
- **Constitution**: `constitution.md` (project root)

## Output Rules

> **IMPORTANT**: Template files under `<specsDir>/templates/` and `<specsDir>/shared/` are **READ-ONLY references**. NEVER modify, overwrite, or write to any file inside the `templates/` or `shared/` directories. Always create NEW files at the designated output paths in the feature directory.

| Artifact | Output Path | Notes |
|---|---|---|
| Checklist | `<feature-dir>/checklists/<domain>.md` | New file per domain (never overwrite existing) |

## Checklist Purpose: "Unit Tests for English"

**CRITICAL CONCEPT**: Checklists are **UNIT TESTS FOR REQUIREMENTS WRITING** — they validate the quality, clarity, and completeness of requirements in a given domain.

**NOT for verification/testing**:
- NOT "Verify the button clicks correctly"
- NOT "Test error handling works"
- NOT "Confirm the API returns 200"

**FOR requirements quality validation**:
- "Are visual hierarchy requirements defined for all card types?" (completeness)
- "Is 'prominent display' quantified with specific sizing/positioning?" (clarity)
- "Are hover state requirements consistent across all interactive elements?" (consistency)
- "Are accessibility requirements defined for keyboard navigation?" (coverage)

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

## Execution Steps

1. **Setup**: Read `.specforge.yaml` from the project root.

2. **Locate feature directory**: Use the current branch name to find the active feature directory.

3. **Clarify intent (dynamic)**: Derive up to THREE initial contextual clarifying questions. They MUST:
   - Be generated from the user's phrasing + extracted signals from spec/plan/tasks
   - Only ask about information that materially changes checklist content
   - Be skipped individually if already unambiguous in `$ARGUMENTS`

   Generation algorithm:
   1. Extract signals: feature domain keywords, risk indicators, stakeholder hints, deliverables
   2. Cluster signals into candidate focus areas (max 4) ranked by relevance
   3. Formulate questions from archetypes:
      - Scope refinement
      - Risk prioritization
      - Depth calibration
      - Audience framing
      - Boundary exclusion

4. **Understand user request**: Combine `$ARGUMENTS` + clarifying answers:
   - Derive checklist theme (e.g., security, review, deploy, ux)
   - Consolidate explicit must-have items mentioned by user
   - Map focus selections to category scaffolding

5. **Load feature context**: Read from the feature directory:
   - `spec.md`: Feature requirements and scope
   - `plan.md` (if exists): Technical details, dependencies
   - `tasks.md` (if exists): Implementation tasks

6. **Generate checklist** — Create "Unit Tests for Requirements":
   - Create `<feature-dir>/checklists/` directory if it doesn't exist
   - Generate unique checklist filename based on domain (e.g., `ux.md`, `api.md`, `security.md`)
   - Number items sequentially starting from CHK001
   - Each run creates a NEW file (never overwrites existing checklists)

   **Category Structure** — Group items by requirement quality dimensions:
   - **Requirement Completeness** (Are all necessary requirements documented?)
   - **Requirement Clarity** (Are requirements specific and unambiguous?)
   - **Requirement Consistency** (Do requirements align without conflicts?)
   - **Acceptance Criteria Quality** (Are success criteria measurable?)
   - **Scenario Coverage** (Are all flows/cases addressed?)
   - **Edge Case Coverage** (Are boundary conditions defined?)
   - **Non-Functional Requirements** (Performance, Security, Accessibility — are they specified?)
   - **Dependencies & Assumptions** (Are they documented and validated?)

   **HOW TO WRITE CHECKLIST ITEMS**:

   WRONG (Testing implementation):
   - "Verify landing page displays 3 episode cards"
   - "Test hover states work on desktop"

   CORRECT (Testing requirements quality):
   - "Are the exact number and layout of featured episodes specified?" [Completeness]
   - "Is 'prominent display' quantified with specific sizing/positioning?" [Clarity]
   - "Are hover state requirements consistent across all interactive elements?" [Consistency]
   - "Are keyboard navigation requirements defined for all interactive UI?" [Coverage]

   **ITEM STRUCTURE**:
   - Question format asking about requirement quality
   - Focus on what's WRITTEN (or not written) in the spec/plan
   - Include quality dimension in brackets [Completeness/Clarity/Consistency/etc.]
   - Reference spec section `[Spec section-name]` when checking existing requirements
   - Use `[Gap]` marker when checking for missing requirements

7. **Write checklist file** to `<feature-dir>/checklists/<domain>.md`

8. **Commit checklist to the feature branch**:

   ```bash
   git add <feature-dir>/checklists/
   git commit -m "feat(<short-name>): add <domain> checklist"
   ```

9. **Report**: Output checklist path, summary of items generated per category, and current branch name.

## Key Rules

- Use absolute paths when referencing files
- Checklists validate REQUIREMENTS quality, not implementation correctness
- Each checklist item must be a question about requirement completeness, clarity, or consistency
- Never overwrite existing checklists — create new files for each domain
- **Must run on the feature branch** created by `/specforge.specify` — STOP if on main/master
- Commit checklist files to the feature branch
