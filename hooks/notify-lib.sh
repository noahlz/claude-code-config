#!/bin/bash
# Shared notification helper for Claude Code hooks.
# Source this file to get the notify() function.
#
# Environment variables:
#   CLAUDE_NOTIFICATION_METHOD - "say" (default) or "notification" (macOS osascript)
#   CLAUDE_SAY_VOICE           - macOS voice name (overrides ~/.claude/say-voice)
#   CLAUDE_PERMISSION_SENDER   - app bundle ID used as the notification sender
#                                (overrides ~/.claude/permission-sender). Only
#                                takes effect when terminal-notifier is installed.
#   CLAUDE_PERMISSION_TERMINAL_BUNDLE
#                              - app bundle ID to activate when the notification
#                                is clicked (overrides ~/.claude/permission-terminal-bundle).
#                                Used for click-to-focus. Default: auto-detect from
#                                $TERM_PROGRAM. Set to "none" to disable.
#
# Config files:
#   ~/.claude/say-voice        - one line containing a macOS voice name (e.g. "Samantha")
#                                Set via the set-say-voice skill. CLAUDE_SAY_VOICE takes precedence.
#   ~/.claude/permission-sender - one line containing an app bundle ID for the
#                                notification's sender (e.g. "com.anthropic.claudefordesktop").
#                                Only used when terminal-notifier is installed.
#                                Default: com.anthropic.claudefordesktop if /Applications/Claude.app
#                                exists, else no override. Use "none" to skip.
#
# Audio for permission notifications (notify_visual):
#   Plays /System/Library/Sounds/Ping.aiff — a classic short notification tone.
#   macOS doesn't expose a global "notification sound" preference, and the
#   Sonoma+ alert sounds (Boop, Breeze, etc.) aren't addressable by name via
#   the programmatic notification APIs, so we hardcode Ping for predictability.
#   No customization exposed; edit this file or set the system-wide sound to
#   mute at the macOS level if you want it silenced.
#
# Optional dependency:
#   terminal-notifier (brew install terminal-notifier)
#     When installed, notify_visual uses it for better permission-prompt UX:
#       - custom app identity (-sender) — shows Claude icon + name
#       - grouping (-group) — new notifications replace prior ones
#     If missing, falls back to osascript `display notification`.

notify() {
  local message="$1"
  local METHOD="${CLAUDE_NOTIFICATION_METHOD:-say}"

  # Auto-disable audio when running inside Claude Desktop
  if [ "$CLAUDE_CODE_ENTRYPOINT" = "desktop" ]; then
    return 0
  fi

  if [ "$METHOD" = "notification" ] && command -v osascript &>/dev/null; then
    osascript -e "display notification \"$message\" with title \"Claude Code\"" &
  elif [ "$METHOD" = "say" ] && command -v say &>/dev/null; then
    # Resolve voice: env var > config file > system default
    local voice="${CLAUDE_SAY_VOICE:-}"
    if [ -z "$voice" ] && [ -f "$HOME/.claude/say-voice" ]; then
      voice="$(cat "$HOME/.claude/say-voice" | tr -d '[:space:]')"
    fi
    # "none" disables audio notifications (set via /set-voice none)
    if [ "$voice" = "none" ]; then
      return 0
    elif [ -n "$voice" ]; then
      say -v "$voice" "$message" &
    else
      say "$message" &
    fi
  elif command -v powershell.exe &>/dev/null; then
    powershell.exe -Command \
      "if (Get-Module -ListAvailable -Name BurntToast) { \
         New-BurntToastNotification -Text 'Claude Code', '$message' \
       }" &
  fi
}

# Visual-only notification. Ignores CLAUDE_NOTIFICATION_METHOD — never plays audio.
# Used for permission-prompt alerts where audio would be disruptive.
notify_visual() {
  local message="$1"

  # Suppress inside Claude Desktop (it has its own permission UI)
  if [ "$CLAUDE_CODE_ENTRYPOINT" = "desktop" ]; then
    return 0
  fi

  # No-op on empty payload
  if [ -z "$message" ]; then
    return 0
  fi

  # Resolve sender bundle ID: env > config > Claude.app if installed; "none" disables.
  local sender="${CLAUDE_PERMISSION_SENDER:-}"
  if [ -z "$sender" ] && [ -f "$HOME/.claude/permission-sender" ]; then
    sender="$(cat "$HOME/.claude/permission-sender" | tr -d '[:space:]')"
  fi
  if [ -z "$sender" ] && [ -d "/Applications/Claude.app" ]; then
    sender="com.anthropic.claudefordesktop"
  fi

  # Resolve terminal bundle ID for click-to-focus:
  # env var > config file > auto-detect from $TERM_PROGRAM; "none" disables.
  local term_bundle="${CLAUDE_PERMISSION_TERMINAL_BUNDLE:-}"
  if [ -z "$term_bundle" ] && [ -f "$HOME/.claude/permission-terminal-bundle" ]; then
    term_bundle="$(cat "$HOME/.claude/permission-terminal-bundle" | tr -d '[:space:]')"
  fi
  if [ -z "$term_bundle" ]; then
    case "${TERM_PROGRAM:-}" in
      Apple_Terminal)     term_bundle="com.apple.Terminal" ;;
      iTerm.app)          term_bundle="com.googlecode.iterm2" ;;
      ghostty|Ghostty)    term_bundle="com.mitchellh.ghostty" ;;
      kitty|Kitty)        term_bundle="net.kovidgoyal.kitty" ;;
      WarpTerminal|Warp)  term_bundle="dev.warp.Warp-Stable" ;;
      WezTerm)            term_bundle="com.github.wez.wezterm" ;;
    esac
  fi
  if [ "$term_bundle" = "none" ]; then
    term_bundle=""
  fi

  if command -v terminal-notifier &>/dev/null; then
    local args=(-title "Claude Code" -message "$message" -group "claude-code-permission" -sound Ping)
    if [ -n "$sender" ] && [ "$sender" != "none" ]; then
      args+=(-sender "$sender")
    fi

    # Click-to-focus:
    # - Inside tmux → -execute: switch to the pane that fired, then activate the terminal app
    # - Otherwise   → -activate: just bring the terminal app to the foreground
    if [ -n "$TMUX_PANE" ] && command -v tmux &>/dev/null; then
      local focus_cmd="tmux select-window -t '$TMUX_PANE' 2>/dev/null; tmux select-pane -t '$TMUX_PANE' 2>/dev/null"
      if [ -n "$term_bundle" ]; then
        focus_cmd="$focus_cmd; osascript -e 'tell application id \"$term_bundle\" to activate' 2>/dev/null"
      fi
      args+=(-execute "$focus_cmd")
    elif [ -n "$term_bundle" ]; then
      args+=(-activate "$term_bundle")
    fi

    terminal-notifier "${args[@]}" &
    return 0
  fi

  if command -v osascript &>/dev/null; then
    osascript -e "display notification \"$message\" with title \"Claude Code\" sound name \"Ping\"" &
    # osascript's sound clause depends on Script Editor's notification-sound
    # setting; play via afplay too so the sound is reliable.
    if command -v afplay &>/dev/null && [ -f "/System/Library/Sounds/Ping.aiff" ]; then
      afplay /System/Library/Sounds/Ping.aiff &
    fi
    return 0
  fi

  if command -v powershell.exe &>/dev/null; then
    powershell.exe -Command \
      "if (Get-Module -ListAvailable -Name BurntToast) { \
         New-BurntToastNotification -Text 'Claude Code', '$message' \
       }" &
  fi
}
