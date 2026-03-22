import fsPromises from "node:fs/promises";
import path from "node:path";
import { validateName } from "./validate.js";
import { atomicSwap, readCurrent, writeCurrent } from "./symlink.js";

interface AccountPaths {
  claudeDir: string;
  ccSwitchDir?: string;
  accountsDir: string;
  currentFile: string;
}

export async function listAccounts(accountsDir: string): Promise<string[]> {
  try {
    const entries = await fsPromises.readdir(accountsDir, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  } catch {
    return [];
  }
}

export function nextAccount(current: string, accounts: string[]): string | null {
  if (accounts.length <= 1) return null;
  const idx = accounts.indexOf(current);
  return accounts[(idx + 1) % accounts.length];
}

export async function addAccount(name: string, paths: AccountPaths): Promise<void> {
  const { claudeDir, ccSwitchDir, accountsDir, currentFile } = paths;

  const nameErr = validateName(name);
  if (nameErr) throw new Error(nameErr);

  const isFirstTime = !(await fsPromises.access(accountsDir).then(() => true).catch(() => false));

  if (isFirstTime) {
    if (name === "default") {
      throw new Error("'default' is reserved for your current Claude config during first-time setup");
    }

    await fsPromises.mkdir(accountsDir, { recursive: true, mode: 0o700 });
    if (ccSwitchDir) {
      await fsPromises.chmod(ccSwitchDir, 0o700);
    }

    const defaultDir = path.join(accountsDir, "default");
    let claudeExists = false;
    let claudeIsSymlink = false;

    try {
      const stat = await fsPromises.lstat(claudeDir);
      claudeExists = true;
      claudeIsSymlink = stat.isSymbolicLink();
    } catch {
      claudeExists = false;
    }

    if (claudeExists && claudeIsSymlink) {
      throw new Error(
        "~/.claude is already a symlink. cc-switch may already be set up, or another tool manages it."
      );
    }

    if (claudeExists) {
      await fsPromises.rename(claudeDir, defaultDir);
    } else {
      await fsPromises.mkdir(defaultDir, { mode: 0o700 });
    }

    await fsPromises.symlink(defaultDir, claudeDir);
    await writeCurrent(currentFile, "default");
    await fsPromises.mkdir(path.join(accountsDir, name), { mode: 0o700 });
  } else {
    const target = path.join(accountsDir, name);
    const exists = await fsPromises.access(target).then(() => true).catch(() => false);
    if (exists) throw new Error(`Account '${name}' already exists`);
    await fsPromises.mkdir(target, { mode: 0o700 });
  }
}

export async function switchAccount(
  name: string,
  paths: Pick<AccountPaths, "claudeDir" | "accountsDir" | "currentFile">
): Promise<string> {
  const { claudeDir, accountsDir, currentFile } = paths;
  const target = path.join(accountsDir, name);

  const exists = await fsPromises.access(target).then(() => true).catch(() => false);
  if (!exists) throw new Error(`Account '${name}' does not exist`);

  const current = await readCurrent(currentFile);
  if (current === name) return `'${name}' is already active`;

  const resolved = path.resolve(target);
  if (!resolved.startsWith(path.resolve(accountsDir) + path.sep)) {
    throw new Error("Invalid account path");
  }

  await atomicSwap(claudeDir, target);
  await writeCurrent(currentFile, name);
  return `Switched to: ${name}`;
}

export async function removeAccount(
  name: string,
  paths: Pick<AccountPaths, "accountsDir" | "currentFile">
): Promise<void> {
  const { accountsDir, currentFile } = paths;
  const target = path.join(accountsDir, name);

  const exists = await fsPromises.access(target).then(() => true).catch(() => false);
  if (!exists) throw new Error(`Account '${name}' does not exist`);

  const current = await readCurrent(currentFile);
  if (current === name) {
    throw new Error(`Cannot remove '${name}' — it is currently active. Switch to another account first.`);
  }

  const all = await listAccounts(accountsDir);
  if (all.length <= 1) {
    throw new Error(`Cannot remove '${name}' — it is the last remaining account.`);
  }

  await fsPromises.rm(target, { recursive: true, force: true });
}
