import { describe, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync, rmSync, mkdtempSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOOK = resolve(__dirname, '../../hooks/record-start-time.sh');
const SESSION = 'test-record-sess';
const TEMP_FILE = `/tmp/claude-turn-${SESSION}`;

describe('record-start-time.sh', () => {
  let testHome;
  const taskFile = () => join(testHome, '.claude', 'current-task');

  function runHook(prompt) {
    return spawnSync(HOOK, {
      input: JSON.stringify({ session_id: SESSION, prompt }),
      encoding: 'utf8',
      env: { ...process.env, HOME: testHome },
    });
  }

  beforeEach(() => {
    testHome = mkdtempSync(join(tmpdir(), 'claude-hook-test-'));
    mkdirSync(join(testHome, '.claude'), { recursive: true });
    if (existsSync(TEMP_FILE)) unlinkSync(TEMP_FILE);
  });

  afterEach(() => {
    if (existsSync(TEMP_FILE)) unlinkSync(TEMP_FILE);
    if (testHome) rmSync(testHome, { recursive: true, force: true });
  });

  test('exits 0', () => {
    assert.equal(runHook('whatever').status, 0);
  });

  test('creates timestamp file', () => {
    runHook('what is 1+1');
    assert.ok(existsSync(TEMP_FILE), `Expected ${TEMP_FILE} to exist`);
    const ts = parseInt(readFileSync(TEMP_FILE, 'utf8').trim(), 10);
    assert.ok(Number.isInteger(ts) && ts > 0, `Expected a valid Unix timestamp, got: ${ts}`);
  });

  test('"implement" → writes Implementation', () => {
    runHook('please implement this');
    assert.equal(readFileSync(taskFile(), 'utf8').trim(), 'Implementation');
  });

  test('"proceed" → writes Implementation', () => {
    runHook('go ahead and proceed');
    assert.equal(readFileSync(taskFile(), 'utf8').trim(), 'Implementation');
  });

  test('"go ahead" → writes Implementation', () => {
    runHook('go ahead');
    assert.equal(readFileSync(taskFile(), 'utf8').trim(), 'Implementation');
  });

  test('"execute the plan" → writes Implementation', () => {
    runHook('execute the plan now');
    assert.equal(readFileSync(taskFile(), 'utf8').trim(), 'Implementation');
  });

  test('no keywords → no task file', () => {
    runHook('what is the weather today');
    assert.ok(!existsSync(taskFile()), `Expected no task file, but found one`);
  });

  // Regression: stale label from a previous turn must not bleed into the next
  test('stale label cleared when new prompt has no keywords', () => {
    writeFileSync(taskFile(), 'Implementation');
    runHook('what is the weather today');
    assert.ok(!existsSync(taskFile()), `Expected stale task file to be cleared`);
  });

  test('stale label overwritten when new prompt has keywords', () => {
    writeFileSync(taskFile(), 'Exploration');
    runHook('please proceed');
    assert.equal(readFileSync(taskFile(), 'utf8').trim(), 'Implementation');
  });
});
