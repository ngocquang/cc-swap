# cc-switch - Claude Code Account Switcher

## Overview

CLI tool (Node.js/TypeScript) to switch between multiple Claude Code accounts. Each account is a directory containing symlinks back to `~/.claude` (shared config) or custom override files. `~/.claude` is the source of truth and is **never modified** by cc-switch.

When launching Claude Code, the tool sets `CLAUDE_CONFIG_DIR` to the account directory, so Claude reads config from there.

## Core Principle

```
~/.claude/                              # SOURCE OF TRUTH — never modified
├── settings.json                       # real file
├── hooks/                              # real dir
├── plugins/                            # real dir
└── ...

~/.cc-switch/
├── .current                            # active account name
└── claude-accounts/
    ├── work/
    │   ├── settings.json → ~/.claude/settings.json    # symlink (shared)
    │   ├── hooks → ~/.claude/hooks                    # symlink (shared)
    │   └── plugins/                                   # REAL dir (custom override)
    └── personal/
        ├── settings.json                              # REAL file (custom override)
        ├── hooks → ~/.claude/hooks                    # symlink (shared)
        └── ...
```

**Shared items** = symlinks back to `~/.claude` (default when adding account)
**Custom overrides** = replace the symlink with a real file/dir in the account folder

## Switchable Items

The following items inside `~/.claude` are symlinked per-account:

- `agents/`, `commands/`, `file-history/`, `hooks/`, `plugins/`
- `projects/`, `rules/`, `session-env/`, `sessions/`
- `settings.json`, `skills/`, `tasks/`

## CLI Commands

### `cc-switch` (no arguments)

Auto switch to the next account (round-robin) and launch Claude Code.

1. Read `.current` to get active account name
2. List folders in `claude-accounts/`, sorted alphabetically (case-insensitive)
3. If only 1 account → use that account directly
4. If 2+ accounts → switch to the next one (wrap to first at end), update `.current`
5. Launch `claude --continue` with `CLAUDE_CONFIG_DIR` set to the account directory

### `cc-switch add <name>`

Create a new account populated with symlinks back to `~/.claude`.

1. Validate name (alphanumeric, hyphens, underscores; max 50 chars; no `.` or `-` prefix)
2. Create `~/.cc-switch/claude-accounts/<name>/`
3. For each switchable item that exists in `~/.claude`: create symlink `<name>/<item>` → `~/.claude/<item>`
4. If this is the first account, set it as `.current`
5. `~/.claude` is NOT modified

### `cc-switch switch <name>`

Switch to a specific account and launch Claude Code.

1. Validate `<name>` exists in `claude-accounts/`
2. If already active → print message and exit
3. Update `.current`
4. Launch `claude --continue` with `CLAUDE_CONFIG_DIR=<account-dir>`

### `cc-switch list`

List all accounts, marking the active one.

```
  work
* personal (active)
```

### `cc-switch remove <name>`

Remove an account.

1. Prevent removing the currently active account
2. Prevent removing the last remaining account
3. Confirm with user (prompt y/n), support `--force` flag to skip
4. Remove `~/.cc-switch/claude-accounts/<name>/`

## How It Works

- **Adding**: `cc-switch add work` creates `~/.cc-switch/claude-accounts/work/` with symlinks pointing back to `~/.claude/` for each switchable item
- **Switching**: `cc-switch switch work` updates `.current` and runs `claude --continue` with `CLAUDE_CONFIG_DIR=~/.cc-switch/claude-accounts/work`
- **Custom overrides**: User can replace any symlink in the account folder with a real file/dir. `cc-switch` will not overwrite existing items when populating.
- **`~/.claude` is sacred**: cc-switch never reads from, writes to, or modifies `~/.claude` contents. It only reads to create initial symlinks during `add`.

## Safety Checks

- **`~/.claude` is never modified** — only used as symlink target
- **Validate account names**: alphanumeric, hyphens, underscores only. Max 50 chars. Cannot start with `.` or `-`
- **Preserve custom overrides**: `populateAccount` skips items that already exist in account dir
- **Permissions**: create `~/.cc-switch/` with mode `700`

## Tech Stack

- Node.js + TypeScript
- Commander.js for CLI parsing
- Native `fs/promises` for async filesystem operations
- `CLAUDE_CONFIG_DIR` env var to direct Claude Code to account folder
- No heavy dependencies

## Package

- Name: `cc-switch`
- Binary: `cc-switch`
- Install: `npm install -g cc-switch`
