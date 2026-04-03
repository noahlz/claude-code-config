# "Superpowers" Skill Rules

- Save design and plan docs to `.claude/plans/`, not `docs/`.
- Do NOT run `git` commands. The user commits manually.
- Do NOT enter plan execution mode automatically. Stop and ask — the user may want a separate session.

## Planning

- Do NOT write full implementation code in plans. Use pseudocode, type signatures, or brief illustrative snippets only.
- Define high-level steps: what code to write, what tasks to perform at each stage.

## Subagent Delegation

- ALL code writing, code review, and debugging MUST be delegated to Sonnet and Haiku subagents.
- Opus orchestrates, plans, and reviews at a high level — it does not write or fix code directly.

## Integrated Testing

- Write tests alongside each code task, not batched into a final task.
- Each subagent implements code + tests together so the reviewer checks both.
- If a plan only touches documentation files (markdown, comments, READMEs), skip testing entirely — do not include test steps in the plan or run tests during execution.

## Selective Spec Reviews

- Skip spec review for mechanical changes (find-replace renames, comment-only edits).
- Use `grep` to verify mechanical renames instead.
- Reserve spec reviews for logic changes.

## Selective Code Quality Reviews

- Small targeted fixes to existing functions can skip code quality review.
- Require code quality review for structural changes (e.g., data model restructures, new abstractions).

## Batch Size Cap

- Cap at 3–4 steps per subagent. 2–4 is the sweet spot.
- If a task has 5+ steps, split it before dispatching.

## Review Modified Test Assertions

- When subagents update existing test expectations, those changes MUST also be reviewed.
- Test-quality review covers both new tests and modified assertions in existing tests.

## TS Language Server Restart (Node/TypeScript projects only)

- After broad renames (e.g., variable/type renames across many files), restart the TS language server.
- This prevents false-positive LSP diagnostics that persist for the rest of the session.
