# Workflow

## Bash Commands

Before running: one sentence explaining purpose (unless a skill workflow says otherwise).
After running: say nothing on success (exit 0). Read logs only on failure (exit != 0).

## IDE Integration

Use IDE/LSP tools (getDiagnostics, goToDefinition, findReferences) before Search/Grep/Find.
Fall back to standard tools only if LSP returns no results.
