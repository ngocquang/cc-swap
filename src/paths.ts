import { homedir } from "node:os";
import { join } from "node:path";

// Allow path overrides via env vars (used in tests)
const HOME = process.env.CC_SWITCH_HOME ?? homedir();

export const CLAUDE_DIR = process.env.CC_SWITCH_CLAUDE_DIR ?? join(HOME, ".claude");
export const CC_SWITCH_DIR = join(HOME, ".cc-switch");
export const ACCOUNTS_DIR = join(CC_SWITCH_DIR, "claude-accounts");
export const CURRENT_FILE = join(CC_SWITCH_DIR, ".current");
