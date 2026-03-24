import { describe, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, mkdirSync, rmSync, mkdtempSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOOK = resolve(__dirname, '../../hooks/notify-on-stop-failure.sh');
const HELPERS_DIR = resolve(__dirname, '../helpers');
const SESSION = 'test-stop-failure-sess';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('notify-on-stop-failure.sh', () => {
  let testHome;
  let sayLog;
  let notifyLog;

  function runHook(method = 'say') {
    const input = { session_id: SESSION };
    const env = {
      ...process.env,
      HOME: testHome,
      PATH: `${HELPERS_DIR}:${process.env.PATH}`,
      SAY_LOG: sayLog,
      NOTIFY_LOG: notifyLog,
    };
    if (method !== 'say') {
      env.CLAUDE_NOTIFICATION_METHOD = method;
    }
    return spawnSync(HOOK, {
      input: JSON.stringify(input),
      encoding: 'utf8',
      env,
    });
  }

  beforeEach(() => {
    testHome = mkdtempSync(join(tmpdir(), 'claude-hook-failure-test-'));
    sayLog = join(testHome, 'say-calls.log');
    notifyLog = join(testHome, 'osascript-calls.log');
    mkdirSync(join(testHome, '.claude'), { recursive: true });
  });

  afterEach(() => {
    if (testHome) rmSync(testHome, { recursive: true, force: true });
  });

  test('exits 0', () => {
    assert.equal(runHook().status, 0);
  });

  test('always notifies regardless of elapsed time (no start file needed)', async () => {
    // No start file, no threshold — should still notify
    runHook();
    await sleep(300);
    assert.ok(existsSync(sayLog), 'notification should have been called without a start file');
    assert.equal(readFileSync(sayLog, 'utf8').trim(), 'Task failed.');
  });

  test('method=say → says "Task failed."', async () => {
    runHook('say');
    await sleep(300);
    assert.ok(existsSync(sayLog), 'say should have been called');
    assert.equal(readFileSync(sayLog, 'utf8').trim(), 'Task failed.');
  });

  test('method=notification → osascript called with "Task failed."', async () => {
    runHook('notification');
    await sleep(300);
    assert.ok(existsSync(notifyLog), 'osascript should have been called');
    const logged = readFileSync(notifyLog, 'utf8');
    assert.ok(logged.includes('Task failed.'), `Expected notification to contain "Task failed.", got: "${logged}"`);
  });

  test('task label present → still says "Task failed." (label is ignored)', async () => {
    // Write a current-task file to confirm the hook ignores it
    const { writeFileSync } = await import('node:fs');
    writeFileSync(join(testHome, '.claude', 'current-task'), 'Implementation');
    runHook('say');
    await sleep(300);
    assert.ok(existsSync(sayLog), 'say should have been called');
    assert.equal(readFileSync(sayLog, 'utf8').trim(), 'Task failed.');
  });
});
