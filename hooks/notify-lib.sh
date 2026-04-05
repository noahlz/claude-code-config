#!/bin/bash
# Shared notification helper for Claude Code hooks.
# Source this file to get the notify() function.
#
# Environment variables:
#   CLAUDE_NOTIFICATION_METHOD - "say" (default) or "notification" (macOS osascript)
#   CLAUDE_SAY_VOICE           - macOS voice name (overrides ~/.claude/say-voice)
#
# Voice config file:
#   ~/.claude/say-voice        - one line containing a macOS voice name (e.g. "Samantha")
#                                Set via the set-say-voice skill. CLAUDE_SAY_VOICE takes precedence.

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
