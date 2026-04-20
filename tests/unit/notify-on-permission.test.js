import { describe, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync, mkdtempSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOOK = resolve(__dirname, '../../hooks/notify-on-permission.sh');
const HELPERS_DIR = resolve(__dirname, '../helpers');
const HELPERS_NO_NOTIFIER = resolve(__dirname, '../helpers-no-notifier');
// Need node's dir because the stubs use `#!/usr/bin/env node`. /usr/bin covers
// jq/basename/osascript/afplay. Deliberately exclude user's /usr/local/bin etc.
// so a real terminal-notifier on the host can't leak into fallback tests.
const NODE_BIN = dirname(process.execPath);
const SYSTEM_BIN = `${NODE_BIN}:/usr/bin:/bin`;
const SESSION = 'test-permission-sess';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('notify-on-permission.sh', () => {
  let testHome;
  let sayLog;
  let notifyLog;
  let notifierLog;
  let afplayLog;
  let transcriptPath;

  function buildEnv(helpersDir, overrides = {}) {
    return {
      HOME: testHome,
      PATH: `${helpersDir}:${SYSTEM_BIN}`,
      SAY_LOG: sayLog,
      NOTIFY_LOG: notifyLog,
      NOTIFIER_LOG: notifierLog,
      AFPLAY_LOG: afplayLog,
      ...overrides,
    };
  }

  function runHook({ payload = {}, env = {}, helpersDir = HELPERS_DIR } = {}) {
    const input = {
      session_id: SESSION,
      hook_event_name: 'Notification',
      notification_type: 'permission_prompt',
      title: 'Permission needed',
      message: 'Claude needs your permission to use Bash',
      transcript_path: transcriptPath,
      ...payload,
    };
    return spawnSync(HOOK, {
      input: JSON.stringify(input),
      encoding: 'utf8',
      env: buildEnv(helpersDir, env),
    });
  }

  function writeTranscript(toolUses) {
    const lines = toolUses.map((tu) =>
      JSON.stringify({ type: 'assistant', message: { content: [tu] } }),
    );
    writeFileSync(transcriptPath, lines.join('\n') + '\n');
  }

  function readNotifierArgs() {
    if (!existsSync(notifierLog)) return null;
    return readFileSync(notifierLog, 'utf8').trim().split('\t');
  }

  beforeEach(() => {
    testHome = mkdtempSync(join(tmpdir(), 'claude-hook-permission-test-'));
    sayLog = join(testHome, 'say-calls.log');
    notifyLog = join(testHome, 'osascript-calls.log');
    notifierLog = join(testHome, 'terminal-notifier-calls.log');
    afplayLog = join(testHome, 'afplay-calls.log');
    transcriptPath = join(testHome, 'transcript.jsonl');
    mkdirSync(join(testHome, '.claude'), { recursive: true });
  });

  afterEach(() => {
    if (testHome) rmSync(testHome, { recursive: true, force: true });
  });

  // -------------- terminal-notifier path (primary) --------------

  describe('with terminal-notifier', () => {
    test('exits 0 on well-formed payload', () => {
      assert.equal(runHook().status, 0);
    });

    test('invokes terminal-notifier with title, message, group', async () => {
      runHook();
      await sleep(300);
      const args = readNotifierArgs();
      assert.ok(args, 'terminal-notifier should have been called');
      assert.ok(args.includes('-title') && args[args.indexOf('-title') + 1] === 'Claude Code');
      assert.ok(args.includes('-group') && args[args.indexOf('-group') + 1] === 'claude-code-permission');
    });

    test('passes -sound Ping', async () => {
      runHook();
      await sleep(300);
      const args = readNotifierArgs();
      const idx = args.indexOf('-sound');
      assert.ok(idx >= 0, '-sound must be present');
      assert.equal(args[idx + 1], 'Ping');
    });

    test('does not invoke osascript, afplay, or say when terminal-notifier handles sound', async () => {
      runHook();
      await sleep(300);
      assert.ok(!existsSync(notifyLog), 'osascript must not be called');
      assert.ok(!existsSync(afplayLog), 'afplay must not be called');
      assert.ok(!existsSync(sayLog), 'say must not be called');
    });

    test('sender=none via config file omits -sender', async () => {
      writeFileSync(join(testHome, '.claude', 'permission-sender'), 'none');
      runHook();
      await sleep(300);
      const args = readNotifierArgs();
      assert.ok(args, 'terminal-notifier should have been called');
      assert.ok(!args.includes('-sender'), '-sender must be omitted when sender=none');
    });

    test('TMUX_PANE set → uses -execute with tmux commands', async () => {
      runHook({ env: { TMUX_PANE: '%42', TERM_PROGRAM: 'Apple_Terminal' } });
      await sleep(300);
      const args = readNotifierArgs();
      const idx = args.indexOf('-execute');
      assert.ok(idx >= 0, '-execute must be present when TMUX_PANE is set');
      const exec = args[idx + 1];
      assert.ok(exec.includes('tmux select-pane'), `expected tmux select-pane in -execute, got: ${exec}`);
      assert.ok(exec.includes('%42'), `expected pane id %42 in -execute, got: ${exec}`);
      assert.ok(exec.includes('com.apple.Terminal'), `expected terminal bundle id in -execute, got: ${exec}`);
    });

    test('no TMUX_PANE, TERM_PROGRAM=iTerm.app → uses -activate with iTerm bundle', async () => {
      runHook({ env: { TERM_PROGRAM: 'iTerm.app' } });
      await sleep(300);
      const args = readNotifierArgs();
      const idx = args.indexOf('-activate');
      assert.ok(idx >= 0, '-activate must be present');
      assert.equal(args[idx + 1], 'com.googlecode.iterm2');
    });

    test('CLAUDE_PERMISSION_TERMINAL_BUNDLE overrides detected bundle', async () => {
      runHook({ env: { TERM_PROGRAM: 'Apple_Terminal', CLAUDE_PERMISSION_TERMINAL_BUNDLE: 'dev.custom.term' } });
      await sleep(300);
      const args = readNotifierArgs();
      const idx = args.indexOf('-activate');
      assert.equal(args[idx + 1], 'dev.custom.term');
    });

    test('terminal-bundle=none via config skips click action', async () => {
      writeFileSync(join(testHome, '.claude', 'permission-terminal-bundle'), 'none');
      runHook({ env: { TERM_PROGRAM: 'Apple_Terminal' } });
      await sleep(300);
      const args = readNotifierArgs();
      assert.ok(!args.includes('-activate'), '-activate must be absent when bundle=none');
      assert.ok(!args.includes('-execute'), '-execute must be absent when bundle=none (no tmux)');
    });

    // Transcript parsing: specific tool request in message body
    test('transcript Bash tool_use → message is "Bash: <command>"', async () => {
      writeTranscript([
        { type: 'tool_use', name: 'Bash', input: { command: '/bin/rm /tmp/foo' } },
      ]);
      runHook();
      await sleep(300);
      const args = readNotifierArgs();
      const idx = args.indexOf('-message');
      assert.equal(args[idx + 1], 'Bash: /bin/rm /tmp/foo');
    });

    test('transcript Read tool_use → message is "Read: <basename>"', async () => {
      writeTranscript([
        { type: 'tool_use', name: 'Read', input: { file_path: '/Users/noahlz/projects/foo/bar/baz.ts' } },
      ]);
      runHook();
      await sleep(300);
      const args = readNotifierArgs();
      const idx = args.indexOf('-message');
      assert.equal(args[idx + 1], 'Read: baz.ts');
    });

    test('transcript Grep tool_use → message is "Grep: <pattern>"', async () => {
      writeTranscript([
        { type: 'tool_use', name: 'Grep', input: { pattern: 'TODO.*fix' } },
      ]);
      runHook();
      await sleep(300);
      const args = readNotifierArgs();
      const idx = args.indexOf('-message');
      assert.equal(args[idx + 1], 'Grep: TODO.*fix');
    });

    test('transcript uses the LAST tool_use (not the first)', async () => {
      writeTranscript([
        { type: 'tool_use', name: 'Read', input: { file_path: '/a/old.md' } },
        { type: 'tool_use', name: 'Bash', input: { command: 'echo latest' } },
      ]);
      runHook();
      await sleep(300);
      const args = readNotifierArgs();
      const idx = args.indexOf('-message');
      assert.equal(args[idx + 1], 'Bash: echo latest');
    });

    test('transcript with long Bash command is truncated', async () => {
      const longCmd = 'a'.repeat(200);
      writeTranscript([
        { type: 'tool_use', name: 'Bash', input: { command: longCmd } },
      ]);
      runHook();
      await sleep(300);
      const args = readNotifierArgs();
      const idx = args.indexOf('-message');
      const body = args[idx + 1];
      assert.ok(body.endsWith('...'), `expected truncation suffix, got: ${body}`);
      assert.ok(body.length < 120, `expected trimmed length, got len=${body.length}`);
      assert.ok(body.startsWith('Bash: '), `expected Bash prefix, got: ${body}`);
    });

    test('missing transcript falls back to payload message', async () => {
      runHook({ payload: { transcript_path: '/nonexistent/path' } });
      await sleep(300);
      const args = readNotifierArgs();
      const idx = args.indexOf('-message');
      assert.equal(args[idx + 1], 'Claude needs your permission to use Bash');
    });

    test('CLAUDE_CODE_ENTRYPOINT=desktop suppresses the notification', async () => {
      runHook({ env: { CLAUDE_CODE_ENTRYPOINT: 'desktop' } });
      await sleep(300);
      assert.ok(!existsSync(notifierLog), 'no terminal-notifier inside Claude Desktop');
      assert.ok(!existsSync(notifyLog), 'no osascript inside Claude Desktop');
      assert.ok(!existsSync(afplayLog), 'no afplay inside Claude Desktop');
    });

    test('empty message and no transcript → no notification', async () => {
      const result = runHook({ payload: { message: '', transcript_path: '' } });
      await sleep(300);
      assert.equal(result.status, 0);
      assert.ok(!existsSync(notifierLog), 'nothing to say → no notification');
    });
  });

  // -------------- osascript fallback path --------------

  describe('without terminal-notifier (fallback)', () => {
    test('exits 0', () => {
      assert.equal(runHook({ helpersDir: HELPERS_NO_NOTIFIER }).status, 0);
    });

    test('invokes osascript display notification with sound name "Ping"', async () => {
      runHook({ helpersDir: HELPERS_NO_NOTIFIER });
      await sleep(300);
      assert.ok(existsSync(notifyLog), 'osascript should be called');
      const logged = readFileSync(notifyLog, 'utf8');
      assert.ok(logged.includes('display notification'), `expected notification, got: ${logged}`);
      assert.ok(logged.includes('sound name "Ping"'), `expected sound name Ping, got: ${logged}`);
    });

    test('invokes afplay with Ping.aiff for reliable sound', async () => {
      runHook({ helpersDir: HELPERS_NO_NOTIFIER });
      await sleep(300);
      assert.ok(existsSync(afplayLog), 'afplay should be called');
      const logged = readFileSync(afplayLog, 'utf8');
      assert.ok(logged.includes('/System/Library/Sounds/Ping.aiff'), `expected Ping.aiff, got: ${logged}`);
    });

    test('never invokes say', async () => {
      runHook({ helpersDir: HELPERS_NO_NOTIFIER });
      await sleep(300);
      assert.ok(!existsSync(sayLog), 'say must NOT be called in fallback');
    });

    test('desktop suppression still applies', async () => {
      runHook({ helpersDir: HELPERS_NO_NOTIFIER, env: { CLAUDE_CODE_ENTRYPOINT: 'desktop' } });
      await sleep(300);
      assert.ok(!existsSync(notifyLog), 'no osascript inside Claude Desktop');
      assert.ok(!existsSync(afplayLog), 'no afplay inside Claude Desktop');
    });
  });
});
