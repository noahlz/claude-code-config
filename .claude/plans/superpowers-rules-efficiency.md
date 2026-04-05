# Superpowers Rules Efficiency Improvements

**Goal:** Apply five efficiency improvements to `rules/superpowers.md` based on feedback from a subagent-driven development session.

**File to modify:** `rules/superpowers.md`

---

## Changes

### 1. TS LSP restart — generalize trigger

**Current (line 48):**
> After broad renames across many files in TypeScript projects, restart the TS language server to prevent stale LSP diagnostics.

**Change to:**
> After any task that touches TypeScript files, restart the TS language server to prevent stale LSP diagnostics.

---

### 2. Skip both reviews for mechanical/wiring tasks

**Current `When to skip spec review` section:**
> Mechanical changes (find-replace renames, comment-only edits): verify with `grep`, skip spec review.

**Current `When to skip code quality review` section:**
> Small targeted fixes to existing functions: skip.

**Change:** Merge these into a single unified rule and extend the mechanical task definition:

Add a new section or rewrite both as:

> **Mechanical tasks — skip both spec review and code quality review:**
> Tasks that only connect existing pieces without introducing new logic: find-replace renames, comment-only edits, adding entries to a registry, wiring a component to an existing interface, updating imports after a rename. Verify with `grep` instead.
>
> **Logic changes — require spec review. Structural changes — require code quality review.**

---

### 3. Parallel subagents for independent tasks

**Add to SUBAGENT DISPATCH RULES:**

> ### Parallel dispatch
> When two or more tasks touch different files and share no state, dispatch their implementation subagents in parallel. Use isolated worktrees to prevent conflicts. Do not serialize independent work.

---

### 4. Combine small tasks

**Current batch size guidance:**
> - 2–4 steps per subagent is the sweet spot.
> - If a task has 5+ steps, split it across multiple subagents before dispatching.

**Add:**
> - If two adjacent tasks are logically related and total ≤4 steps combined, fold them into a single subagent dispatch.

---

### 5. Pre-read key files before dispatch

**Add to SUBAGENT DISPATCH RULES:**

> ### Pre-read before dispatch
> Before dispatching any subagent, read the files the task will touch. Include relevant excerpts — type signatures, function signatures, affected logic blocks — directly in the subagent prompt. Do not make subagents re-discover context the orchestrator already has.

---

## Verification

After editing `rules/superpowers.md`:
- Read the file top-to-bottom and confirm all five changes are present and consistent with surrounding text.
- No placeholder text remains.
- Run `./install.sh` if rules are symlinked (check `install.sh` to confirm).
