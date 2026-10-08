# Subagent Development Rules

## Dispatch Rules

Include this block verbatim at the top of every subagent prompt:

> **Subagent constraints — follow these exactly:**
> - Read-only git (`status`, `diff`, `log`, `show`) is always fine. Inside a worktree you may `git add`/`git commit` to that worktree's branch; outside one, do not commit. Never `push`, `merge`, `rebase`, `reset --hard`, or `clean -fdx`, and never make the closing commit — the user does that.
> - Write tests alongside implementation code, not separately.

### Task Sizing

Sizing is the dispatcher's job, not the subagent's.

- `coder-haiku`: exactly one directive – one action, with its sites and check spelled out. It may span many files ("rename `foo` to `bar` in these 12 files, then grep for `foo`"). Two different actions are two directives: dispatch them separately or send the work to Sonnet.
- `coder-sonnet` / `coder-opus`: give a coherent task and let the model plan it. Split only when parts are independent enough to run in parallel or the task won't fit one context.

### Dispatch Prompt

State the objective, the exact files or sites, the expected output, and the check to run.

### Model Selection

- Haiku (`coder-haiku`): one zero-judgment directive – a rename, a mechanical migration, logic the prompt fully specifies. Never multi-step.
- Sonnet (`coder-sonnet`): well-specified tasks that still need some reading of surrounding code, such as writing tests.
- Opus (`coder-opus`): complex subagent tasks (refactoring, complex business logic).
- Never override to Fable for subagent coding work.

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
