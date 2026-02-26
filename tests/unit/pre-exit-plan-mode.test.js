import { describe, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, mkdtempSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOOK = resolve(__dirname, '../../hooks/pre-exit-plan-mode.sh');
const HELPERS_DIR = resolve(__dirname, '../helpers');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('pre-exit-plan-mode.sh', () => {
  let testHome;
  let sayLog;

  function runHook() {
    return spawnSync(HOOK, {
      input: '',
      encoding: 'utf8',
      env: {
        ...process.env,
        HOME: testHome,
        PATH: `${HELPERS_DIR}:${process.env.PATH}`,
        SAY_LOG: sayLog,
      },
    });
  }

  beforeEach(() => {
    testHome = mkdtempSync(join(tmpdir(), 'claude-hook-test-'));
    sayLog = join(testHome, 'say-calls.log');
  });

  afterEach(() => {
    if (testHome) rmSync(testHome, { recursive: true, force: true });
  });

  test('exits 0', () => {
    assert.equal(runHook().status, 0);
  });

  test('says "Plan ready for review."', async () => {
    runHook();
    await sleep(300);
    assert.ok(existsSync(sayLog), 'say should have been called (log file missing)');
    assert.equal(readFileSync(sayLog, 'utf8').trim(), 'Plan ready for review.');
  });
});
