---
description: Perform a non-destructive cross-artifact consistency and quality analysis across spec.md, plan.md, and tasks.md after task generation.
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
- **Architectural Decisions**: `architectural-decisions.md` (project root)

## Output Rules

> **IMPORTANT**: This command is **STRICTLY READ-ONLY**. It does NOT modify any files — not spec files, not plan files, not template files. The analysis report is displayed in chat only. NEVER write to files inside `<specsDir>/templates/` or `<specsDir>/shared/`.

| Artifact | Output Path | Notes |
|---|---|---|
| Analysis report | Chat output only | No files written or modified |

## Goal

Identify inconsistencies, duplications, ambiguities, and underspecified items across the three core artifacts (`spec.md`, `plan.md`, `tasks.md`) before implementation. This command MUST run only after `/specforge.tasks` has successfully produced a complete `tasks.md`.

## Operating Constraints

**STRICTLY READ-ONLY**: Do **not** modify any files. Output a structured analysis report. Offer an optional remediation plan (user must explicitly approve before any follow-up editing commands would be invoked manually).

**Constitution Authority**: The project constitution (`constitution.md`) is **non-negotiable** within this analysis scope. Constitution conflicts are automatically CRITICAL and require adjustment of the spec, plan, or tasks — not dilution or reinterpretation of the principle.

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

### 1. Initialize Analysis Context

Read `.specforge.yaml` from the project root.

Use the current branch name to locate the active feature directory. Derive absolute paths:

- SPEC = `<feature-dir>/spec.md`
- PLAN = `<feature-dir>/plan.md`
- TASKS = `<feature-dir>/tasks.md`

Abort with an error message if any required file is missing (instruct the user to run the missing prerequisite command).

### 2. Load Artifacts (Progressive Disclosure)

Load only the minimal necessary context from each artifact:

**From spec.md:**
- Overview/Context
- Functional Requirements
- Non-Functional Requirements
- User Stories
- Edge Cases (if present)

**From plan.md:**
- Architecture/stack choices
- Data Model references
- Phases
- Technical constraints

**From tasks.md:**
- Task IDs
- Descriptions
- Phase grouping
- Parallel markers [P]
- Referenced file paths

**From constitution.md:**
- Load for principle validation

**From architectural-decisions.md:**
- Load for infrastructure alignment checks

### 3. Build Semantic Models

Create internal representations (do not include raw artifacts in output):

- **Requirements inventory**: Each functional + non-functional requirement with a stable key
- **User story/action inventory**: Discrete user actions with acceptance criteria
- **Task coverage mapping**: Map each task to one or more requirements or stories
- **Constitution rule set**: Extract principle names and MUST/SHOULD normative statements
- **Decisions alignment**: Map architectural decisions to plan/task references

### 4. Detection Passes

Focus on high-signal findings. Limit to 50 findings total; aggregate remainder in overflow summary.

#### A. Duplication Detection
- Identify near-duplicate requirements
- Mark lower-quality phrasing for consolidation

#### B. Ambiguity Detection
- Flag vague adjectives (fast, scalable, secure, intuitive) lacking measurable criteria
- Flag unresolved placeholders (TODO, TKTK, ???, etc.)

#### C. Underspecification
- Requirements with verbs but missing object or measurable outcome
- User stories missing acceptance criteria alignment
- Tasks referencing files or components not defined in spec/plan

#### D. Constitution Alignment
- Any requirement or plan element conflicting with a MUST principle
- Missing mandated sections or quality gates from constitution

#### E. Coverage Gaps
- Requirements with zero associated tasks
- Tasks with no mapped requirement/story
- Non-functional requirements not reflected in tasks

#### F. Inconsistency
- Terminology drift (same concept named differently across files)
- Data entities referenced in plan but absent in spec (or vice versa)
- Task ordering contradictions
- Conflicting requirements

#### G. Architectural Decisions Alignment
- Plan choices that contradict decisions in `architectural-decisions.md`
- Tasks that don't account for chosen infrastructure (e.g., caching strategy, queue system)

### 5. Severity Assignment

- **CRITICAL**: Violates constitution MUST, missing core spec artifact, or requirement with zero coverage that blocks baseline functionality
- **HIGH**: Duplicate or conflicting requirement, ambiguous security/performance attribute, architectural decisions contradiction
- **MEDIUM**: Terminology drift, missing non-functional task coverage, underspecified edge case
- **LOW**: Style/wording improvements, minor redundancy

### 6. Produce Compact Analysis Report

Output a Markdown report (no file writes) with:

**Findings Table:**

| ID | Category | Severity | Location(s) | Summary | Recommendation |
|----|----------|----------|-------------|---------|----------------|

**Coverage Summary Table:**

| Requirement Key | Has Task? | Task IDs | Notes |
|-----------------|-----------|----------|-------|

**Constitution Alignment Issues** (if any)

**Architectural Decisions Alignment Issues** (if any)

**Unmapped Tasks** (if any)

**Metrics:**
- Total Requirements / Total Tasks / Coverage % / Ambiguity Count / Duplication Count / Critical Issues Count

### 7. Provide Next Actions

- If CRITICAL issues exist: Recommend resolving before `/specforge.implement`
- If only LOW/MEDIUM: User may proceed with improvement suggestions
- Provide explicit command suggestions (e.g., "Run /specforge.specify with refinement", "Run /specforge.plan to adjust architecture")

### 8. Offer Remediation

Ask the user: "Would you like me to suggest concrete remediation edits for the top N issues?" (Do NOT apply them automatically.)

## Key Rules

- **NEVER modify files** (this is read-only analysis)
- **NEVER hallucinate missing sections** (if absent, report accurately)
- **Prioritize constitution violations** (always CRITICAL)
- Use absolute paths when referencing files
- Report zero issues gracefully (emit success report with coverage statistics)
- **Must run on the feature branch** created by `/specforge.specify` — STOP if on main/master
- Include the current branch name in the analysis report header
