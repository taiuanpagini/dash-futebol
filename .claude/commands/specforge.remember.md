---
description: Save a decision, pattern, preference, or learning to persistent memory so your AI remembers it in future sessions.
model: claude-sonnet-5
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Prerequisites

This command requires **MemPalace MCP** to be configured. Check by calling `mempalace_status`:
- If it succeeds: proceed with the save flow below
- If it errors or is unavailable: inform the user that memory is not configured. Suggest: `pip install mempalace` and re-run `specforge setup-ai` to enable it.

## Project Structure

- **Config**: `.specforge.yaml` (project root) — contains `projectName`, `stack`, `specsDir`

## Instructions

1. **Read project config**: Load `.specforge.yaml` to extract `projectName`. If missing, use the current directory name.

2. **Parse the user input**: The text after `/specforge.remember` is what the user wants to save. If empty, ask: "What would you like me to remember?"

3. **Classify the memory** into one of these categories:

   | Category | Hall | When to use |
   |----------|------|-------------|
   | `decision` | `hall_facts` | Architectural or design choices ("we chose Redis over Memcached") |
   | `pattern` | `hall_discoveries` | Reusable patterns or approaches ("use MSW for API mocking in tests") |
   | `preference` | `hall_preferences` | Team or personal conventions ("always use Zod for validation") |
   | `lesson` | `hall_advice` | Learnings from experience ("feature X took 3x longer than estimated because Y") |
   | `event` | `hall_events` | Milestones or significant occurrences ("deployed v2 auth to production 2026-03-15") |

   If the category is ambiguous, default to `decision`.

4. **Determine the room** (topic/feature):
   - If on a feature branch (`NNN-feature-name`), use the feature name as the room
   - If the user mentions a specific topic, use that as the room
   - Otherwise, use `general`

5. **Save to memory**: Call `mempalace_add_drawer` with:
   - `wing`: `wing_<projectName>` (slugified: lowercase, spaces to hyphens)
   - `room`: the determined room name
   - `content`: the user's input, optionally enriched with context (date, current branch, related feature)
   - `source_file`: `specforge.remember`

6. **Confirm to the user**: Report what was saved, where it was filed (wing/room), and the category. Example:

   > Saved to memory:
   > - **Wing**: wing_my-app
   > - **Room**: user-auth
   > - **Category**: decision
   > - **Content**: "We chose Clerk over Auth0 for authentication — better DX, lower pricing for our tier, and native Next.js integration."

## Key Rules

- Never modify any project files — this command only writes to MemPalace
- Preserve the user's exact words in the content (you may add context metadata, but don't rewrite their intent)
- If MemPalace is not available, do NOT attempt alternative storage — just inform the user
