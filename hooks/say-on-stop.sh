#!/bin/bash
# Runs `say` if the turn took > CLAUDE_SAY_THRESHOLD seconds (default: 120).
# Reads ~/.claude/current-task for a specific label; falls back to "Task complete."

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

  THRESHOLD="${CLAUDE_SAY_THRESHOLD:-120}"
  if [ "$ELAPSED" -gt "$THRESHOLD" ]; then
    TASK_FILE="$HOME/.claude/current-task"
    if [ -f "$TASK_FILE" ] && [ -s "$TASK_FILE" ]; then
      LABEL=$(cat "$TASK_FILE")
      rm -f "$TASK_FILE"
      if [ "$LABEL" = "Plan" ]; then
        say "Plan ready for review." &
      else
        say "${LABEL} complete." &
      fi
    else
      say "Task complete." &
    fi
  fi
fi

exit 0
