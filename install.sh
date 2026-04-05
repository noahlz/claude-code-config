#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"

if [ "$(whoami)" != "noahlz" ]; then
  echo ""
  echo "  ERROR: This install script is for noahlz only."
  echo ""
  echo "  This is a personal configuration repo. Do not run it as-is."
  echo "  Fork the repo, customize it for your setup, then update this"
  echo "  username check before running."
  echo ""
  echo "  See README.md for instructions."
  echo ""
  exit 1
fi

link() {
  local src="$REPO_DIR/$1"
  local dst="$CLAUDE_DIR/${2:-$1}"
  local dst_dir
  dst_dir="$(dirname "$dst")"

  mkdir -p "$dst_dir"

  if [ -L "$dst" ]; then
    if [ "$(readlink "$dst")" = "$src" ]; then
      echo "  skip    ${2:-$1} (already linked)"
    else
      echo "  relink  ${2:-$1} (was pointing elsewhere)"
      ln -sf "$src" "$dst"
    fi
  elif [ -e "$dst" ]; then
    echo "  backup  ${2:-$1} -> ${2:-$1}.bak"
    mv "$dst" "$dst.bak"
    ln -s "$src" "$dst"
  else
    echo "  link    $1 -> ${2:-$1}"
    ln -s "$src" "$dst"
  fi
}

echo "Installing claude-code-config to $CLAUDE_DIR"
echo ""

link CLAUDE-user.md CLAUDE.md

for f in "$REPO_DIR"/hooks/*.sh; do
  link "hooks/$(basename "$f")"
done

for f in "$REPO_DIR"/rules/*.md; do
  link "rules/$(basename "$f")"
done

for f in "$REPO_DIR"/output-styles/*.md; do
  link "output-styles/$(basename "$f")"
done

for skill_dir in "$REPO_DIR"/skills/*/; do
  skill_name="$(basename "$skill_dir")"
  link "skills/$skill_name"
done

node "$REPO_DIR/install-settings.js"

echo "Done."
