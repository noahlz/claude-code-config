#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const CLAUDE_SETTINGS = path.join(process.env.HOME, '.claude', 'settings.json');
const HOOKS_FILE = path.join(import.meta.dirname, 'settings.hooks.json');

console.log('\nUpdating ~/.claude/settings.json');
console.log('─'.repeat(40));

// Backup existing settings
if (fs.existsSync(CLAUDE_SETTINGS)) {
  fs.copyFileSync(CLAUDE_SETTINGS, CLAUDE_SETTINGS + '.bak');
  console.log('  backup  settings.json -> settings.json.bak');
}

// Read existing settings (or start fresh)
const current = fs.existsSync(CLAUDE_SETTINGS)
  ? JSON.parse(fs.readFileSync(CLAUDE_SETTINGS, 'utf8'))
  : {};

// Merge hooks
const { hooks } = JSON.parse(fs.readFileSync(HOOKS_FILE, 'utf8'));
console.log('  merge   hooks from settings.hooks.json');
current.hooks = hooks;

// Set output style
console.log('  set     outputStyle = "terse"');
current.outputStyle = 'terse';

// Write result
fs.writeFileSync(CLAUDE_SETTINGS, JSON.stringify(current, null, 2) + '\n');

// Validate
try {
  JSON.parse(fs.readFileSync(CLAUDE_SETTINGS, 'utf8'));
  console.log('  valid   settings.json passed JSON validation');
} catch (e) {
  console.error('  ERROR   settings.json failed JSON validation:', e.message);
  process.exit(1);
}

console.log('─'.repeat(40) + '\n');
