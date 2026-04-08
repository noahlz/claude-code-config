# Coding

## Use Sub-Agents to Execute Plans

For multi-task plans, use sub-agent driven development. Write code directly (sequential, Opus) only for ad-hoc user requests outside a plan.

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

## Tool Calls

**REQUIREMENT**: One sentence before each tool call: "Running X to Y" or "Editing Z to implement W."
- EXCEPTION: Follow skill narration instructions when executing a skill workflow.

## Summaries

**REQUIREMENT**: After edits, provide only a brief summary:
```
✅ Implementation complete
- Fixed authentication bug in login flow
- Added 2 new test cases
- All 47 tests passing
```
No detailed walk-throughs. No file inventories.
