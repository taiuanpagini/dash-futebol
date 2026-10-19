---
description: Create or update a feature specification from a natural language feature description.
model: claude-opus-4-8
handoffs:
  - label: Build Technical Plan
    agent: specforge.plan
    prompt: Create a plan for the spec. I am building with...
  - label: Clarify Spec Requirements
    agent: specforge.clarify
    prompt: Clarify specification requirements
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
- **Feature directories**: `<specsDir>/NNN-feature-name/` (e.g., `specs/001-user-auth/`)
- **Templates**: `.specforge/templates/` (stack-specific) and `.specforge/shared/` (common)
- **Constitution**: `constitution.md` (project root)
- **Architectural Decisions**: `architectural-decisions.md` (project root)

## Output Rules

> **IMPORTANT**: Template files under `<specsDir>/templates/` and `<specsDir>/shared/` are **READ-ONLY references**. NEVER modify, overwrite, or write to any file inside the `templates/` or `shared/` directories. Always create NEW files at the designated output paths.

| Artifact | Output Path | Notes |
|---|---|---|
| Feature spec | `<feature-dir>/spec.md` | New file in numbered feature directory |
| Test scenarios | `<feature-dir>/test-scenarios.md` | New file — one section per user story + edge cases |
| Requirements checklist | `<feature-dir>/checklists/requirements.md` | New file |

## Branch-Per-Feature Workflow

SpecForge uses a **branch-per-feature** workflow. Each feature specification lives on its own Git branch, named after the feature. This keeps work isolated, enables parallel feature development, and makes pull requests clean and focused.

**This command (`/specforge.specify`) is where the feature branch is created.** All subsequent commands (`/specforge.plan`, `/specforge.tasks`, `/specforge.implement`, etc.) expect to run on the feature branch.

### Pre-Flight Check

Before creating a new feature, verify and prepare the repository state:

```bash
# 1. Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
```

- If already on a feature branch (pattern `NNN-feature-name`): **STOP** — ask the user if they want to create a new feature (which requires switching to `main` first) or continue working on the current feature.
- If on `main`/`master`/`develop`: Proceed with the steps below.

```bash
# 2. Check for uncommitted changes
git status --porcelain
```

- If there are uncommitted changes: **commit them automatically** before switching branches, so no work is lost.
  - Ensure git user identity is configured (fall back to defaults if absent):
    ```bash
    git config user.email || git config user.email "specforge@local.dev"
    git config user.name  || git config user.name  "SpecForge"
    ```
  - Stage and commit everything:
    ```bash
    git add -A
    git commit -m "chore: persist changes before switching to feature branch"
    ```
  - Inform the user: *"Found uncommitted changes — committed them to `<current-branch>` before creating the feature branch."*
- If the working directory is already clean: proceed without committing.

## Memory Integration (optional — skip if MemPalace MCP is not available)

Memory provides cross-session AI context. If `mempalace_search` / `mempalace_add_drawer` tools are available (check by calling `mempalace_status` — if it errors or is unavailable, skip all memory steps gracefully):

### Memory Save — User Request (do this FIRST, before any generation)

Save the raw user input verbatim so it is preserved as ground truth for "why did we build this?":

- Call `mempalace_add_drawer` with:
  - `wing`: `wing_<projectName>` (from `.specforge.yaml`, slugified)
  - `room`: the feature short-name you will generate in step 2 (defer this save until after step 2 if needed)
  - `content`: the exact text from `$ARGUMENTS` prefixed with `FEATURE REQUEST: `
  - `source_file`: `specforge.specify`

### Memory Recall (do this after loading project context, before spec generation)

Search memory for relevant past context:

1. `mempalace_search` with the feature description as query, filtered to `wing_<projectName>` — look for past decisions, patterns, or related features
2. If results are found, consider them as additional context when writing the spec (especially architectural patterns, past clarifications, and team preferences)
3. Do NOT block on empty results — proceed normally if memory returns nothing

## Outline

The text the user typed after the command **is** the feature description. Do not ask the user to repeat it unless they provided an empty command.

Given that feature description, do this:

1. **Read project config**: Load `.specforge.yaml` from the project root. Extract `projectName`, `stack`, `specsDir`, and `decisions`. If the config doesn't exist, instruct the user to run `specforge init` first.

2. **Generate a concise short name** (2-4 words) for the feature:
   - Analyze the feature description and extract the most meaningful keywords
   - Use action-noun format when possible (e.g., "user-auth", "order-management")
   - Prefer domain/business terms over implementation terms
   - Preserve technical acronyms only when they are intrinsic to the product name or business domain
   - Keep it concise but descriptive
   - Examples:
     - "I want to add user authentication" -> "user-auth"
     - "Implement OAuth2 integration for the API" -> "oauth2-api-integration"
     - "Create a dashboard for analytics" -> "analytics-dashboard"

3. **Determine feature number** — scan ALL sources to find the highest existing feature number across ALL features (not just this short-name):

   ```bash
   # Fetch latest remote state
   git fetch --all --prune

   # Find highest number from remote branches (pattern: NNN-*)
   REMOTE_MAX=$(git ls-remote --heads origin | sed 's|.*refs/heads/||' | grep -oE '^[0-9]+' | sort -n | tail -1)

   # Find highest number from local branches (pattern: NNN-*)
   LOCAL_MAX=$(git branch | sed 's/^[* ]*//' | grep -oE '^[0-9]+' | sort -n | tail -1)

   # Find highest number from specs directories (pattern: NNN-*)
   SPECS_MAX=$(ls -d <specsDir>/[0-9]*-* 2>/dev/null | xargs -I{} basename {} | grep -oE '^[0-9]+' | sort -n | tail -1)

   # Take the maximum across all sources
   # If all are empty, start at 0 so N+1 = 1
   ```

   - Extract the highest number N from all sources
   - Use N+1 for the new feature number (zero-padded to 3 digits)
   - If no existing branches/directories found, start with 1

4. **Create and checkout the feature branch**:

   ```bash
   # Make sure we're on the main/default branch
   git checkout main  # or master/develop — use whatever the project's default branch is

   # Create and switch to the new feature branch
   git checkout -b <NNN>-<short-name>

   # Example:
   # git checkout -b 001-user-auth
   ```

   **IMPORTANT**:
   - The branch name follows the pattern `<NNN>-<short-name>` (e.g., `001-user-auth`, `002-analytics-dashboard`)
   - Always create the branch from the main/default branch to ensure a clean base
   - You must only create one branch per feature

5. **Verify branch was created successfully**:

   ```bash
   git branch --show-current
   # Should output: <NNN>-<short-name>
   ```

   If the branch name doesn't match the expected pattern, **STOP** and report the error.

6. **Create feature directory**:
   - Create `<specsDir>/<NNN>-<short-name>/` directory
   - Example: `specs/001-user-auth/`
   - The directory name matches the branch name for easy correlation

7. **Load spec template**: Read `.specforge/templates/spec-template.md` (stack-specific) or `.specforge/shared/spec-template.md` (fallback). Understand the required sections.

8. **Generate the specification**: Follow this execution flow:
   1. Parse user description from Input. If empty: ERROR "No feature description provided"
   2. Extract key concepts: actors, actions, data, constraints
   3. For unclear aspects:
      - Make informed guesses based on context and industry standards
      - Only mark with `[NEEDS CLARIFICATION: specific question]` if the choice significantly impacts feature scope
      - **LIMIT: Maximum 3 [NEEDS CLARIFICATION] markers total**
   4. Fill Business Proposition section (2-4 sentences):
      - Describe WHO benefits, WHAT they can do, and WHY it matters
      - Use domain language a non-technical stakeholder would understand
      - Do NOT mention frameworks, libraries, SDKs, protocols, databases, queues, caching, or architecture
      - This section becomes the canonical summary used in plan.md, estimate.md, GitHub issues, and Azure DevOps PBIs
   5. Fill User Scenarios & Testing section
      - Each story MUST follow this structure:
        - **As a** [business actor]
        - **I want** [business capability]
        - **So that** [business value/outcome]
      - Story description MUST be business-oriented and outcome-focused
      - Do NOT include implementation details (languages, frameworks, APIs, databases, queues, caching, architecture patterns, protocols)
      - Priority rationale MUST explain business impact (revenue, risk reduction, efficiency, compliance, customer experience)
      - Acceptance scenarios MUST use explicit Gherkin syntax:
        - `Scenario: ...`
        - `Given ...`
        - `When ...`
        - `Then ...`
        - `And ...` (when needed)
      - Keep Gherkin steps business-readable and technology-agnostic
   6. Generate Functional Requirements — each must be testable
   7. Define Success Criteria — measurable, technology-agnostic outcomes
   8. Identify Key Entities (if data involved)
   9. Generate Test Scenarios for each user story (see step 10)

9. **Write the specification** to `<feature-dir>/spec.md` using the template structure, replacing placeholders with concrete details derived from the feature description.

10. **Generate test scenarios** — create `<feature-dir>/test-scenarios.md` with structured test cases for every user story and edge case. Follow the naming/numbering conventions below:

### Test Scenario Naming Convention

| Component | Format | Example |
|---|---|---|
| Scenario ID | `TS-USNN-NNN` | `TS-US01-001` |
| Edge case ID | `TS-EC-NNN` | `TS-EC-001` |
| NFR scenario ID | `TS-NFR-NNN` | `TS-NFR-001` |

- **`TS`** = Test Scenario prefix (always present)
- **`US01`** = Links to User Story 1 (zero-padded, matches the user story number from `spec.md`)
- **`EC`** = Edge Case (not linked to a specific user story)
- **`NFR`** = Non-Functional Requirement scenario
- **`NNN`** = Sequential number within the group (001, 002, 003...)

### Test Scenario Structure (Gherkin-oriented)

For each user story in `spec.md`, generate test scenarios using this format:

```markdown
# Test Scenarios: [Feature Name]

**Feature Branch**: `[NNN-feature-name]`
**Generated from**: `spec.md`
**Total scenarios**: [count]

---

## User Story 1 — [Brief Title] (P1)

> Source: spec.md → User Story 1

### TS-US01-001: [Scenario title — happy path]
- **Type**: Happy Path
- **Preconditions**: [Initial state / setup required]
- **Gherkin**:
  ```gherkin
  Scenario: [Happy path title]
    Given [initial business context]
    When [business action]
    Then [expected business outcome]
  ```
- **Expected Result**: [Observable outcome]
- **Acceptance Criteria**: Maps to FR-001, FR-002

### TS-US01-002: [Scenario title — alternative path]
- **Type**: Alternative Path
- **Preconditions**: [Initial state]
- **Gherkin**:
  ```gherkin
  Scenario: [Alternative path title]
    Given [initial business context]
    And [additional condition]
    When [business action]
    Then [expected business outcome]
  ```
- **Expected Result**: [Observable outcome]
- **Acceptance Criteria**: Maps to FR-003

### TS-US01-003: [Scenario title — error/negative path]
- **Type**: Negative / Error
- **Preconditions**: [Initial state]
- **Gherkin**:
  ```gherkin
  Scenario: [Error path title]
    Given [initial business context]
    When [business action that violates a rule]
    Then [expected error or blocked outcome]
  ```
- **Expected Result**: [Error handling / validation message]
- **Acceptance Criteria**: Maps to FR-004

---

## User Story 2 — [Brief Title] (P2)

### TS-US02-001: [Scenario title]
...

---

## Edge Cases

> Derived from spec.md → Edge Cases section

### TS-EC-001: [Edge case scenario title]
- **Type**: Edge Case
- **Preconditions**: [Boundary condition or unusual state]
- **Gherkin**:
  ```gherkin
  Scenario: [Edge case title]
    Given [boundary condition]
    When [business action]
    Then [expected system behavior]
  ```
- **Expected Result**: [System behavior under edge condition]

---

## Non-Functional Requirements

> Derived from spec.md → Non-Functional Requirements section

### TS-NFR-001: [Performance scenario title]
- **Type**: Performance
- **Preconditions**: [Load conditions]
- **Gherkin**:
  ```gherkin
  Scenario: [NFR scenario title]
    Given [load and context conditions]
    When [business action under expected load]
    Then [measurable threshold is met]
  ```
- **Expected Result**: [Response time / throughput threshold]
- **Acceptance Criteria**: Maps to NFR-001
```

### Test Scenario Generation Rules

- **Every user story MUST have at least 3 test scenarios**: one happy path, one alternative path, one negative/error path
- **Every edge case** from the spec MUST have a corresponding `TS-EC-NNN` scenario
- **Every measurable NFR** MUST have a corresponding `TS-NFR-NNN` scenario
- **Map each scenario to requirements**: Use `Acceptance Criteria: Maps to FR-NNN` or `NFR-NNN` to trace back
- **Scenario IDs are globally unique within the feature** — never reuse an ID
- **Scenarios must be technology-agnostic** — describe WHAT to test, not HOW (no code, no framework references)
- **Use Gherkin consistently** in acceptance/test scenarios (`Scenario`, `Given`, `When`, `Then`, `And`)
- **Preconditions must be specific** — "user is logged in" not "system is ready"
- **Expected results must be observable** — "error message is displayed" not "system handles error"

11. **Specification Quality Validation**: After writing the initial spec, validate:
   - Business Proposition is technology-agnostic, focused on user/business value, and free of framework/SDK/protocol mentions
   - No implementation details (languages, frameworks, APIs) leak into specification
   - User stories use As a / I want / So that format
   - User stories are focused on user value and business outcomes (not technical tasks)
   - Acceptance scenarios are written in Gherkin syntax
   - Requirements are testable and unambiguous
   - Success criteria are measurable and technology-agnostic
   - All acceptance scenarios are defined
   - Edge cases are identified
   - Test scenarios cover all user stories, edge cases, and NFRs
   - Every functional requirement is traced to at least one test scenario

   Create a checklist at `<feature-dir>/checklists/requirements.md` documenting the validation results.

12. **Handle [NEEDS CLARIFICATION] markers** (if any remain):
   - Extract all markers from the spec (max 3)
   - For each, present options in a table format:

     | Option | Answer | Implications |
     |--------|--------|--------------|
     | A      | First answer | What this means |
     | B      | Second answer | What this means |
     | C      | Third answer | What this means |

   - Wait for user responses, then update the spec

13. **Commit the specification to the feature branch**:

    ```bash
    git add <feature-dir>/
    git commit -m "feat(<short-name>): add feature specification and test scenarios"
    ```

14. **Report completion** with:
    - **Branch name** (e.g., `001-user-auth`)
    - Feature directory path
    - Spec file path
    - Test scenarios file path and summary (total count, per user story, edge cases, NFR scenarios)
    - Checklist results
    - Readiness for next phase (`/specforge.clarify` or `/specforge.plan`)
    - Remind user: all subsequent commands should be run while on this feature branch

## Memory Save — Decisions (after committing, if MemPalace is available)

After the spec is committed, save key decisions to memory for future sessions:

1. Call `mempalace_add_drawer` with:
   - `wing`: `wing_<projectName>`
   - `room`: `<short-name>` (the feature short-name)
   - `content`: A concise summary (3-5 sentences) of: the feature purpose, key scope boundaries, and any significant decisions made during specification (e.g., "Scoped to API-only, no UI. Authentication delegated to existing auth module. Rate limiting deferred to phase 2.")
   - `source_file`: `specforge.specify`
2. If any `[NEEDS CLARIFICATION]` markers were resolved with user answers, save each resolution as a separate drawer with the question and chosen answer.

Skip gracefully if MemPalace tools are not available.

## Key Rules

- Use absolute paths when referencing files
- The specification must be technology-agnostic (describe WHAT, not HOW)
- Reference the project constitution for guiding principles
- Reference architectural decisions for infrastructure choices
- Each feature gets its own numbered directory under the specs folder
- **Each feature gets its own Git branch** — the branch name matches the feature directory name (e.g., branch `001-user-auth` -> directory `specs/001-user-auth/`)
- Always commit the spec to the feature branch before handing off to the next command
- **Feature numbers are globally sequential** — scan ALL branches and directories (not just matching short-names) to avoid number collisions
