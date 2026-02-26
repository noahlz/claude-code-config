# Claude Code User Config

Personal Claude Code config repo.

## Installation

Merged into the user's `~/.claude` directory by the `install.sh` script. 

Shell and Markdown files are symlinked. `settings.hooks.json` is merged into the user's `settings.json`

## Testing

To run unit tests: `npm --quiet test > test.log 2&>1 && echo "✔ Tests passed." || echo "✘ TESTS FAILED"`

If tests failed, examine `test.log` for details.

## References

[Claude Code Hooks documentation](https://code.claude.com/docs/en/hooks)

