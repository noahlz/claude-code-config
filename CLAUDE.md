# Claude Code User Config

## Installation

Shell and Markdown files are symlinked into `~/.claude`. `settings.hooks.json` is merged into `settings.json` by `install.sh`.

## Testing

`npm --silent test > test.log 2>&1 && echo "✔ Tests passed." || echo "✘ TESTS FAILED"`

## Maintenance

After adding, removing, or renaming files in `hooks/`, `rules/`, `references/`, or `output-styles/`, remind user to run `./install.sh`.

