# claude-code-config

My [Claude Code](https://claude.ai/code) configuration, shared publicly for reference. Includes install script and tests suite.

[![Unit Tests](https://github.com/noahlz/claude-code-config/actions/workflows/test.yml/badge.svg)](https://github.com/noahlz/claude-code-config/actions/workflows/test.yml)

## Philosophy

**Keep `CLAUDE.md` minimal** - a set of focused [rules](./rules) [beats a sprawling prompt](https://arxiv.org/abs/2602.11988).

**Use hooks, not prompt instructions.** Hard rules belong in hooks, not "reminders" to the LLM. Hooks are enforced mechanically. Instructions are mere suggestions that waste context (and tokens!).

**Cross-platform notifications for long tasks.** Do you scroll the Internet while Claude is working? Have Claude send a notification when a long-running turn completes. Configurable with `CLAUDE_NOTIFICATION_THRESHOLD` (default 120 seconds) and `CLAUDE_NOTIFICATION_METHOD` (default `say`; use `notification` for visual popups).

**Terse output style** Use flat language, avoid synchopatic filler phrases ("Great idea!", "You're absolutely right!"). Summarize edits concisely. Less noise, direct feedback.

## Hooks

Behaviors enforced by hooks:

- Hard block destructive commands such as `rm -rf` and `drop table users`
- Send notifications at the end of long-running turns (default: 120 seconds)
  - macOS: uses `say` (audio) by default; set `CLAUDE_NOTIFICATION_METHOD=notification` for visual popups via `osascript`
  - Windows: uses PowerShell `BurntToast` if available; silently skipped otherwise
  - Linux: silently skipped (no built-in notification tool assumed)
  - **Claude Desktop**: audio notifications are automatically disabled when running inside Claude Desktop
- Fire an OS notification when Claude Code is waiting on a permission prompt (macOS), so you notice even if you've switched to another terminal

### Permission-prompt notifications (macOS)

The `notify-on-permission.sh` hook fires a visual notification whenever Claude Code needs tool-use permission. The body names the specific request (e.g., `Bash: /bin/rm /tmp/foo`, `Read: notify-lib.sh`) parsed from the session transcript.

**Optional dependency — `terminal-notifier`** (`brew install terminal-notifier`): enables the Claude icon, grouped alerts that replace prior ones, and click-to-focus the originating tmux pane; otherwise the hook falls back to `osascript`. `install.sh` prints a one-line suggestion if it's missing — no auto-install.

Audio is the classic macOS `Ping` chime (`/System/Library/Sounds/Ping.aiff`) — a short, notification-y tone. Hardcoded because macOS exposes no global "notification sound" preference and the new Sonoma+ alert sounds aren't addressable by name. Two optional overrides:

| Env var / config file                                                       | Purpose                                                    | Default |
|-----------------------------------------------------------------------------|------------------------------------------------------------|---------|
| `CLAUDE_PERMISSION_SENDER` / `~/.claude/permission-sender`                  | Bundle ID used as the notification's sender. `none` to skip. | `com.anthropic.claudefordesktop` if Claude Desktop installed |
| `CLAUDE_PERMISSION_TERMINAL_BUNDLE` / `~/.claude/permission-terminal-bundle` | Bundle ID to activate on click. `none` to disable.         | auto-detected from `$TERM_PROGRAM` |

Inside `tmux`, clicking the notification switches to the originating pane (via `$TMUX_PANE`) and activates the terminal app.

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

