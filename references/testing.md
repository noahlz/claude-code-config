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

**Speed requirement:** Test execution must complete in 10–30 seconds (max 1 minute).
- **Do:** Use `timeout` when running test commands in Bash.
- **If timeout fires:** Surface to user and await their next steps.
- **If user confirms long-running tests:** Adjust timeout accordingly and document.

## Test Debugging

**Temporary code:** When debugging test failures via experimental source code:
- Write temporary files to `tmp/` directory (relative to project root)
- Delete temporary files when done
