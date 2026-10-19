---
description: Review Azure DevOps pull requests against project constitution, best practices, and architectural decisions.
model: claude-sonnet-5
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). Accepted formats:
- A PR ID (e.g., `42`)
- A PR URL (e.g., `https://dev.azure.com/myorg/MyProject/_git/my-repo/pullrequest/42`)
- `no-vote` flag (e.g., `42 no-vote`) to skip voting
- Empty — auto-detect from the current branch

## Project Structure

This project uses **SpecForge** for Spec-Driven Development. Key paths:

- **Config**: `.specforge.yaml` (project root) — contains `stack`, `projectName`, `specsDir`, `decisions`, optionally `azureDevOps` (org, project), and optionally `team` (team members with roles)
- **Constitution**: `constitution.md` (project root)
- **Best Practices**: `.specforge/templates/best-practices.md` (or `best-practices.md` at root)
- **Architectural Decisions**: `architectural-decisions.md` (project root)

## Output Rules

> **IMPORTANT**: This command is **read-only** on local files. It reads the project rules and posts comments/votes on the Azure DevOps PR via the **Azure DevOps MCP**. NEVER modify any local files.

| Artifact | Output | Notes |
|---|---|---|
| Inline comments | Azure DevOps PR threads | One per finding, at specific file/line |
| Summary comment | Azure DevOps PR thread | General thread with overview |
| Vote | Azure DevOps PR | Approve, wait, or reject based on findings |

## Prerequisites

- The **Azure DevOps MCP** must be configured with the `repositories` domain enabled. Run `specforge setup-ai cursor` to configure `.cursor/mcp.json` automatically. The MCP must include domains: `core`, `work`, `work-items`, `test-plans`, `repositories`.
- `.specforge.yaml` must contain an `azureDevOps` block with `org` and `project`.

## Outline

1. **Setup**: Read `.specforge.yaml` from the project root. Extract `azureDevOps.org`, `azureDevOps.project`, `stack`, and `team` (if present). If `azureDevOps` is missing, **STOP** and tell the user to configure it.

2. **Find the PR**:

   - If `$ARGUMENTS` contains a numeric PR ID, use it directly.
   - If `$ARGUMENTS` contains a PR URL, extract the PR ID from it.
   - If `$ARGUMENTS` is empty, detect the current branch and find active PRs for it:

     ```bash
     CURRENT_BRANCH=$(git branch --show-current)
     ```

     Use `mcp_ado_repo_list_pull_requests_by_repo_or_project` filtered by `sourceRefName` matching `refs/heads/$CURRENT_BRANCH`. If multiple PRs exist, list them and ask the user to pick one. If no PRs exist, **STOP** and tell the user no active PR was found for this branch.

3. **Load PR details**: Use `mcp_ado_repo_get_pull_request_by_id` to get:
   - PR title, description, author
   - Source and target branches
   - List of changed files with their diffs (iterations/changes)

4. **Load review criteria** from the local project:
   - Read `constitution.md` (REQUIRED — STOP if missing)
   - Read `.specforge/templates/best-practices.md` or `best-practices.md` (if exists)
   - Read `architectural-decisions.md` (if exists)
   - Read `.specforge.yaml` for stack-specific context

5. **Check for existing review threads**: Use `mcp_ado_repo_list_pull_request_threads` to see if the bot has already posted comments on this PR. Track existing thread file/line combinations to avoid duplicates on re-review.

6. **Analyze each changed file** against the review criteria:

   **Architecture** (from constitution.md):
   - Clean Architecture layer violations (Domain importing from Infrastructure/Presentation)
   - Dependency direction errors (inner layers depending on outer layers)
   - Imports crossing layer boundaries
   - Business logic in controllers/handlers

   **Testing** (from constitution.md):
   - New code files without corresponding test files
   - Test coverage patterns not followed (unit, integration, E2E)
   - Missing Testcontainers usage for integration tests
   - Skipped tests or reduced coverage

   **Code Quality**:
   - Missing input validation (class-validator, Pydantic, FluentValidation depending on stack)
   - Inadequate error handling (empty catch blocks, swallowed errors)
   - Type safety issues (any/unknown abuse, missing type annotations)
   - Naming convention violations

   **Security**:
   - Hardcoded secrets, API keys, or credentials
   - Missing authentication/authorization guards on endpoints
   - Input validation gaps (SQL injection, XSS vectors)
   - CORS misconfiguration, missing rate limiting

   **Best Practices** (from best-practices.md):
   - Stack-specific DO/DON'T pattern violations
   - Anti-patterns for the project's framework

   **Architectural Decisions** (from architectural-decisions.md):
   - Inconsistency with chosen infrastructure (using a different DB, cache, queue than decided)
   - Deviating from chosen patterns (e.g., using raw SQL when ORM was decided)

7. **Check for common red flags**:
   - New dependencies added without justification in PR description
   - Files in `.specforge/`, `constitution.md`, or `architectural-decisions.md` modified
   - Tests skipped or test configuration modified to reduce coverage
   - Raw SQL in Application or Domain layers
   - Missing migrations for schema changes
   - `.env` or credential files included in the PR

8. **Post inline comments**: For each finding, create a PR thread at the specific file and line using `mcp_ado_repo_create_pull_request_thread`. Skip findings that overlap with existing threads (idempotency). Each comment follows this format:

   ```
   **[SEVERITY] Category — Issue Title**

   Description of the problem.

   **Suggested fix:** Brief description of how to fix this.

   Reference: constitution.md, Section X
   ```

   Severity levels:
   - **CRITICAL**: Constitution violations (layer boundaries, missing tests, security holes)
   - **HIGH**: Best-practice violations, missing validation, architectural decision conflicts
   - **MEDIUM**: Code quality issues, naming, documentation gaps
   - **LOW**: Style suggestions, minor improvements

9. **Post summary comment**: Create a general PR thread (not inline) with:

   ```
   ## SpecForge Review Summary

   **PR**: #<id> — <title>
   **Files reviewed**: X
   **Issues found**: Y (Z critical, W high, V medium, U low)

   ### Compliance Score

   | Category | Status |
   |----------|--------|
   | Architecture | PASS / FAIL |
   | Testing | PASS / FAIL |
   | Security | PASS / FAIL |
   | Code Quality | PASS / FAIL |
   | Best Practices | PASS / FAIL |
   | Architectural Decisions | PASS / FAIL |

   ### Key Findings

   | # | Severity | File | Issue |
   |---|----------|------|-------|
   | 1 | CRITICAL | src/domain/user.ts | Layer boundary violation |
   | ... | ... | ... | ... |

   ### Positive Highlights
   - Good patterns observed in the PR

   ### Recommended Actions
   1. Fix all CRITICAL issues before merging
   2. Address HIGH issues or justify in PR comments
   3. Consider MEDIUM/LOW suggestions for code quality
   ```

10. **Vote on PR** (unless `$ARGUMENTS` contains `no-vote`):

    Use `mcp_ado_repo_vote_pull_request`:
    - **No CRITICAL or HIGH issues**: Approve (`vote: 10`)
    - **HIGH issues found (no CRITICAL)**: Wait for author (`vote: -5`)
    - **CRITICAL issues found**: Reject (`vote: -10`)

11. **Report**: Output a summary to the user:
    - Link to the PR
    - Number of files reviewed
    - Number of inline comments posted (new vs skipped duplicates)
    - Vote cast (or "skipped" if `no-vote`)
    - Top findings by severity

## Key Rules

- **Read-only on local files**: This command NEVER modifies local files. It only reads project rules and posts to the ADO PR.
- **Idempotent**: If run again on the same PR, check existing threads and avoid posting duplicate comments at the same file/line. New findings (from updated code) should still be posted.
- **Stack-aware**: Use the `stack` from `.specforge.yaml` to apply stack-specific review patterns (e.g., NestJS module patterns for `web-nestjs`, Pydantic validation for `api-fastapi`, Entity Framework conventions for `api-dotnet`).
- Use the Azure DevOps MCP tools exclusively — do not call REST APIs directly.
- If the MCP is unavailable or a tool call fails, report the error clearly and stop.
