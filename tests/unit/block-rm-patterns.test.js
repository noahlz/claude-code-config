import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOOK = resolve(__dirname, '../../hooks/block-rm-patterns.sh');

function run(command) {
  return spawnSync(HOOK, {
    input: JSON.stringify({ tool_input: { command } }),
    encoding: 'utf8',
  });
}

describe('block-rm-patterns.sh', () => {
  // Blocked patterns — all must exit 2
  test('blocks rm -rf', () => assert.equal(run('rm -rf /tmp/test').status, 2));
  test('blocks rm -fr', () => assert.equal(run('rm -fr /tmp/test').status, 2));

  // Allowed commands — must exit 0
  test('allows simple rm without -rf/-fr', () => assert.equal(run('rm file.txt').status, 0));
  test('allows ls', () => assert.equal(run('ls -la').status, 0));
});
