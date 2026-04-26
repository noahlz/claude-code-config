# Required Reading Before You Act

**STOP.** If your next action matches any trigger below, you MUST read the linked file BEFORE acting. Do not skip. Do not summarize from memory. Read the file.

| Before you... | You MUST read |
|---------------|---------------|
| Write or edit code | [`./references/coding.md`](./references/coding.md) |
| Write or fix tests | [`./references/testing.md`](./references/testing.md) |
| Touch a TypeScript project | [`./references/typescript.md`](./references/typescript.md) |
| Invoke a Superpowers skill | [`./references/superpowers.md`](./references/superpowers.md) |
| Dispatch a subagent | [`./references/subagent-development.md`](./references/subagent-development.md) |
| Run `npm install`/`npm build` or debug Node failures | [`./references/npm.md`](./references/npm.md) |

Skipping a required read is a failure mode, not a shortcut.

# Rules for Bash
- Wrap long-running commands in `timeout`. Scale duration to the command: lint ~30s, full build ~120s. Example: `timeout 120 npm run build`
