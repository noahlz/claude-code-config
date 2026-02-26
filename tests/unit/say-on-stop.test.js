import { describe, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, mkdirSync, rmSync, mkdtempSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOOK = resolve(__dirname, '../../hooks/say-on-stop.sh');
const HELPERS_DIR = resolve(__dirname, '../helpers');
const SESSION = 'test-say-sess';
const START_FILE = `/tmp/claude-turn-${SESSION}`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('say-on-stop.sh', () => {
  let testHome;
  let sayLog;
  const taskFile = () => join(testHome, '.claude', 'current-task');

  function runHook(overrides = {}) {
    const input = {
      session_id: SESSION,
      stop_hook_active: false,
      ...overrides,
    };
    return spawnSync(HOOK, {
      input: JSON.stringify(input),
      encoding: 'utf8',
      env: {
        ...process.env,
        HOME: testHome,
        PATH: `${HELPERS_DIR}:${process.env.PATH}`,
        SAY_LOG: sayLog,
        CLAUDE_SAY_THRESHOLD: '0',
      },
    });
  }

  function writeStartFile() {
    // Write a timestamp old enough to exceed threshold=0
    writeFileSync(START_FILE, String(Math.floor(Date.now() / 1000) - 5));
  }

  beforeEach(() => {
    testHome = mkdtempSync(join(tmpdir(), 'claude-hook-test-'));
    sayLog = join(testHome, 'say-calls.log');
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

  test('stop_hook_active=true → exits immediately, say not called', async () => {
    writeStartFile();
    runHook({ stop_hook_active: true });
    await sleep(300);
    assert.ok(!existsSync(sayLog), 'say should not have been called');
  });

  test('no start file → say not called', async () => {
    // no writeStartFile()
    runHook();
    await sleep(300);
    assert.ok(!existsSync(sayLog), 'say should not have been called without a start file');
  });

  test('elapsed < threshold → say not called', async () => {
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
        CLAUDE_SAY_THRESHOLD: '9999',
      },
    });
    await sleep(300);
    assert.ok(!existsSync(sayLog), 'say should not be called when elapsed < threshold');
  });

  test('label "Plan" → says "Plan ready for review."', async () => {
    writeStartFile();
    writeFileSync(taskFile(), 'Plan');
    runHook();
    await sleep(300);
    assert.ok(existsSync(sayLog), 'say should have been called');
    assert.equal(readFileSync(sayLog, 'utf8').trim(), 'Plan ready for review.');
  });

  test('label "Implementation" → says "Implementation complete."', async () => {
    writeStartFile();
    writeFileSync(taskFile(), 'Implementation');
    runHook();
    await sleep(300);
    assert.ok(existsSync(sayLog), 'say should have been called');
    assert.equal(readFileSync(sayLog, 'utf8').trim(), 'Implementation complete.');
  });

  test('label "Exploration" → says "Exploration complete."', async () => {
    writeStartFile();
    writeFileSync(taskFile(), 'Exploration');
    runHook();
    await sleep(300);
    assert.ok(existsSync(sayLog), 'say should have been called');
    assert.equal(readFileSync(sayLog, 'utf8').trim(), 'Exploration complete.');
  });

  test('no task file → says "Task complete."', async () => {
    writeStartFile();
    // no task file written
    runHook();
    await sleep(300);
    assert.ok(existsSync(sayLog), 'say should have been called');
    assert.equal(readFileSync(sayLog, 'utf8').trim(), 'Task complete.');
  });
});
