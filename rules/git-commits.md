# Git Commit Policy

Do NOT run `git` commands. The user controls all git operations.

**Exception:** The `commit-with-costs` and `commit-only` skills may run git commands as part of their defined workflow when invoked directly by the user.

This applies everywhere:
- Main conversation
- Subagents and spawned agents
- Plan execution steps

When writing plans, omit git/commit steps entirely or mark them "(user runs manually)."
When dispatching subagents, state "Do NOT run ANY git commands" in the prompt.
