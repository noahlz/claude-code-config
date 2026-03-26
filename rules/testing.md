# Testing

## Writing Tests

**Do:**
- Extract common setup/execution/assertion logic into reusable functions, base classes, or modules
- Use table-driven tests for 6+ input/output permutations of a single function
- Eliminate redundant boilerplate

**Don't:**
- Write DRY-violating test code with repeated setup/assertion patterns

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
