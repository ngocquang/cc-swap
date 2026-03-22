import fsPromises from "node:fs/promises";
import path from "node:path";
import { SWITCH_ITEMS } from "./items.js";

/** Switch all SWITCH_ITEMS inside claudeDir to point to accountDir.
 *  For each item: ~/.claude/<item> becomes a symlink → accountDir/<item> */
export async function switchItems(claudeDir: string, accountDir: string): Promise<void> {
  for (const item of SWITCH_ITEMS) {
    const link = path.join(claudeDir, item);
    const target = path.join(accountDir, item);

    // Only create symlink if the target exists in the account
    const targetExists = await fsPromises.access(target).then(() => true).catch(() => false);
    if (!targetExists) continue;

    // Check existing item at link path
    const linkStat = await fsPromises.lstat(link).catch(() => null);
    if (linkStat) {
      if (linkStat.isSymbolicLink()) {
        await fsPromises.unlink(link);
      } else {
        // Real file/dir that wasn't moved — skip to avoid data loss
        continue;
      }
    }

    await fsPromises.symlink(target, link);
  }
}

/** Move real items from claudeDir into accountDir (first-time setup).
 *  Only moves items that exist and are NOT already symlinks. */
export async function moveItemsToAccount(claudeDir: string, accountDir: string): Promise<void> {
  await fsPromises.mkdir(accountDir, { recursive: true, mode: 0o700 });

  for (const item of SWITCH_ITEMS) {
    const src = path.join(claudeDir, item);
    const dest = path.join(accountDir, item);

    const stat = await fsPromises.lstat(src).catch(() => null);
    if (!stat || stat.isSymbolicLink()) continue;

    await fsPromises.rename(src, dest);
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
