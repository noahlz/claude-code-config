# Superpowers Rules

These rules govern task orchestration and subagent delegation.

## HARD CONSTRAINTS

1. **NEVER** enter plan execution mode automatically. Stop and ask first.
2. **NEVER write plan implementation code directly from the main chat.** Use `model: sonnet` or `model: haiku` subagents – reserve `model: opus` for tasks requiring deep architectural understanding or complex debugging.
3. Save plans and specs to `.claude/plans/`. **NOT** to `docs/`.
4. **Only write pseudocode and type signatures in plans.** Not full implementation code.

- Reference [`references/subagent-development.md`](subagent-development.md) for subagent dispatch, review, worktree, and testing rules.
