import { describe, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, mkdirSync, rmSync, mkdtempSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOOK = resolve(__dirname, '../../hooks/notify-on-stop.sh');
const HELPERS_DIR = resolve(__dirname, '../helpers');
const SESSION = 'test-notify-sess';
const START_FILE = `/tmp/claude-turn-${SESSION}`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('notify-on-stop.sh', () => {
  let testHome;
  let sayLog;
  let notifyLog;
  const taskFile = () => join(testHome, '.claude', 'current-task');

  function runHook(overrides = {}, method = 'say') {
    const input = {
      session_id: SESSION,
      stop_hook_active: false,
      ...overrides,
    };
    const env = {
      ...process.env,
      HOME: testHome,
      PATH: `${HELPERS_DIR}:${process.env.PATH}`,
      SAY_LOG: sayLog,
      NOTIFY_LOG: notifyLog,
      CLAUDE_NOTIFICATION_THRESHOLD: '0',
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

  function writeStartFile() {
    // Write a timestamp old enough to exceed threshold=0
    writeFileSync(START_FILE, String(Math.floor(Date.now() / 1000) - 5));
  }

  beforeEach(() => {
    testHome = mkdtempSync(join(tmpdir(), 'claude-hook-test-'));
    sayLog = join(testHome, 'say-calls.log');
    notifyLog = join(testHome, 'osascript-calls.log');
    mkdirSync(join(testHome, '.claude'), { recursive: true });
    if (existsSync(START_FILE)) unlinkSync(START_FILE);
  });

  afterEach(() => {
    if (existsSync(START_FILE)) unlinkSync(START_FILE);
    if (testHome) rmSync(testHome, { recursive: true, force: true });
  });

  test('exits 0', () => {
    assert.equal(runHook().status, 0);
  });

  test('stop_hook_active=true → exits immediately, no notification', async () => {
    writeStartFile();
    runHook({ stop_hook_active: true });
    await sleep(300);
    assert.ok(!existsSync(sayLog), 'notification should not have been called');
  });

  test('no start file → no notification', async () => {
    // no writeStartFile()
    runHook();
    await sleep(300);
    assert.ok(!existsSync(sayLog), 'notification should not have been called without a start file');
  });

  test('elapsed < threshold → no notification', async () => {
    writeStartFile();
    // Override threshold to something huge
    spawnSync(HOOK, {
      input: JSON.stringify({ session_id: SESSION, stop_hook_active: false }),
      encoding: 'utf8',
      env: {
        ...process.env,
        HOME: testHome,
        PATH: `${HELPERS_DIR}:${process.env.PATH}`,
        SAY_LOG: sayLog,
        NOTIFY_LOG: notifyLog,
        CLAUDE_NOTIFICATION_THRESHOLD: '9999',
      },
    });
    await sleep(300);
    assert.ok(!existsSync(sayLog), 'notification should not be called when elapsed < threshold');
  });

  // Tests for default "say" method
  test('method=say, label "Plan" → says "Plan ready for review."', async () => {
    writeStartFile();
    writeFileSync(taskFile(), 'Plan');
    runHook({}, 'say');
    await sleep(300);
    assert.ok(existsSync(sayLog), 'say should have been called');
    assert.equal(readFileSync(sayLog, 'utf8').trim(), 'Plan ready for review.');
  });

  test('method=say, label "Implementation" → says "Implementation complete."', async () => {
    writeStartFile();
    writeFileSync(taskFile(), 'Implementation');
    runHook({}, 'say');
    await sleep(300);
    assert.ok(existsSync(sayLog), 'say should have been called');
    assert.equal(readFileSync(sayLog, 'utf8').trim(), 'Implementation complete.');
  });

  test('method=say, label "Exploration" → says "Exploration complete."', async () => {
    writeStartFile();
    writeFileSync(taskFile(), 'Exploration');
    runHook({}, 'say');
    await sleep(300);
    assert.ok(existsSync(sayLog), 'say should have been called');
    assert.equal(readFileSync(sayLog, 'utf8').trim(), 'Exploration complete.');
  });

  test('method=say, no task file → says "Task complete."', async () => {
    writeStartFile();
    // no task file written
    runHook({}, 'say');
    await sleep(300);
    assert.ok(existsSync(sayLog), 'say should have been called');
    assert.equal(readFileSync(sayLog, 'utf8').trim(), 'Task complete.');
  });

  // Tests for "notification" (osascript) method
  test('method=notification, label "Plan" → osascript called with "Plan ready for review."', async () => {
    writeStartFile();
    writeFileSync(taskFile(), 'Plan');
    runHook({}, 'notification');
    await sleep(300);
    assert.ok(existsSync(notifyLog), 'osascript should have been called');
    const logged = readFileSync(notifyLog, 'utf8');
    assert.ok(logged.includes('Plan ready for review.'), `Expected notification to contain "Plan ready for review.", got: "${logged}"`);
  });

  test('method=notification, no task file → osascript called with "Task complete."', async () => {
    writeStartFile();
    runHook({}, 'notification');
    await sleep(300);
    assert.ok(existsSync(notifyLog), 'osascript should have been called');
    const logged = readFileSync(notifyLog, 'utf8');
    assert.ok(logged.includes('Task complete.'), `Expected notification to contain "Task complete.", got: "${logged}"`);
  });
});
