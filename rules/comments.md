# Comments

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
