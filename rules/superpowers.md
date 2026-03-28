# "Superpowers" Skill Rules

Rules for using the "Superpowers" skill:
- Save design and plan docs to the project `.claude/plans/` directory instead of `docs/`
- DO NOT run `git` commands when executing the "Superpowers" skill. The user commits manually.
- Pause before entering plan execution mode - the user may want to do it in a separate session.
- When planning:
  - DO NOT generate and write code to the implementation and execution plans.
  - Instead, define the higher level plan steps – what code should be written / tasks performed at each stage.
- When executing:
  - Use Agent-Driven development, 
  - Delegate to Sonnet and Haiku agents for writing code and running/fixing tests.
