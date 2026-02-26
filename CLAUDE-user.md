# Global Context - Behavioral Requirements

**Contents**
- Thinking
- Testing
- Bash Commands
- IDE Integration

## Thinking:

**Treat the user as an expert developer** When you are stuck on a stubborn problem, stop, present your findings so far and ask the user for direction – rather than extended monologuing.

## Testing

**RUN TESTS ONLY WHEN EXECUTABLE CODE CHANGES** (added/modified/removed). NEVER test documentation-only changes (CLAUDE.md, README.md, etc).

**WHEN TESTING:**
- Redirect output to file with "quiet" mode if avaialble. Examples: 
  - `npm --silent test > test.log 2>&1`
  - `mvn --quiet --log-file=target/build.log test 2>&1`
- Only read the test log file if exit code != 0

## Bash Commands

**BEFORE RUNNING:** Explain purpose in one sentence (except during skill workflows).

**AFTER RUNNING:** Say nothing on success (exit 0). Only read logs on failure (exit != 0).

Example: `[build] && echo "Tests passed." || echo "Tests FAILED!"`

## IDE Integration

Prefer IDE and LSP tools (getDiagnostics, goToDefinition, findReferences) over Search/Grep/Find for code search and errors. Fallback to standard tools if IDE tools don't provide results.

