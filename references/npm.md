# npm

## ~/.npmrc Global Overrides

When debugging Node/npm failures – missing native binaries, confounding dependency errors, or packages failing to resolve – read `~/.npmrc` first.

| Setting | Impact |
|---------|--------|
| `ignore-scripts` | Blocks post-install scripts and native compilation (`node-gyp`). Fix: `npm install --ignore-scripts=false` or `npm rebuild`. |
| `min-release-age` | Prevents resolution of packages published within the configured window. |
