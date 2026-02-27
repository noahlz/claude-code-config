# Global Context - Behavioral Requirements

**Contents**
- Test Execution
- Bash Commands
- IDE Integration
- Agent Team Workflows

## Test Execution 

**MANDATORY: FOLLOW THESE RULES FOR EVERY PROJECT**:

- **ONLY** Run tests after you added/modified/removed executable source code (or the user requested it). 
- **NEVER** test documentation-only changes (CLAUDE.md, README.md, etc).
- **ALWAYS** Redirect output to file with "quiet" mode if available. Examples: 
  - `npm --silent test > test.log 2>&1`
  - `mvn --quiet --log-file=target/build.log test 2>&1`
- After running tests, **ONLY** read the test log file if exit code != 0

## Bash Commands

**BEFORE RUNNING:** Explain purpose in one sentence (unless the user or skill workflow requested silence)

**AFTER RUNNING:** Say nothing on success (exit 0). Only read logs on failure (exit != 0).

Example: `[build] && echo "Tests passed." || echo "Tests FAILED!"`

## IDE Integration

Prefer IDE and LSP tools (getDiagnostics, goToDefinition, findReferences) over Search/Grep/Find for code search and errors. Fallback to standard tools if IDE tools don't provide results.

## Specialist Agent Workflows

**Spawn agents for:**
- React apps: Major refactoring (3+ files, significant logic changes) → use `react-code-reviewer`
- React apps: New major features → use `react-code-reviewer` + `test-quality-reviewer`
- General: Test suite improvements (3+ test files) → use `test-quality-reviewer`
- General: Code clarity/cleanup → use `code-simplifier`

**Launch pattern:** Spawn multiple agents in parallel with `run_in_background: true`. Check results when all complete.

**Skip agents for:** trivial changes, already-verified work (lint/types/tests passing), research tasks.
