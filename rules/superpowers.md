# "Superpowers" Skill Rules

- Save design and plan docs to `.claude/plans/`, not `docs/`.
- Do NOT run `git` commands. The user commits manually.
- Do NOT enter plan execution mode automatically. Stop and ask — the user may want a separate session.

## Planning

- Do NOT write full implementation code in plans. Use pseudocode, type signatures, or brief illustrative snippets only.
- Define high-level steps: what code to write, what tasks to perform at each stage.

## Executing

- Use sub-agent-driven development.
- Delegate research, code writing and test running/fixing to Sonnet and Haiku sub-agents.
