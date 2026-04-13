# Superpowers Rules

## HARD CONSTRAINTS

1. **NEVER** enter plan execution mode automatically. Stop and ask first.
2. **NEVER write code from the main chat during plan execution** — initial implementation, review-loop fixes, or "quick" fixes. Dispatch `model: sonnet` or `model: haiku`. Reserve `model: opus` for architectural or complex debugging tasks. **Exception:** ad-hoc user code requests outside plan execution.
3. **Bundle all review fixes into a single subagent dispatch** with all issues listed. Never fix some issues manually and farm out the rest.
4. Save plans and specs to `.claude/plans/`. **NOT** to `docs/`.
5. **Only write pseudocode and type signatures in plans.** Not full implementation code.

## JUDGMENT CALLS

- **Combine spec + quality review into one pass** for small modules (under ~400 lines, 3 or fewer files).

- Reference [`references/subagent-development.md`](subagent-development.md) for subagent dispatch, review, worktree, and testing rules.
