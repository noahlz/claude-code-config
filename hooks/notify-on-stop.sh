#!/bin/bash
# Runs a notification if the turn took > CLAUDE_NOTIFICATION_THRESHOLD seconds (default: 120).
# Reads ~/.claude/current-task for a specific label; falls back to "Task complete."
# Notification method is configurable via CLAUDE_NOTIFICATION_METHOD (default: "say").

source "$(dirname "$0")/notify-lib.sh"

INPUT=$(cat)

# Avoid infinite loop
if [ "$(echo "$INPUT" | jq -r '.stop_hook_active')" = "true" ]; then
  exit 0
fi

SESSION=$(echo "$INPUT" | jq -r '.session_id')
START_FILE="/tmp/claude-turn-${SESSION}"

if [ -f "$START_FILE" ]; then
  START=$(cat "$START_FILE")
  NOW=$(date +%s)
  ELAPSED=$((NOW - START))
  rm -f "$START_FILE"

  THRESHOLD="${CLAUDE_NOTIFICATION_THRESHOLD:-120}"
  if [ "$ELAPSED" -gt "$THRESHOLD" ]; then
    TASK_FILE="$HOME/.claude/current-task"
    if [ -f "$TASK_FILE" ] && [ -s "$TASK_FILE" ]; then
      LABEL=$(cat "$TASK_FILE")
      rm -f "$TASK_FILE"
      if [ "$LABEL" = "Plan" ]; then
        notify "Plan ready for review."
      else
        notify "${LABEL} complete."
      fi
    else
      notify "Task complete."
    fi
  fi
fi

exit 0
