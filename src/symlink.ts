import fsPromises from "node:fs/promises";

/** Atomically replaces linkPath symlink to point to newTarget.
 *  Creates a temp symlink first, then uses rename (POSIX-atomic). */
export async function atomicSwap(linkPath: string, newTarget: string): Promise<void> {
  const tmpLink = linkPath + ".tmp-" + process.pid;
  try {
    await fsPromises.symlink(newTarget, tmpLink);
    await fsPromises.rename(tmpLink, linkPath);
  } catch (err) {
    // Best-effort cleanup of temp symlink
    await fsPromises.unlink(tmpLink).catch(() => undefined);
    throw err;
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
