#!/bin/bash
# Shared notification helper for Claude Code hooks.
# Source this file to get the notify() function.
#
# Environment variables:
#   CLAUDE_NOTIFICATION_METHOD - "say" (default) or "notification" (macOS osascript)

notify() {
  local message="$1"
  local METHOD="${CLAUDE_NOTIFICATION_METHOD:-say}"

  if [ "$METHOD" = "notification" ] && command -v osascript &>/dev/null; then
    osascript -e "display notification \"$message\" with title \"Claude Code\"" &
  elif [ "$METHOD" = "say" ] && command -v say &>/dev/null; then
    say "$message" &
  elif command -v powershell.exe &>/dev/null; then
    powershell.exe -Command \
      "if (Get-Module -ListAvailable -Name BurntToast) { \
         New-BurntToastNotification -Text 'Claude Code', '$message' \
       }" &
  fi
}
