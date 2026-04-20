#!/bin/bash
# Fires a visual OS notification when Claude Code needs permission
# (permission_prompt notification_type). Intended for console sessions where
# the user is in another terminal and would otherwise miss the prompt.
#
# Notification body is enhanced with the specific tool request (command,
# file path, pattern) by parsing transcript_path for the latest tool_use.
# Falls back to the hook payload's .message field if parsing fails.

source "$(dirname "$0")/notify-lib.sh"

INPUT=$(cat)
MESSAGE=$(echo "$INPUT" | jq -r '.message // ""')
TRANSCRIPT=$(echo "$INPUT" | jq -r '.transcript_path // ""')

# Build a specific notification body from the latest tool_use in the transcript.
# Example outputs: "Bash: /bin/rm /tmp/foo", "Read: notify-lib.sh", "Grep: TODO".
format_tool_request() {
  local transcript="$1"
  if [ -z "$transcript" ] || [ ! -f "$transcript" ]; then
    return 1
  fi

  local last_tool
  last_tool=$(jq -rc 'select(.type=="assistant") | .message.content[]? | select(.type=="tool_use")' < "$transcript" 2>/dev/null | tail -1)
  if [ -z "$last_tool" ]; then
    return 1
  fi

  local name detail
  name=$(echo "$last_tool" | jq -r '.name // ""')

  case "$name" in
    Bash)
      detail=$(echo "$last_tool" | jq -r '.input.command // ""')
      ;;
    Read|Write|Edit|NotebookEdit)
      local fp
      fp=$(echo "$last_tool" | jq -r '.input.file_path // ""')
      detail=$(basename "$fp" 2>/dev/null)
      ;;
    Grep|Glob)
      detail=$(echo "$last_tool" | jq -r '.input.pattern // ""')
      ;;
    WebFetch)
      detail=$(echo "$last_tool" | jq -r '.input.url // ""')
      ;;
    *)
      detail=""
      ;;
  esac

  # Truncate long detail — macOS notifications clip around 150 chars anyway
  if [ ${#detail} -gt 100 ]; then
    detail="${detail:0:97}..."
  fi

  if [ -n "$detail" ]; then
    echo "$name: $detail"
  elif [ -n "$name" ]; then
    echo "$name"
  else
    return 1
  fi
}

BODY=$(format_tool_request "$TRANSCRIPT") || BODY="$MESSAGE"

notify_visual "$BODY"

exit 0
