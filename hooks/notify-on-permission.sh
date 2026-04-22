#!/bin/bash
# Fires a visual OS notification when Claude Code needs permission
# (permission_prompt notification_type). Intended for console sessions where
# the user is in another terminal and would otherwise miss the prompt.
#
# Notification body priority:
#   1. Tool name from /tmp/claude-pending-tool-<session_id> written by the
#      companion record-pending-tool.sh PreToolUse hook (most reliable source)
#   2. Tool name parsed from .message ("Claude needs your permission to use X")
#   3. Tool name from the last assistant message in the transcript (covers
#      cases where the above two strategies fail)
#   4. Payload .message verbatim (includes empty → no notification)

source "$(dirname "$0")/notify-lib.sh"

INPUT=$(cat)
SESSION=$(echo "$INPUT" | jq -r '.session_id // ""')
MESSAGE=$(echo "$INPUT" | jq -r '.message // ""')
TRANSCRIPT=$(echo "$INPUT" | jq -r '.transcript_path // ""')

# Strategy 1: read tool name written by record-pending-tool.sh PreToolUse hook.
# PreToolUse fires just before the permission check, so this file is always current.
extract_tool_name_from_pending_file() {
  local session="$1"
  if [ -z "$session" ]; then return 1; fi
  local name
  name=$(cat "$HOME/.claude/tmp/pending-tool-$session" 2>/dev/null | tr -d '[:space:]')
  if [ -n "$name" ]; then echo "$name"; return 0; fi
  return 1
}

# Strategy 2: parse tool name from .message.
# Claude Code formats named-tool permissions as "Claude needs your permission to use <Name>".
extract_tool_name_from_message() {
  echo "$1" | sed -n 's/.*to use \([A-Za-z_][A-Za-z0-9_]*\).*/\1/p'
}

# Strategy 2: read the last assistant message's tool_use from the transcript.
# For deferred tools (e.g. AskUserQuestion) Claude Code sends a generic .message,
# but the assistant message with the tool_use is written to transcript just before
# the hook fires. ToolSearch is excluded — it is always a schema-load intermediary,
# never the tool actually needing permission.
extract_tool_name_from_transcript() {
  local transcript="$1"
  if [ -z "$transcript" ] || [ ! -f "$transcript" ]; then return 1; fi
  local name
  name=$(jq -rc 'select(.type=="assistant")' < "$transcript" 2>/dev/null \
    | tail -1 \
    | jq -r '.message.content[]? | select(.type=="tool_use") | .name' 2>/dev/null \
    | grep -v '^ToolSearch$' \
    | head -1)
  if [ -n "$name" ]; then echo "$name"; return 0; fi
  return 1
}

# Build notification body: "ToolName: detail" or just "ToolName".
# Detail is extracted for known tools (Bash command, file basename, etc.).
format_body() {
  local tool_name="$1"
  local transcript="$2"
  local detail=""

  if [ -n "$transcript" ] && [ -f "$transcript" ]; then
    local last_tool
    last_tool=$(jq -rc --arg name "$tool_name" \
      'select(.type=="assistant") | .message.content[]? | select(.type=="tool_use" and .name==$name)' \
      < "$transcript" 2>/dev/null | tail -1)

    if [ -n "$last_tool" ]; then
      case "$tool_name" in
        Bash)
          detail=$(echo "$last_tool" | jq -r '.input.command // ""') ;;
        Read|Write|Edit|NotebookEdit)
          local fp; fp=$(echo "$last_tool" | jq -r '.input.file_path // ""')
          detail=$(basename "$fp" 2>/dev/null) ;;
        Grep|Glob)
          detail=$(echo "$last_tool" | jq -r '.input.pattern // ""') ;;
        WebFetch)
          detail=$(echo "$last_tool" | jq -r '.input.url // ""') ;;
      esac
    fi
  fi

  # Truncate long detail — macOS notifications clip around 150 chars anyway
  if [ ${#detail} -gt 100 ]; then detail="${detail:0:97}..."; fi

  if [ -n "$detail" ]; then
    echo "$tool_name: $detail"
  else
    echo "$tool_name"
  fi
}

TOOL_NAME=$(extract_tool_name_from_pending_file "$SESSION")
if [ -z "$TOOL_NAME" ]; then
  TOOL_NAME=$(extract_tool_name_from_message "$MESSAGE")
fi
if [ -z "$TOOL_NAME" ]; then
  TOOL_NAME=$(extract_tool_name_from_transcript "$TRANSCRIPT")
fi

if [ -n "$TOOL_NAME" ]; then
  BODY=$(format_body "$TOOL_NAME" "$TRANSCRIPT")
else
  # Neither strategy could identify the tool — pass message through.
  # Empty message suppresses the notification (notify_visual no-ops on empty).
  BODY="$MESSAGE"
fi

notify_visual "$BODY"

exit 0
