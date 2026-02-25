#!/bin/bash
# Writes task type label based on subagent type.
# Called by SubagentStart hook with matchers for Plan and Explore.

INPUT=$(cat)
AGENT_TYPE=$(echo "$INPUT" | jq -r '.agent_type // empty')

case "$AGENT_TYPE" in
  Plan)    echo "Plan" > "$HOME/.claude/current-task" ;;
  Explore) echo "Exploration" > "$HOME/.claude/current-task" ;;
esac

exit 0
