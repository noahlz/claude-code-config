# Testing

## Writing Tests

- Factor shared setup, execution, and assertion logic into helpers, fixtures, or base classes.
- Use table-driven / parameterized tests for 6+ input/output combinations of the same function.
- Each test asserts one behavior; name it after that behavior, not the method under test.
- No duplicated setup or assertions — if copying, extract.

## Test Execution

**Conditions:** Only run tests if:
- Executable source code was added, modified, or removed, OR
- The user explicitly requests it

**Command format:** Always redirect to log with quiet mode:
- `npm --silent test > test.log 2>&1`
- `mvn --quiet --log-file=target/build.log test 2>&1`

**Log inspection:** Read `test.log` only if exit code ≠ 0. Don't read on success.

**Speed requirement:** Tests must complete in 10–30 seconds (max 1 minute). Use `timeout`. If it fires, surface to user. If user confirms long-running tests, adjust accordingly.

## Test Debugging

**Temporary code:** When debugging test failures via experimental source code:
- Write temporary files to `tmp/` directory (relative to project root)
- Delete temporary files when done
