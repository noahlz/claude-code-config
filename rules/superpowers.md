# Superpowers Rules

These rules govern task orchestration and subagent delegation.

## HARD CONSTRAINTS

1. **NEVER run `git commit`.** Only the user commits, manually.
2. **NEVER enter plan execution mode automatically.** Stop and ask first.
3. **NEVER write implementation code directly from the main chat.** Delegate ALL code writing, code review, and debugging to Sonnet/Haiku subagents.
4. **Save plans to `.claude/plans/`.** Not `docs/`.
5. **Plans contain pseudocode and type signatures only.** No full implementation code.

## SUBAGENT DISPATCH RULES

When dispatching any subagent, you MUST include the following block verbatim at the top of its prompt:

> **Subagent constraints — follow these exactly:**
> - Do NOT run `git commit`. The user commits manually.
> - Write tests alongside implementation code, not separately.
> - Cap your work at 3–4 discrete steps. If you received more, stop and report back.

### Batch size

- 2–4 steps per subagent is the sweet spot.
- If a task has 5+ steps, split it across multiple subagents before dispatching.

### Testing

- Each subagent writes code + tests together. Never batch tests into a final step.
- Exception: if the plan only touches documentation (markdown, comments, READMEs), skip testing entirely — no test steps in the plan, no test runs during execution.

## REVIEW RULES

### When to skip spec review
- Mechanical changes (find-replace renames, comment-only edits): verify with `grep`, skip spec review.
- All logic changes: require spec review.

### When to skip code quality review
- Small targeted fixes to existing functions: skip.
- Structural changes (new abstractions, data model changes): require code quality review.

### Test assertion changes
- When subagents modify existing test expectations, those changes MUST also be reviewed.
- Test-quality review covers both new tests and modified assertions.

## TS-SPECIFIC

After broad renames across many files in TypeScript projects, restart the TS language server to prevent stale LSP diagnostics.
