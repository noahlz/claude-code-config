#!/bin/bash
# Shared notification helper for Claude Code hooks.
# Source this file to get the notify() function.
#
# Environment variables:
#   CLAUDE_NOTIFICATION_METHOD - "say" (default) or "notification" (macOS osascript)
#   CLAUDE_SAY_VOICE           - macOS voice name (overrides ~/.claude/say-voice)
#   CLAUDE_PERMISSION_TERMINAL_BUNDLE
#                              - app bundle ID to activate when the notification
#                                is clicked (overrides ~/.claude/permission-terminal-bundle).
#                                Used for click-to-focus. Default: auto-detect from
#                                $TERM_PROGRAM. Set to "none" to disable.
#
# Config files:
#   ~/.claude/say-voice        - one line containing a macOS voice name (e.g. "Samantha")
#                                Set via the set-say-voice skill. CLAUDE_SAY_VOICE takes precedence.
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
#       - grouping (-group) — new notifications replace prior ones
#       - click-to-focus (-execute/-activate) — opens the originating pane/app
#     If missing, falls back to osascript `display notification`.
#     (Note: macOS 11+ restricts third-party tools from setting a custom icon;
#     the banner uses terminal-notifier's own icon. This is a platform limit.)

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

  # Resolve terminal bundle ID for click-to-focus:
  # env var > config file > auto-detect; "none" disables.
  # Auto-detect order:
  #   1. __CFBundleIdentifier  — set by macOS Launch Services for any process
  #      launched by a .app bundle; survives tmux (the most reliable signal).
  #   2. LC_TERMINAL           — iTerm2 sets this and it's preserved across tmux.
  #   3. TERM_PROGRAM          — inside tmux this is "tmux" itself, so we check last.
  local term_bundle="${CLAUDE_PERMISSION_TERMINAL_BUNDLE:-}"
  if [ -z "$term_bundle" ] && [ -f "$HOME/.claude/permission-terminal-bundle" ]; then
    term_bundle="$(cat "$HOME/.claude/permission-terminal-bundle" | tr -d '[:space:]')"
  fi
  if [ -z "$term_bundle" ] && [ -n "${__CFBundleIdentifier:-}" ]; then
    term_bundle="$__CFBundleIdentifier"
  fi
  if [ -z "$term_bundle" ]; then
    case "${LC_TERMINAL:-}" in
      iTerm2)             term_bundle="com.googlecode.iterm2" ;;
    esac
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
    # terminal-notifier's -sound depends on the tool's Notifications permission
    # allowing sound (often off by default). Play Ping directly via afplay so
    # sound is reliable regardless of per-app settings.
    if command -v afplay &>/dev/null && [ -f "/System/Library/Sounds/Ping.aiff" ]; then
      afplay /System/Library/Sounds/Ping.aiff &
    fi

    local args=(-title "Claude Code needs your attention" -message "$message" -group "claude-code-permission" -sound Ping)

    # Click-to-focus: activate the terminal app.
    # We don't use -execute to also select the tmux pane because macOS 11+
    # restricts terminal-notifier's -execute shell-command handler and it
    # often fires silently or not at all. -activate uses Apple's app-activation
    # path (reliable). Caveat: the user lands in whatever tmux pane was last
    # focused in the terminal, not necessarily Claude Code's pane.
    if [ -n "$term_bundle" ]; then
      args+=(-activate "$term_bundle")
    fi

    terminal-notifier "${args[@]}" &
    return 0
  fi

  if command -v osascript &>/dev/null; then
    osascript -e "display notification \"$message\" with title \"Claude Code needs your attention\" sound name \"Ping\"" &
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
