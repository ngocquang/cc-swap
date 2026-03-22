import { homedir } from "node:os";
import { join } from "node:path";

// Allow path overrides via env vars (used in tests)
const HOME = process.env.CC_SWAP_HOME ?? homedir();

export const CLAUDE_DIR = process.env.CC_SWAP_CLAUDE_DIR ?? join(HOME, ".claude");
export const CC_SWAP_DIR = join(HOME, ".cc-swap");
export const ACCOUNTS_DIR = join(CC_SWAP_DIR, "claude-accounts");
export const CURRENT_FILE = join(CC_SWAP_DIR, ".current");
export const CONFIG_FILE = join(CC_SWAP_DIR, "config.json");
