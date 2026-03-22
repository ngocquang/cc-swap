# cc-switch - Claude Code Account Switcher

## Overview

CLI tool (Node.js/TypeScript) to switch between multiple Claude Code accounts using symlinks. Each account gets its own isolated directory, and `~/.claude` is a symlink pointing to the active account.

## Directory Structure

```
~/.cc-switch/
├── .current              # plain text file with active account name
└── claude-accounts/
    ├── default/          # first account (moved from original ~/.claude)
    ├── work/
    └── personal/

~/.claude → symlink → ~/.cc-switch/claude-accounts/<active-account>
```

## CLI Commands

### `cc-switch` (no arguments)

Auto switch to the next account in round-robin order.

1. Read `.current` to get active account name
2. List folders in `claude-accounts/`, sorted alphabetically (case-insensitive)
3. If only 1 account exists → print message and exit
4. Find the next account in the list (wrap to first if at end)
5. Atomic symlink swap: create temp symlink, then `fs.rename` to `~/.claude`
6. Update `.current`
7. Print: `Switched: <old> → <new>`

### `cc-switch add <name>`

Add a new account.

**First-time behavior** (no `~/.cc-switch/` exists):
1. Validate `<name>` is not `default` (reserved for migrated account)
2. If `~/.claude` doesn't exist → create empty `~/.cc-switch/claude-accounts/default/`
3. If `~/.claude` is already a symlink → error with guidance
4. If `~/.claude` is a real directory → move to `~/.cc-switch/claude-accounts/default/`
5. Create symlink `~/.claude` → `~/.cc-switch/claude-accounts/default/`
6. Write `default` to `~/.cc-switch/.current`
7. Create empty `~/.cc-switch/claude-accounts/<name>/`
8. Set permissions `700` on `~/.cc-switch/`

**Subsequent adds:**
1. Validate `<name>` doesn't already exist
2. Create empty `~/.cc-switch/claude-accounts/<name>/`

**Note:** New empty accounts will be populated by Claude Code on first launch after switching.

### `cc-switch switch <name>`

Switch to a specific account by name.

1. Validate `<name>` exists in `claude-accounts/`
2. If already active → print message and exit
3. Atomic symlink swap: create temp symlink `~/.claude.tmp`, then `fs.rename` to `~/.claude`
4. Update `.current`
5. Print: `Switched to: <name>`

### `cc-switch list`

List all accounts, marking the active one.

```
  default
* work (active)
  personal
```

### `cc-switch remove <name>`

Remove an account.

1. Prevent removing the currently active account
2. Prevent removing the last remaining account
3. Confirm with user (prompt y/n), support `--force` flag to skip
4. Remove `~/.cc-switch/claude-accounts/<name>/`

## Safety Checks

- **Atomic symlink swap**: Always create temp symlink first, then `fs.rename` (atomic on POSIX). Never unlink then symlink - if symlink fails after unlink, user loses `~/.claude`.
- **Before first `add`**: handle 3 cases: `~/.claude` is real dir, is symlink, or doesn't exist
- **Validate `.current` on read**: if file missing/empty/points to non-existent account → auto-detect from symlink target or prompt user
- **Validate account names**: alphanumeric, hyphens, underscores only. Max 50 chars. Cannot start with `.` or `-`.
- **Path validation**: resolve symlink target and verify it's within `~/.cc-switch/claude-accounts/`
- **Permissions**: create `~/.cc-switch/` with mode `700`
- **Never delete `~/.claude`** directly - only swap symlinks

## Tech Stack

- Node.js + TypeScript
- Commander.js for CLI parsing
- Native `fs` for symlink operations (fs.symlink, fs.rename, fs.readlink)
- No heavy dependencies

## Package

- Name: `cc-switch`
- Binary: `cc-switch`
- Install: `npm install -g cc-switch`
