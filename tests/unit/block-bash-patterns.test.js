import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOOK = resolve(__dirname, '../../hooks/block-bash-patterns.sh');

function run(command) {
  return spawnSync(HOOK, {
    input: JSON.stringify({ tool_input: { command } }),
    encoding: 'utf8',
  });
}

describe('block-bash-patterns.sh', () => {
  // Blocked patterns — all must exit 2
  test('blocks rm -rf', () => assert.equal(run('rm -rf /tmp/test').status, 2));
  test('blocks rm -fr', () => assert.equal(run('rm -fr /tmp/test').status, 2));
  test('blocks git push --force', () => assert.equal(run('git push --force').status, 2));
  test('blocks git push -f', () => assert.equal(run('git push -f origin main').status, 2));
  test('blocks git reset --hard', () => assert.equal(run('git reset --hard HEAD').status, 2));
  test('blocks git checkout -- .', () => assert.equal(run('git checkout -- .').status, 2));
  test('blocks git clean -f', () => assert.equal(run('git clean -f').status, 2));
  test('blocks git branch -D', () => assert.equal(run('git branch -D my-branch').status, 2));
  test('blocks drop table', () => assert.equal(run('drop table users').status, 2));
  test('blocks drop database', () => assert.equal(run('drop database mydb').status, 2));
  test('blocks pipe to tee', () => assert.equal(run('cat file | tee out.txt').status, 2));

  // Allowed commands — must exit 0
  test('allows benign command', () => assert.equal(run('ls -la').status, 0));
  test('allows pipe without tee', () => assert.equal(run('echo hi | grep hi').status, 0));
  test('allows git push without force flag', () => assert.equal(run('git push origin main').status, 0));
});
