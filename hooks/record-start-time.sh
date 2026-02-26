#!/bin/bash
# Records turn start time per session for the say-on-stop hook.
# Also detects implementation tasks and writes label to current-task.

INPUT=$(cat)
SESSION=$(echo "$INPUT" | jq -r '.session_id')
PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty')

date +%s > "/tmp/claude-turn-${SESSION}"

# Clear any label from a previous turn before setting a new one
rm -f "$HOME/.claude/current-task"

if echo "$PROMPT" | grep -qiE '\bimplement\b|\bproceed\b|\bgo ahead\b|\bexecute the plan\b'; then
  echo "Implementation" > "$HOME/.claude/current-task"
fi

exit 0
