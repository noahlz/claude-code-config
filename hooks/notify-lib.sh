#!/bin/bash
# Shared notification helper for Claude Code hooks.
# Source this file to get the notify() function.
#
# Environment variables:
#   CLAUDE_NOTIFICATION_METHOD - "say" (default) or "notification" (macOS osascript)

notify() {
  local message="$1"
  local METHOD="${CLAUDE_NOTIFICATION_METHOD:-say}"

  case "$(uname -s)" in
    Darwin)
      if [ "$METHOD" = "notification" ]; then
        osascript -e "display notification \"$message\" with title \"Claude Code\"" &
      else
        say "$message" &
      fi
      ;;
    CYGWIN*|MINGW*|MSYS*)
      if command -v powershell.exe &>/dev/null; then
        powershell.exe -Command \
          "if (Get-Module -ListAvailable -Name BurntToast) { \
             New-BurntToastNotification -Text 'Claude Code', '$message' \
           }" &
      fi
      ;;
    *)
      # Not macOS or Windows — do nothing
      ;;
  esac
}
