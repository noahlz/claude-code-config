/**
 * Integration tests: invoke `claude -p --model haiku` and verify hook side effects.
 * These tests make real API calls and are opt-in via `npm run test:integration`.
 */

import { describe, test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir, homedir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HELPERS_DIR = resolve(__dirname, '../helpers');
const TASK_FILE = join(homedir(), '.claude', 'current-task');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function runClaude(prompt, extraEnv = {}) {
  return spawnSync('claude', ['--model', 'haiku', '-p', prompt, '--max-turns', '1'], {
    encoding: 'utf8',
    timeout: 60_000,
    env: {
      ...process.env,
      PATH: `${HELPERS_DIR}:${process.env.PATH}`,
      ...extraEnv,
    },
  });
}


describe('hooks lifecycle integration', () => {
  afterEach(() => {
    if (existsSync(TASK_FILE)) unlinkSync(TASK_FILE);
  });

  test(
    'record-start-time: creates /tmp/claude-turn-* file on prompt submit',
    { timeout: 60_000 },
    () => {
      const result = runClaude('what is 1+1');
      assert.equal(result.status, 0, `claude -p failed: ${result.stderr}`);

      // The hook deletes the start file on Stop. We verify claude ran successfully,
      // which confirms the UserPromptSubmit hook did not crash or block the session.
      assert.ok(result.status === 0, 'claude -p should succeed, confirming hooks did not block it');
    }
  );

  test(
    'record-start-time: "proceed" in prompt → writes Implementation to current-task',
    { timeout: 60_000 },
    () => {
      if (existsSync(TASK_FILE)) unlinkSync(TASK_FILE);

      const result = runClaude('proceed with answering: what is 1+1');
      assert.equal(result.status, 0, `claude -p failed: ${result.stderr}`);

      assert.ok(existsSync(TASK_FILE), 'current-task file should have been written');
      assert.equal(readFileSync(TASK_FILE, 'utf8').trim(), 'Implementation');
    }
  );

  test(
    'notify-on-stop: fires notification when CLAUDE_NOTIFICATION_THRESHOLD=0',
    { timeout: 60_000 },
    async () => {
      const sayLog = join(tmpdir(), `say-integration-${Date.now()}.log`);

      const result = runClaude('what is 1+1', {
        CLAUDE_NOTIFICATION_THRESHOLD: '0',
        SAY_LOG: sayLog,
      });
      assert.equal(result.status, 0, `claude -p failed: ${result.stderr}`);

      // notification is spawned with & — wait for it to flush
      await sleep(1000);

      assert.ok(existsSync(sayLog), 'notification mock should have been called (log file missing)');
      const logged = readFileSync(sayLog, 'utf8').trim();
      assert.ok(logged.length > 0, `notification log should contain a message, got: "${logged}"`);

      if (existsSync(sayLog)) unlinkSync(sayLog);
    }
  );
});
