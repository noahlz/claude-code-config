#!/bin/bash
# PreToolUse hook: records the pending tool name to a temp file keyed by session_id.
# The Notification hook reads this file to show which tool needs permission,
# because the Notification payload does not include the tool name for all tools
# (e.g. AskUserQuestion receives only a generic "Claude Code needs your attention").
#
# File: ~/.claude/tmp/pending-tool-<session_id>

PENDING_DIR="$HOME/.claude/tmp"
mkdir -p "$PENDING_DIR"

INPUT=$(cat)
SESSION=$(echo "$INPUT" | jq -r '.session_id // ""')
TOOL=$(echo "$INPUT" | jq -r '.tool_name // ""')

if [ -n "$SESSION" ] && [ -n "$TOOL" ]; then
  echo "$TOOL" > "$PENDING_DIR/pending-tool-$SESSION"
fi
