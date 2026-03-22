import fsPromises from "node:fs/promises";
import path from "node:path";
import { validateName } from "./validate.js";
import { switchItems, moveItemsToAccount, readCurrent, writeCurrent } from "./symlink.js";

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

    // Move real items from ~/.claude into default account
    await moveItemsToAccount(claudeDir, defaultDir);

    // Create symlinks from ~/.claude/<item> → default/<item>
    await switchItems(claudeDir, defaultDir);

    await writeCurrent(currentFile, "default");

    // Create empty new account directory
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

  // Switch all items inside ~/.claude to point to the new account
  await switchItems(claudeDir, target);
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
