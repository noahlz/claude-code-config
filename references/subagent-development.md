# Subagent Development Rules

## Dispatch Rules

Include this block verbatim at the top of every subagent prompt:

> **Subagent constraints — follow these exactly:**
> - Read-only git (`status`, `diff`, `log`, `show`) is always fine. Inside a worktree you may `git add`/`git commit` to that worktree's branch; outside one, do not commit. Never `push`, `merge`, `rebase`, `reset --hard`, or `clean -fdx`, and never make the closing commit — the user does that.
> - Write tests alongside implementation code, not separately.
> - Cap your work at 3–4 discrete steps. If you received more, stop and report back.

### Per-Agent Task Batch Size

- 2–4 steps per subagent.
- If a task has 5+ steps, split it across multiple subagents before dispatching.
- If two adjacent tasks are logically related and total ≤4 steps combined, fold them into a single subagent dispatch.

### Model Selection

- Sonnet: simple, mechanical subagent tasks.
- Opus: complex subagent tasks (refactoring, complex business logic).
- Never override to Fable or Haiku for subagent coding work.

### Parallel Dispatch

Two or more tasks with no shared state: dispatch in parallel. Don't serialize independent work.

### Pre-read before dispatch

Read files the task will touch. Include relevant excerpts (type signatures, function signatures, affected logic) in the subagent prompt. Don't make subagents re-discover context you already have.

### Testing

- Each subagent writes code + tests together. Never batch tests into a final step.
- Exception: documentation-only plans (markdown, comments, READMEs) — skip testing entirely.
- When subagents modify existing test expectations, those changes MUST also be reviewed.
- Test-quality review covers both new tests and modified assertions.

## WORKTREE POLICY

Ask the user before creating worktrees. Use isolated worktrees for parallel subagents to prevent conflicts.

## REVIEW RULES

### Mechanical tasks — skip both spec review and code quality review

Tasks that only connect existing pieces without introducing new logic (e.g. find-replace renames, updating imports). Verify with `grep` instead.

### Logic changes — require spec review. Structural changes — require code quality review.

- Reference [`references/typescript.md`](typescript.md) when working in TypeScript projects.
