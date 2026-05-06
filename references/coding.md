# Coding

## Use Sub-Agents to Execute Plans

For multi-task plans, use sub-agent driven development. Write code directly (sequential, Opus) only for ad-hoc user requests outside a plan.

## Comments

DO add comments that:
- Explain non-obvious code: workarounds, tricky bug fixes, performance tradeoffs, deliberately non-idiomatic patterns
- Clarify dense code: regexes, complex transformations, long reduce/comprehension chains
- Standard doc blocks (JSDoc, JavaDoc, ScalaDoc, docstrings) are fine

DO NOT add comments that merely restate the next line.

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

After edits: brief summary only — what changed and test count if applicable. No walk-throughs, no file inventories.
