# Superpowers Rules

These rules govern task orchestration and subagent delegation.

## HARD CONSTRAINTS

1. **NEVER** run `git commit`. Only the user commits, manually.
2. **NEVER** enter plan execution mode automatically. Stop and ask first.
3. **NEVER write plan implementation code directly from the main chat.** Use `model: sonnet` or `model: haiku` subagents – reserve `model: opus` for tasks requiring deep architectural understanding or complex debugging.
4. Save plans and specs to `.claude/plans/`. **NOT** to `docs/`.
5. **Only write pseudocode and type signatures in plans.** Not full implementation code.

- Reference [`references/subagent-development.md`](subagent-development.md) for subagent dispatch, review, worktree, and testing rules.
