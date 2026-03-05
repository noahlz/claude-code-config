# Testing

## Writing Tests

Test code should be DRY:
- Avoid redundant boilerplate
- Have reusable functions and/or base classes/modules for setup, execution and assertions.
- Use table-driven tests if appropriate (example: single function, 6+ input/output permutations)

## Test Execution

Run tests ONLY when executable source code was added/modified/removed, or the user requests it.

ALWAYS redirect output using quiet mode:
- `npm --silent test > test.log 2>&1`
- `mvn --quiet --log-file=target/build.log test 2>&1`

Read the log ONLY if exit code != 0.
