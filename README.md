# claude-code-config

My [Claude Code](https://claude.ai/code) configuration, shared publicly for reference. Includes install script and tests suite.

[![Unit Tests](https://github.com/noahlz/claude-code-config/actions/workflows/test.yml/badge.svg)](https://github.com/noahlz/claude-code-config/actions/workflows/test.yml)

## Philosophy

**Keep `CLAUDE.md` minimal** - a set of focused [rules](./rules) [beats a sprawling prompt](https://arxiv.org/abs/2602.11988).

**Use hooks, not prompt instructions.** Hard rules belong in hooks, not "reminders" to the LLM. Hooks are enforced mechanically. Instructions are mere suggestions that waste context (and tokens!).

**Cross-platform notifications for long tasks.** Get alerted when Claude finishes long-running work. Configurable and customizable — see [Notifications](#notifications).

**Terse output style** Use flat language, avoid synchopatic filler phrases ("Great idea!", "You're absolutely right!"). Summarize edits concisely. Less noise, direct feedback.

## Hooks

Behaviors enforced by hooks:

- Hard block destructive commands such as `rm -rf` and `drop table users`
- Send notifications at the end of long-running turns
- Fire OS notifications for permission prompts (macOS)

## Notifications

### Stop-notification (long-running turns)

When Claude finishes a turn, a notification fires if it took longer than `CLAUDE_NOTIFICATION_THRESHOLD` (default 120s). Set via `CLAUDE_NOTIFICATION_METHOD`:

- **macOS**: `say` (audio, default) – reads completion message aloud. Set to `notification` for visual popup via `osascript`. Disabled inside Claude Desktop.
- **Windows**: `BurntToast` PowerShell popup (if available); silently skipped otherwise.
- **Linux**: Silently skipped.

### Permission-prompt notifications (macOS)

The `notify-on-permission.sh` hook fires an immediate notification whenever Claude Code needs tool-use permission, naming the specific request (e.g., `Bash: /bin/rm /tmp/foo`). Audio is the `Ping.aiff` chime via `afplay`, bypassing per-app sound gating.

Install `terminal-notifier` (`brew install terminal-notifier`) for grouped alerts and click-to-focus the originating terminal; otherwise uses `osascript`. Override target app via `CLAUDE_PERMISSION_TERMINAL_BUNDLE` env var or `~/.claude/permission-terminal-bundle` file (set to `none` to disable; defaults to `$TERM_PROGRAM`). Click-to-focus is best-effort on macOS 11+ due to Apple's restrictions.

### Voice customization (macOS)

By default, stop-notifications use the system voice set in System Settings. To override, create `~/.claude/voice` with a voice name (e.g., `Fred`, `Victoria`), or use the `set-voice` CLI command to list available voices, pick randomly, or set a specific voice.

## Installation 

### ⚠️ WARNING⚠️  Do not clone and install this directly! 

**The install script halts if you are not me.** 

If you want to use it:

1. [Fork](https://github.com/noahlz/claude-code-config/fork) this repo
2. Review and customize `settings.hooks.json`, `CLAUDE-user.md`, and the hook scripts for your own setup
3. Edit `install.sh` to check for your own username instead of `noahlz`
4. Run `./install.sh` from your fork

*Running someone else's Claude Code config without reviewing it first is a bad idea — hooks run automatically and can have broad system access.*

### Prerequisites

- Node.js >= 18 (installation and test suite)
- macOS, Windows, or Linux (notifications are cross-platform)

### Installation Instructions

```bash
git clone https://github.com/noahlz/claude-code-config.git
cd claude-code-config
./install.sh
```

The script creates symlinks into your `~/.claude/` (Claude user home) into files in the repo. If a file already exists at a target path, it is backed up as `<filename>.bak` before being replaced. Running it again on already-linked files is safe — those are silently skipped.

## Testing

This project has executable code...so we need unit tests!

- `npm test` - Test hook scripts
- `npm run test:integration` - Test hooks via `claude -p --model haiku`
- `npm run test:all`

**NOTE:** Integration tests require an Anthropic API key and use real tokens!

## Inspiration

I (with Claude) completely re-wrote my user-level `CLAUDE.md` after watching these two videos by [Matt Pocock](https://github.com/mattpocock):

"Never Run claude /init"  
[![Never Run claude /init](https://img.youtube.com/vi/9tmsq-Gvx6g/0.jpg)](https://www.youtube.com/watch?v=9tmsq-Gvx6g)

"How to actually force Claude Code to use the right CLI (don't use CLAUDE.md)"  
[![How to actually force Claude Code to use the right CLI (don't use CLAUDE.md)](https://img.youtube.com/vi/3CSi8QAoN-s/0.jpg)](https://www.youtube.com/watch?v=3CSi8QAoN-s&t=6s)

Check them out!

## License

[MIT License](./LICENSE)

