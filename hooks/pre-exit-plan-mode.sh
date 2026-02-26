#!/bin/bash
# Fires on PreToolUse for ExitPlanMode — i.e., when Claude is about to submit a plan for review.
# Immediately announces "Plan ready for review." via `say` so the user is notified
# even if they've stepped away. No elapsed-time threshold: presenting a plan is always
# worth announcing regardless of how long the planning phase took.

say "Plan ready for review." &

exit 0
