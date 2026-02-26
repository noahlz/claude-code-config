#!/bin/bash
# Writes task type label based on subagent type.
# Called by SubagentStart hook with matchers for Plan and Explore.

INPUT=$(cat)
AGENT_TYPE=$(echo "$INPUT" | jq -r '.agent_type // empty')

TASK_FILE="$HOME/.claude/current-task"

case "$AGENT_TYPE" in
  Plan)
    # Plan always takes priority
    echo "Plan" > "$TASK_FILE"
    ;;
  Explore)
    # Explore only sets label if nothing else has claimed it this turn
    if [ ! -s "$TASK_FILE" ]; then
      echo "Exploration" > "$TASK_FILE"
    fi
    ;;
esac

exit 0
