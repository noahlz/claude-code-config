#!/bin/bash
# Fires on PostToolUse for ExitPlanMode — i.e., after the user approves the plan and
# the current turn continues into implementation. Overwrites ~/.claude/current-task with
# "Implementation" so that say-on-stop.sh announces "Implementation complete." at turn end
# instead of the stale "Exploration" label written by the earlier Explore subagent.
#
# Note: PostToolUse fires even when the user rejects the plan. In that case Stop will
# still say "Implementation complete." — an acceptable tradeoff.

echo "Implementation" > "$HOME/.claude/current-task"

exit 0
