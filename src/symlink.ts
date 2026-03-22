import fsPromises from "node:fs/promises";
import path from "node:path";
import { SWITCH_ITEMS } from "./items.js";

/** Create an account directory populated with symlinks back to claudeDir (the source of truth).
 *  For each SWITCH_ITEM: accountDir/<item> → claudeDir/<item> */
export async function populateAccount(claudeDir: string, accountDir: string): Promise<void> {
  await fsPromises.mkdir(accountDir, { recursive: true, mode: 0o700 });

  for (const item of SWITCH_ITEMS) {
    const source = path.join(claudeDir, item);
    const link = path.join(accountDir, item);

    // Only create symlink if the item exists in ~/.claude
    const sourceExists = await fsPromises.access(source).then(() => true).catch(() => false);
    if (!sourceExists) continue;

    // Don't overwrite if account already has this item (could be a custom override)
    const linkExists = await fsPromises.access(link).then(() => true).catch(() => false);
    if (linkExists) continue;

    await fsPromises.symlink(source, link);
  }
}

/** Reads the active account name from a .current file. Returns null if missing or empty. */
export async function readCurrent(filePath: string): Promise<string | null> {
  try {
    const content = (await fsPromises.readFile(filePath, "utf-8")).trim();
    return content || null;
  } catch {
    return null;
  }
}

/** Writes the active account name to a .current file. */
export async function writeCurrent(filePath: string, name: string): Promise<void> {
  await fsPromises.writeFile(filePath, name + "\n", { mode: 0o600 });
}
