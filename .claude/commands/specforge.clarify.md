---
description: Identify underspecified areas in the current feature spec by asking up to 5 highly targeted clarification questions and encoding answers back into the spec.
model: claude-sonnet-5
handoffs:
  - label: Build Technical Plan
    agent: specforge.plan
    prompt: Create a plan for the spec. I am building with...
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
- **Architectural Decisions**: `architectural-decisions.md` (project root)

## Output Rules

> **IMPORTANT**: This command modifies `<feature-dir>/spec.md` (the feature's own spec file). It does NOT modify any template files. NEVER write to files inside `<specsDir>/templates/` or `<specsDir>/shared/`.

| Artifact | Output Path | Notes |
|---|---|---|
| Updated spec | `<feature-dir>/spec.md` | Modifies existing file with clarifications |

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

Goal: Detect and reduce ambiguity or missing decision points in the active feature specification and record the clarifications directly in the spec file.

Note: This clarification workflow should run BEFORE invoking `/specforge.plan`. If the user explicitly states they are skipping clarification, warn that downstream rework risk increases.

### Execution Steps

1. **Setup**: Read `.specforge.yaml` from the project root.

2. **Locate feature and load spec**: Use the current branch name to find the feature directory. Read `<feature-dir>/spec.md` (REQUIRED — abort if missing, instruct user to run `/specforge.specify`).

3. **Structured ambiguity & coverage scan**: For each category, mark status: Clear / Partial / Missing.

   **Functional Scope & Behavior:**
   - Core user goals & success criteria
   - Explicit out-of-scope declarations
   - User roles / personas differentiation

   **Domain & Data Model:**
   - Entities, attributes, relationships
   - Identity & uniqueness rules
   - Lifecycle/state transitions
   - Data volume / scale assumptions

   **Interaction & UX Flow:**
   - Critical user journeys / sequences
   - Error/empty/loading states
   - Accessibility or localization notes

   **Non-Functional Quality Attributes:**
   - Performance (latency, throughput targets)
   - Scalability (horizontal/vertical, limits)
   - Reliability & availability
   - Observability (logging, metrics, tracing)
   - Security & privacy (authN/Z, data protection)

   **Integration & External Dependencies:**
   - External services/APIs and failure modes
   - Data import/export formats

   **Edge Cases & Failure Handling:**
   - Negative scenarios
   - Rate limiting / throttling
   - Conflict resolution

   **Constraints & Tradeoffs:**
   - Technical constraints
   - Explicit tradeoffs or rejected alternatives

4. **Generate clarification questions** (maximum 5): Apply these constraints:
   - Maximum of 10 total questions across the whole session
   - Each question must be answerable with EITHER:
     - A short multiple-choice selection (2-5 options), OR
     - A one-word / short-phrase answer (<=5 words)
   - Only include questions whose answers materially impact architecture, data modeling, task decomposition, test design, UX behavior, or compliance
   - Ensure category coverage balance
   - Favor clarifications that reduce downstream rework risk

5. **Sequential questioning loop** (interactive):
   - Present EXACTLY ONE question at a time
   - For multiple-choice questions:
     - **Analyze all options** and determine the **most suitable option** based on best practices
     - Present your **recommended option prominently**: `**Recommended:** Option [X] - <reason>`
     - Render all options as a Markdown table
     - Allow user to accept recommendation by saying "yes" or provide their own answer
   - After the user answers:
     - Validate the answer
     - Record it in working memory
     - Move to the next queued question
   - Stop asking when:
     - All critical ambiguities resolved
     - User signals completion ("done", "good", "no more")
     - You reach 5 asked questions

   **Specification style guardrails (must preserve):**
   - Keep user stories business-oriented and outcome-focused
   - Preserve `As a / I want / So that` format in story statements
   - Keep acceptance scenarios in Gherkin (`Scenario`, `Given`, `When`, `Then`, `And`)
   - Do not add implementation details (frameworks, APIs, databases, queues, cache, architecture patterns)

6. **Integration after EACH accepted answer**:
   - Ensure a `## Clarifications` section exists in spec.md (create if missing)
   - Under it, create `### Session YYYY-MM-DD` subheading for today
   - Append: `- Q: <question> -> A: <answer>`
   - Apply the clarification to the most appropriate section:
     - Functional ambiguity -> Update Functional Requirements
     - Data shape / entities -> Update Data Model section
     - Non-functional constraint -> Add measurable criteria
     - Edge case / negative flow -> Add under Edge Cases section
     - Terminology conflict -> Normalize across spec
   - If the clarification invalidates an earlier statement, replace it (don't duplicate)
   - If editing user stories or acceptance sections, preserve format:
     - User stories: `As a / I want / So that`
     - Acceptance: explicit Gherkin scenarios
   - **Save the spec file AFTER each integration** (atomic overwrite)

7. **Validation** (after each write + final pass):
   - Clarifications session contains exactly one bullet per accepted answer
   - Total asked questions <= 5
   - Updated sections contain no lingering vague placeholders the answer resolved
   - No contradictory earlier statement remains
   - User stories remain in `As a / I want / So that` format
   - Acceptance scenarios remain in Gherkin syntax
   - No new implementation-detail language leaked into business sections
   - Markdown structure valid

8. **Commit clarifications to the feature branch**:

   ```bash
   git add <feature-dir>/spec.md
   git commit -m "feat(<short-name>): clarify specification"
   ```

9. **Report completion** with:
    - **Current branch name**
    - Number of clarifications applied
    - Categories addressed
    - Remaining unresolved areas (if any)
    - Readiness for next phase (`/specforge.plan`)
    - Remind user: continue working on this feature branch

## Key Rules

- Use absolute paths when referencing files
- Maximum 5 questions per session, 10 across all sessions
- Each answer must be immediately integrated into the spec
- Save after each integration to minimize context loss
- Never reveal future queued questions in advance
- Reference the project constitution for principle alignment
- **Must run on the feature branch** created by `/specforge.specify` — STOP if on main/master
- Commit clarification updates to the feature branch before handing off
