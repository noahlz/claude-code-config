#!/bin/bash
# Blocks | tee and destructive commands hard (exit 2). Claude must ask user first.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

BLOCKED_PATTERNS=(
  '\|\s*tee\b'
  'rm -rf'
  'rm -fr'
  'git push --force'
  'git push -f '
  'git reset --hard'
  'git checkout -- \.'
  'git clean -f'
  'git branch -D'
  'drop table'
  'drop database'
)

for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qiE "$pattern"; then
    echo "Blocked: '$pattern' is a restricted pattern. I can't run this — you'll need to run it yourself in the terminal." >&2
    exit 2
  fi
done

exit 0