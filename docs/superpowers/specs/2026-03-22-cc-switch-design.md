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
2. List folders in `claude-accounts/`, sorted alphabetically
3. Find the next account in the list (wrap to first if at end)
4. Remove symlink `~/.claude`, create new symlink to next account
5. Update `.current`
6. Print: `Switched: <old> → <new>`

### `cc-switch add <name>`

Add a new account.

**First-time behavior** (no `~/.cc-switch/` exists):
1. Create `~/.cc-switch/claude-accounts/`
2. Move `~/.claude` (real directory) → `~/.cc-switch/claude-accounts/default/`
3. Create symlink `~/.claude` → `~/.cc-switch/claude-accounts/default/`
4. Write `default` to `~/.cc-switch/.current`
5. Create empty `~/.cc-switch/claude-accounts/<name>/`

**Subsequent adds:**
1. Validate `<name>` doesn't already exist
2. Create empty `~/.cc-switch/claude-accounts/<name>/`

### `cc-switch switch <name>`

Switch to a specific account by name.

1. Validate `<name>` exists in `claude-accounts/`
2. Remove symlink `~/.claude`
3. Create symlink `~/.claude` → `~/.cc-switch/claude-accounts/<name>/`
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
2. Confirm with user (prompt y/n)
3. Remove `~/.cc-switch/claude-accounts/<name>/`

## Safety Checks

- **Before any symlink operation**: verify Claude Code is not running (check for running `claude` processes)
- **Before first `add`**: verify `~/.claude` exists and is a real directory (not already a symlink)
- **Validate account names**: alphanumeric, hyphens, underscores only
- **Never delete `~/.claude`** directly - only remove/create symlinks

## Tech Stack

- Node.js + TypeScript
- Commander.js for CLI parsing
- Native `fs` for symlink operations (fs.symlink, fs.unlink, fs.readlink)
- No heavy dependencies

## Package

- Name: `cc-switch`
- Binary: `cc-switch`
- Install: `npm install -g cc-switch`
