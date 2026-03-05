# Testing

## Writing Tests

Test code should be DRY:
- Avoid redundant boilerplate
- Create reusable functions for setup, execution and assertions.
- Use table-driven tests if appropriate (single function, 10+ permutations)

## Test Execution

Run tests ONLY when executable source code was added/modified/removed, or the user requests it.

ALWAYS redirect output using quiet mode:
- `npm --silent test > test.log 2>&1`
- `mvn --quiet --log-file=target/build.log test 2>&1`

Read the log ONLY if exit code != 0.
