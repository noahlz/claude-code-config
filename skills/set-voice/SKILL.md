---
name: set-voice
description: Use when the user wants to change, set, randomize, or list the macOS voice used for Claude Code audio notifications. Triggers on requests like "change the voice", "pick a random voice", "list voices", "use a different voice for notifications", or "what voice am I using".
---

# Set Voice

Configure the macOS `say` voice used by Claude Code notification hooks.

Voice is saved to `~/.claude/say-voice` (one line, voice name only). The `set-voice` skill writes this file. `CLAUDE_SAY_VOICE` env var overrides it.

## List Available Voices

```bash
# All English voices (US, UK, AU, IE, ZA, IN, etc.)
say -v '?' | grep 'en_'
```

Group by **Type** (Female/Male/Computer) and **Region** (locale → US/UK/AU/IE/ZA/IN). When a voice has multiple tiers (regular, Enhanced, Premium), show only the highest tier. Mark it if Enhanced or Premium.

Example display format:
```
Female
  US:  Allison (Enhanced), Ava (Premium), Kathy, Samantha, ...
  UK:  Flo, Sandy, Shelley, ...
  AU:  Karen, Matilda (Premium)
Male
  US:  Alex, Fred, Ralph, ...
  UK:  Daniel, Eddy, Reed, Rocko
Computer
  US:  Albert, Bad News, Bahh, Bells, Zarvox, ...
```

## Set a Specific Voice

```bash
echo "Samantha" > ~/.claude/say-voice
say -v Samantha "Hello, I am Samantha."
```

## Pick a Random Voice

```bash
# Pick a random English voice (any en_ locale) and save it
voice=$(say -v '?' | grep 'en_' | sed 's/  .*//' | sort -R | head -1)
echo "$voice" > ~/.claude/say-voice
say -v "$voice" "Hello, I am $voice."
```

## Show Current Voice

```bash
cat ~/.claude/say-voice 2>/dev/null || echo "(using system default)"
```

## Disable Notifications

```bash
echo "none" > ~/.claude/say-voice
```

Confirms to the user that audio notifications are now disabled.

## Clear / Reset to System Default

```bash
rm -f ~/.claude/say-voice
```

## Workflow

1. If user said "random" → run random picker, announce the selected voice, test it
2. If user named a voice → set it, test it
3. If user said "list" or "show voices" → list available voices grouped by type/region
4. If user said "show" or "what voice" → show current setting
5. If user said "none" or "disable" or "turn off" → write "none" to say-voice, confirm disabled (no test phrase)
6. If user said "reset" or "default" → remove config file
7. Always play a test phrase so the user can hear the result (except for "none")
