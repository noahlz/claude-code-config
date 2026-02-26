import { describe, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, mkdirSync, rmSync, mkdtempSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOOK = resolve(__dirname, '../../hooks/post-exit-plan-mode.sh');

describe('post-exit-plan-mode.sh', () => {
  let testHome;
  const taskFile = () => join(testHome, '.claude', 'current-task');

  function runHook() {
    return spawnSync(HOOK, {
      input: '',
      encoding: 'utf8',
      env: { ...process.env, HOME: testHome },
    });
  }

  beforeEach(() => {
    testHome = mkdtempSync(join(tmpdir(), 'claude-hook-test-'));
    mkdirSync(join(testHome, '.claude'), { recursive: true });
  });

  afterEach(() => {
    if (testHome) rmSync(testHome, { recursive: true, force: true });
  });

  test('exits 0', () => {
    assert.equal(runHook().status, 0);
  });

  test('writes "Implementation" to current-task', () => {
    runHook();
    assert.ok(existsSync(taskFile()), 'current-task file should exist');
    assert.equal(readFileSync(taskFile(), 'utf8').trim(), 'Implementation');
  });

  test('overwrites stale "Exploration" label', () => {
    writeFileSync(taskFile(), 'Exploration');
    runHook();
    assert.equal(readFileSync(taskFile(), 'utf8').trim(), 'Implementation');
  });

  test('overwrites stale "Plan" label', () => {
    writeFileSync(taskFile(), 'Plan');
    runHook();
    assert.equal(readFileSync(taskFile(), 'utf8').trim(), 'Implementation');
  });
});
