# claude-code-config

My [Claude Code](https://claude.ai/code) configuration, shared publicly for reference.

## Philosophy

**Keep `CLAUDE.md` minimal.** A short, focused set of behavioral rules beats a sprawling prompt. The goal is a few sharp constraints that actually change behavior, not an exhaustive wishlist.

**Use hooks over instructions.** Things Claude reliably forgets — or needs to be reminded of at runtime — belong in hooks, not prose. Hooks are enforced mechanically; instructions are suggestions.

**Terse, non-sycophantic output.** The `terse` output style strips filler phrases ("Great idea!", "You're absolutely right!") and enforces concise summaries after edits. Less noise, faster feedback.

**Audible notifications for long tasks.** The `say-on-stop` hook calls macOS `say` when a turn exceeds ~90 seconds, so you can walk away and get called back when Claude is done. Task labels (Plan, Exploration, Implementation) are detected automatically and spoken aloud.

**Hard blocks on destructive commands.** A `PreToolUse` hook intercepts bash commands matching patterns like `rm -rf`, `git push --force`, `git reset --hard`, and others. Claude is forced to ask the user rather than running them directly.

## Contents

- **`CLAUDE.md`** — Global behavioral instructions: testing rules, bash command narration, IDE tool preferences.
- **`settings.json`** — Model, status line, environment variables, enabled plugins, and hook wiring.
- **`hooks/`**
  - `block-bash-patterns.sh` — Blocks destructive shell commands before they run.
  - `record-start-time.sh` — Records turn start time and detects task type from prompt keywords.
  - `set-task-type.sh` — Writes task label (Plan/Exploration) when a subagent starts.
  - `say-on-stop.sh` — Speaks a completion notification for long-running turns.
- **`output-styles/terse.md`** — Enforces direct, non-sycophantic output with concise post-edit summaries.

## ⚠️ WARNING: DO NOT CLONE AND INSTALL THIS DIRECTLY ⚠️

**The install script halt if you are not me.** Instead:

1. [Fork](https://github.com/noahlz/claude-code-config/fork) this repo
2. Review and customize `settings.json`, `CLAUDE.md`, and the hook scripts for your own setup
3. Edit `install.sh` to check for your own username instead of `noahlz`
4. Run `./install.sh` from your fork

*Running someone else's Claude Code config without reviewing it first is a bad idea — hooks run automatically and can have broad system access.*

## Installation

```bash
git clone https://github.com/noahlz/claude-code-config.git
cd claude-code-config
./install.sh
```

The script creates symlinks from `~/.claude/` into the repo. If a file already exists at a target path, it is backed up as `<filename>.bak` before being replaced. Running it again on already-linked files is safe — those are silently skipped.

## Status Line

Uses [`@chongdashu/cc-statusline`](https://www.npmjs.com/package/@chongdashu/cc-statusline). Install it separately — the generated `~/.claude/statusline.sh` is not included in this repo.

## Inspiration

Claude and I completely re-wrote my global `CLAUDE.md` after watching these two videos by [Matt Pocock](https://github.com/mattpocock):

[![Never Run claude /init](https://img.youtube.com/vi/9tmsq-Gvx6g/0.jpg)](https://www.youtube.com/watch?v=9tmsq-Gvx6g)

[![How to actually force Claude Code to use the right CLI (don't use CLAUDE.md)](https://img.youtube.com/vi/3CSi8QAoN-s/0.jpg)](https://www.youtube.com/watch?v=3CSi8QAoN-s&t=6s)

## License

[MIT LICENSE](./LICENSE)

