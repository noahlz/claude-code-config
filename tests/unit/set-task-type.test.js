import { describe, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, mkdirSync, rmSync, mkdtempSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOOK = resolve(__dirname, '../../hooks/set-task-type.sh');

describe('set-task-type.sh', () => {
  let testHome;
  const taskFile = () => join(testHome, '.claude', 'current-task');

  function runHook(agentType) {
    return spawnSync(HOOK, {
      input: JSON.stringify({ agent_type: agentType }),
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
    assert.equal(runHook('Plan').status, 0);
  });

  test('Plan → writes "Plan"', () => {
    runHook('Plan');
    assert.equal(readFileSync(taskFile(), 'utf8').trim(), 'Plan');
  });

  test('Explore → writes "Exploration" when no task file', () => {
    runHook('Explore');
    assert.equal(readFileSync(taskFile(), 'utf8').trim(), 'Exploration');
  });

  test('Explore does not overwrite existing task file', () => {
    writeFileSync(taskFile(), 'Plan');
    runHook('Explore');
    assert.equal(readFileSync(taskFile(), 'utf8').trim(), 'Plan');
  });

  test('unknown agent type → no task file created', () => {
    runHook('general-purpose');
    assert.ok(!existsSync(taskFile()), `Expected no task file, but found one`);
  });
});
