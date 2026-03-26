# Testing

## Writing Tests

Write DRY test code:
- Avoid redundant boilerplate
- Have reusable functions and/or base classes/modules for setup, execution and assertions.
- Use table-driven tests if appropriate (example: single function, 6+ input/output permutations)

## Test Execution

ONLY run tests when executable source code was added/modified/removed, or the user requests it.

ALWAYS redirect output using quiet mode:
- `npm --silent test > test.log 2>&1`
- `mvn --quiet --log-file=target/build.log test 2>&1`

Read the log ONLY if exit code != 0.

**Tests should be fast!**
- Test execution should complete within 10 - 30 seconds, 1 minute max.
- Always use a `timeout` to execute Bash shells for test execution.
- If the test execution fails to timeout, surface to the user for next steps.
- Users confirm known long-running tests. Adjust timeouts accordingly.

