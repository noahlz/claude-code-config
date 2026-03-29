#!/bin/bash
# Blocks destructive rm commands hard (exit 2). Claude must ask user first.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

BLOCKED_PATTERNS=(
  'rm -rf'
  'rm -fr'
)

for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qiE "$pattern"; then
    echo "Blocked: '$pattern' is a restricted pattern. I can't run this — you'll need to run it yourself in the terminal." >&2
    exit 2
  fi
done

exit 0
