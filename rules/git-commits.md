# Git Commit Policy

**The user owns what lands.** The final commit and the push are theirs, always, and they make them with the `commit-with-costs` skill so session cost metrics reach the commit trailers.

## What agents may do

- **Read-only git is unrestricted** — `status`, `diff`, `log`, `show`, `rev-parse`, `merge-base` — in the main conversation and in subagents.
- **Inside a git worktree, agents may commit.** Both the orchestrator and subagents may commit work in progress to the worktree's own branch. Commit at the checkpoints a plan marks; those messages are where drift evidence, before/after counts, and deliberate corrections get recorded.
- Outside a worktree, commit only at plan-marked checkpoints, and only on a branch that is not the user's landing branch.

## What agents never do

- `git push`, in any form.
- The final commit that closes a session's work. Stop when the branch is ready and hand it to the user.
- `merge`, `rebase`, branch deletion, `reset --hard`, `clean -fdx`, or anything else that leaves the working tree or rewrites shared history — unless the user asks for it by name.
- Commit directly to `main`/`master` without the user's explicit say-so.

## In plans and prompts

Mark commit points explicitly; unmarked steps do not commit. In subagent prompts, say whether the subagent commits — inside a worktree it may, and its commits belong to that worktree's branch.
