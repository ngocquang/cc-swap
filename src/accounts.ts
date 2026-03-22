import fsPromises from "node:fs/promises";
import path from "node:path";
import { validateName } from "./validate.js";
import { populateAccount, readCurrent, writeCurrent } from "./symlink.js";

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

  const accountsExist = await fsPromises.access(accountsDir).then(() => true).catch(() => false);

  if (!accountsExist) {
    await fsPromises.mkdir(accountsDir, { recursive: true, mode: 0o700 });
    if (ccSwitchDir) {
      await fsPromises.chmod(ccSwitchDir, 0o700);
    }
  }

  const target = path.join(accountsDir, name);
  const exists = await fsPromises.access(target).then(() => true).catch(() => false);
  if (exists) throw new Error(`Account '${name}' already exists`);

  // Create account dir with symlinks pointing back to ~/.claude
  await populateAccount(claudeDir, target);

  // Set as current if this is the first account
  const current = await readCurrent(currentFile);
  if (!current) {
    await writeCurrent(currentFile, name);
  }
}

export async function switchAccount(
  name: string,
  paths: Pick<AccountPaths, "claudeDir" | "accountsDir" | "currentFile">
): Promise<string> {
  const nameErr = validateName(name);
  if (nameErr) throw new Error(nameErr);

  const { accountsDir, currentFile } = paths;
  const target = path.join(accountsDir, name);

  const exists = await fsPromises.access(target).then(() => true).catch(() => false);
  if (!exists) throw new Error(`Account '${name}' does not exist`);

  const current = await readCurrent(currentFile);
  if (current === name) return `'${name}' is already active`;

  await writeCurrent(currentFile, name);
  return `Switched to: ${name}`;
}

export async function removeAccount(
  name: string,
  paths: Pick<AccountPaths, "accountsDir" | "currentFile">
): Promise<void> {
  const nameErr = validateName(name);
  if (nameErr) throw new Error(nameErr);

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
