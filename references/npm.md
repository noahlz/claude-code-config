# npm

## ~/.npmrc Global Settings

| Setting | Value | Troubleshooting |
|---------|-------|-----------------|
| `ignore-scripts` | `true` | Blocks post-install scripts and native compilation (`node-gyp`). Fix: `npm install --ignore-scripts=false` or `npm rebuild`. |
| `min-release-age` | `7` | Packages published < 7 days ago won't resolve. Fails installs for very recent releases. |
