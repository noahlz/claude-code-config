# Global Claude Code Behavioral Rules

## Testing

### Writing Tests

Test code should be DRY:
- Avoid redundant boilerplate
- Create resusable functions for setup, execution and assertions.
- Use table-driven tests if appropriate (single function, 10+ permutations)

### Test Execution
Run tests ONLY when executable source code was added/modified/removed, or the user requests it.

ALWAYS redirect output using quiet mode:
- `npm --silent test > test.log 2>&1`
- `mvn --quiet --log-file=target/build.log test 2>&1`

Read the log ONLY if exit code != 0.

## Comments
DO add comments that:
- Explain non-obvious code: workarounds, tricky bug fixes, performance tradeoffs, deliberately non-idiomatic patterns
- Clarify dense code: regexes, complex transformations, long reduce/comprehension chains
- Standard doc blocks (JSDoc, JavaDoc, ScalaDoc, docstrings) are fine

Good example of non-obvious code that requires a comment:
```typescript
// Matches ISO 8601 durations: P[n]Y[n]M[n]DT[n]H[n]M[n]S (e.g. "P1Y2M3DT4H5M6S", "PT30S")
// The T separator is required only when time components are present.
const ISO_DURATION = /^P(?:\d+Y)?(?:\d+M)?(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+S)?)?$/;
```

But DO NOT add comments that merely restate the next line:
```typescript
// Log the sum
console.log(1 + 1)
```

## Bash Commands
Before running: one sentence explaining purpose (unless a skill workflow says otherwise).  
After running: say nothing on success (exit 0). Read logs only on failure (exit != 0).

## IDE Integration
Use IDE/LSP tools (getDiagnostics, goToDefinition, findReferences) before Search/Grep/Find.  
Fall back to standard tools only if LSP returns no results.

## "Superpowers" Skill Rules
Rules for using the "Superpowers" skill:
- Save design and plan docs to `.claude/plans/` in the project root.
- DO NOT run `git` commands when executing the "Superpowers" skill. The user commits manually.
- Pause before entering plan execution mode – The user may want to do it in a separate session.
