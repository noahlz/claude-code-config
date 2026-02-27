#!/bin/bash
# Fires on PreToolUse for ExitPlanMode — i.e., when Claude is about to submit a plan for review.
# Immediately sends a notification "Plan ready for review." so the user is notified
# even if they've stepped away. No elapsed-time threshold: presenting a plan is always
# worth announcing regardless of how long the planning phase took.

source "$(dirname "$0")/notify-lib.sh"

notify "Plan ready for review."

exit 0
