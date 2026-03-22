import fsPromises from "node:fs/promises";
import path from "node:path";

/** Create an account directory populated with symlinks back to claudeDir.
 *  Uses the provided syncItems list (from config). */
export async function populateAccount(claudeDir: string, accountDir: string, syncItems: string[]): Promise<void> {
  await fsPromises.mkdir(accountDir, { recursive: true, mode: 0o700 });

  for (const item of syncItems) {
    const source = path.join(claudeDir, item);
    const link = path.join(accountDir, item);

    const sourceExists = await fsPromises.access(source).then(() => true).catch(() => false);
    if (!sourceExists) continue;

    const linkExists = await fsPromises.access(link).then(() => true).catch(() => false);
    if (linkExists) continue;

    await fsPromises.symlink(source, link);
  }
}

export async function readCurrent(filePath: string): Promise<string | null> {
  try {
    const content = (await fsPromises.readFile(filePath, "utf-8")).trim();
    return content || null;
  } catch {
    return null;
  }
}

export async function writeCurrent(filePath: string, name: string): Promise<void> {
  await fsPromises.writeFile(filePath, name + "\n", { mode: 0o600 });
}
