#!/bin/bash
# Fires a "Task failed." audio notification whenever a StopFailure event occurs.
# No threshold check — failures always notify.
# Notification method is configurable via CLAUDE_NOTIFICATION_METHOD (default: "say").

source "$(dirname "$0")/notify-lib.sh"

INPUT=$(cat)

notify "Task failed."

exit 0
