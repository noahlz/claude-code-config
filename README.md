# claude-code-config

My [Claude Code](https://claude.ai/code) configuration, shared publicly for reference. Includes install script and tests suite.

[![Unit Tests](https://github.com/noahlz/claude-code-config/actions/workflows/test.yml/badge.svg)](https://github.com/noahlz/claude-code-config/actions/workflows/test.yml)

## Philosophy

**Keep `CLAUDE.md` minimal.** A short, focused set of behavioral rules [beats a sprawling prompt](https://arxiv.org/abs/2602.11988).

**Use hooks, not instructions.** Hard rules belong in hooks, not "reminders" to the LLM. Hooks are enforced mechanically. Instructions are mere suggestions that waste context (and tokens!).

**Audible notifications for long tasks.** Do you scroll the Internet while Claude is working? Have Claude `say` something when a long-running turn completes. Configurable with `CLAUDE_SAY_THRESHOLD`, default 120 seconds.

**Terse output style** Use flat and direct language. Avoid synchopatic filler phrases ("Great idea!", "You're absolutely right!"). Summarize edits concisely. Less noise, faster feedback.

## Hooks

Behaviors enforced by hooks:

- Hard block destructive commands such as `rm -rf` and `drop table users`
- Use the macOS `say` command at end of a long-running turn (default: 120 seconds)

## Installation 

### ⚠️ WARNING: DO NOT CLONE AND INSTALL THIS DIRECTLY ⚠️

**The install script halts if you are not me.** 

If you want to use it:

1. [Fork](https://github.com/noahlz/claude-code-config/fork) this repo
2. Review and customize `settings.hooks.json`, `CLAUDE-user.md`, and the hook scripts for your own setup
3. Edit `install.sh` to check for your own username instead of `noahlz`
4. Run `./install.sh` from your fork

*Running someone else's Claude Code config without reviewing it first is a bad idea — hooks run automatically and can have broad system access.*

### Prerequisites

- Node.js >= 18 (installation and test suite)
- macOS (for the `say` command)

### Installation Instructions

```bash
git clone https://github.com/noahlz/claude-code-config.git
cd claude-code-config
./install.sh
```

The script creates symlinks from `~/.claude/` into the repo. If a file already exists at a target path, it is backed up as `<filename>.bak` before being replaced. Running it again on already-linked files is safe — those are silently skipped.

## Testing

This project has executable code...so we need unit tests!

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

