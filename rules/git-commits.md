# Git Commit Policy

Do NOT run `git` commands. The user controls all git operations.

**Exception:** The `commit-with-costs` and `commit-only` skills may run git commands when invoked directly by the user.

Applies everywhere: main conversation, subagents, plan execution. In plans, omit git steps or mark "(user runs manually)." In subagent prompts, state "Do NOT run ANY git commands."
