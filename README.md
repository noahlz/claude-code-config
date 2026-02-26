# claude-code-config

My [Claude Code](https://claude.ai/code) configuration, shared publicly for reference.

## Philosophy

**Keep `CLAUDE.md` minimal.** A short, focused set of behavioral rules beats a sprawling prompt.

**Use hooks over instructions.** Hard rules belong in hooks, not prose. Hooks are enforced mechanically. Instructions are mere suggestions that waste context (and tokens!).

**Terse output style** Output flat and direct language, don't use filler phrases ("Great idea!", "You're absolutely right!") and summarize edits concisely. Less noise, faster feedback.

**Audible notifications for long tasks.** Do you scroll the Internet while Claude is working? Have Claude use the macOS `say` command via a hook when long-running turns complete. Configurable with `CLAUDE_SAY_THRESHOLD`, default 90 seconds.

**Hard blocks on destructive commands.** A `PreToolUse` hook intercepts bash commands matching patterns like `rm -rf`, `git push --force`, `git reset --hard`, and others. Claude tells the user they have to run these commands themselves.

## Contents

- **`CLAUDE-user.md`** — Global behavioral instructions: test output rules, bash command narration, IDE tool preferences. Symlinked to `~/.claude/CLAUDE.md`.
- **`settings.hooks.json`** — Hook definitions only. Merged into `~/.claude/settings.json` at install time.
- **`install-settings.js`** — Node.js script that merges `settings.hooks.json` and sets `outputStyle: "terse"` into `~/.claude/settings.json`.
- **`output-styles/terse.md`** — Enforces direct, non-sycophantic output with concise post-edit summaries.
- **`hooks/`**
  - `block-bash-patterns.sh` — Blocks destructive shell commands before they run.
  - `record-start-time.sh` — Records turn start time and detects task type from prompt keywords (for `say` hook).
  - `set-task-type.sh` — Writes task label (Plan/Exploration) when a subagent starts (for `say` hook).
  - `say-on-stop.sh` — Speaks a completion notification for long-running turns using `say` command.

## Installation 

### ⚠️ WARNING: DO NOT CLONE AND INSTALL THIS DIRECTLY ⚠️

**The install script halts if you are not me.** If you want to use it:

1. [Fork](https://github.com/noahlz/claude-code-config/fork) this repo
2. Review and customize `settings.hooks.json`, `CLAUDE-user.md`, and the hook scripts for your own setup
3. Edit `install.sh` to check for your own username instead of `noahlz`
4. Run `./install.sh` from your fork

*Running someone else's Claude Code config without reviewing it first is a bad idea — hooks run automatically and can have broad system access.*

### Prerequisites

- macOS (uses `say` for audio notifications)
- Node.js >= 18


### Installation Instructions

```bash
git clone https://github.com/noahlz/claude-code-config.git
cd claude-code-config
./install.sh
```

The script creates symlinks from `~/.claude/` into the repo. If a file already exists at a target path, it is backed up as `<filename>.bak` before being replaced. Running it again on already-linked files is safe — those are silently skipped.

## Testing

This project has executable code, so we need unit tests!

- `npm test` - Test hook scripts
- `npm run test:integration` - Test hooks via `claude -p --model haiku`
- `npm run test:all`

**NOTE:** Integration tests require an Anthropic API key and use real tokens!

## Status Line

Uses [`@chongdashu/cc-statusline`](https://www.npmjs.com/package/@chongdashu/cc-statusline)

Install it separately — the generated `~/.claude/statusline.sh` is not included in this repo.

## Inspiration

I (with Claude) completely re-wrote my user-level `CLAUDE.md` after watching these two videos by [Matt Pocock](https://github.com/mattpocock):

"Never Run claude /init"  
[![Never Run claude /init](https://img.youtube.com/vi/9tmsq-Gvx6g/0.jpg)](https://www.youtube.com/watch?v=9tmsq-Gvx6g)

"How to actually force Claude Code to use the right CLI (don't use CLAUDE.md)"  
[![How to actually force Claude Code to use the right CLI (don't use CLAUDE.md)](https://img.youtube.com/vi/3CSi8QAoN-s/0.jpg)](https://www.youtube.com/watch?v=3CSi8QAoN-s&t=6s)

Check them out!

## License

[MIT License](./LICENSE)

