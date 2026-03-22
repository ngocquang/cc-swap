import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import {
  listAccounts,
  addAccount,
  switchAccount,
  removeAccount,
  nextAccount,
} from "../src/accounts.js";

interface TestEnv {
  tmp: string;
  ccSwitchDir: string;
  accountsDir: string;
  currentFile: string;
  claudeDir: string;
}

function makeTmpEnv(): TestEnv {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cc-switch-test-"));
  const ccSwitchDir = path.join(tmp, ".cc-switch");
  const accountsDir = path.join(ccSwitchDir, "claude-accounts");
  const currentFile = path.join(ccSwitchDir, ".current");
  const claudeDir = path.join(tmp, ".claude");
  return { tmp, ccSwitchDir, accountsDir, currentFile, claudeDir };
}

describe("listAccounts", () => {
  let env: TestEnv;

  beforeEach(() => {
    env = makeTmpEnv();
    fs.mkdirSync(env.accountsDir, { recursive: true });
  });

  afterEach(() => { fs.rmSync(env.tmp, { recursive: true, force: true }); });

  it("returns empty array when no accounts", async () => {
    expect(await listAccounts(env.accountsDir)).toEqual([]);
  });

  it("returns sorted account names", async () => {
    fs.mkdirSync(path.join(env.accountsDir, "work"));
    fs.mkdirSync(path.join(env.accountsDir, "default"));
    fs.mkdirSync(path.join(env.accountsDir, "personal"));
    expect(await listAccounts(env.accountsDir)).toEqual(["default", "personal", "work"]);
  });

  it("ignores files, only returns directories", async () => {
    fs.mkdirSync(path.join(env.accountsDir, "real"));
    fs.writeFileSync(path.join(env.accountsDir, "fake.txt"), "");
    expect(await listAccounts(env.accountsDir)).toEqual(["real"]);
  });
});

describe("addAccount", () => {
  let env: TestEnv;

  beforeEach(() => {
    env = makeTmpEnv();
    fs.mkdirSync(env.claudeDir);
    fs.mkdirSync(path.join(env.claudeDir, "hooks"));
    fs.writeFileSync(path.join(env.claudeDir, "settings.json"), "{}");
  });

  afterEach(() => { fs.rmSync(env.tmp, { recursive: true, force: true }); });

  it("creates account with symlinks pointing back to ~/.claude", async () => {
    await addAccount("work", env);

    const workDir = path.join(env.accountsDir, "work");
    expect(fs.existsSync(workDir)).toBe(true);
    expect(fs.readlinkSync(path.join(workDir, "hooks"))).toBe(path.join(env.claudeDir, "hooks"));
    expect(fs.readlinkSync(path.join(workDir, "settings.json"))).toBe(
      path.join(env.claudeDir, "settings.json")
    );
  });

  it("does NOT modify ~/.claude", async () => {
    await addAccount("work", env);

    // ~/.claude items are still real
    expect(fs.lstatSync(path.join(env.claudeDir, "hooks")).isSymbolicLink()).toBe(false);
    expect(fs.lstatSync(path.join(env.claudeDir, "settings.json")).isSymbolicLink()).toBe(false);
  });

  it("sets first account as current", async () => {
    await addAccount("work", env);
    expect((await fsPromises.readFile(env.currentFile, "utf-8")).trim()).toBe("work");
  });

  it("does not change current when adding subsequent accounts", async () => {
    await addAccount("work", env);
    await addAccount("personal", env);
    expect((await fsPromises.readFile(env.currentFile, "utf-8")).trim()).toBe("work");
  });

  it("rejects duplicate name", async () => {
    await addAccount("work", env);
    await expect(addAccount("work", env)).rejects.toThrow(/already exists/i);
  });
});

describe("switchAccount", () => {
  let env: TestEnv;

  beforeEach(async () => {
    env = makeTmpEnv();
    fs.mkdirSync(env.accountsDir, { recursive: true });
    fs.mkdirSync(path.join(env.accountsDir, "default"));
    fs.mkdirSync(path.join(env.accountsDir, "work"));
    fs.mkdirSync(env.claudeDir);
    await fsPromises.writeFile(env.currentFile, "default\n");
  });

  afterEach(() => { fs.rmSync(env.tmp, { recursive: true, force: true }); });

  it("updates .current to target account", async () => {
    await switchAccount("work", env);
    expect((await fsPromises.readFile(env.currentFile, "utf-8")).trim()).toBe("work");
  });

  it("throws if account does not exist", async () => {
    await expect(switchAccount("nonexistent", env)).rejects.toThrow(/does not exist/i);
  });

  it("returns already-active message when switching to current", async () => {
    const result = await switchAccount("default", env);
    expect(result).toMatch(/already active/i);
  });
});

describe("nextAccount", () => {
  it("returns next account in sorted list", () => {
    expect(nextAccount("default", ["default", "personal", "work"])).toBe("personal");
  });

  it("wraps to first account at end of list", () => {
    expect(nextAccount("work", ["default", "personal", "work"])).toBe("default");
  });

  it("returns null if only one account", () => {
    expect(nextAccount("default", ["default"])).toBeNull();
  });
});

describe("removeAccount", () => {
  let env: TestEnv;

  beforeEach(async () => {
    env = makeTmpEnv();
    fs.mkdirSync(env.accountsDir, { recursive: true });
    fs.mkdirSync(path.join(env.accountsDir, "default"));
    fs.mkdirSync(path.join(env.accountsDir, "work"));
    fs.mkdirSync(env.claudeDir);
    await fsPromises.writeFile(env.currentFile, "default\n");
  });

  afterEach(() => { fs.rmSync(env.tmp, { recursive: true, force: true }); });

  it("removes non-active account directory", async () => {
    await removeAccount("work", env);
    expect(fs.existsSync(path.join(env.accountsDir, "work"))).toBe(false);
  });

  it("throws if trying to remove active account", async () => {
    await expect(removeAccount("default", env)).rejects.toThrow(/currently active/i);
  });

  it("throws if account does not exist", async () => {
    await expect(removeAccount("nonexistent", env)).rejects.toThrow(/does not exist/i);
  });

  it("throws if it is the last account (not active)", async () => {
    fs.rmSync(path.join(env.accountsDir, "default"), { recursive: true });
    await fsPromises.writeFile(env.currentFile, "other\n");
    await expect(removeAccount("work", {
      accountsDir: env.accountsDir,
      currentFile: env.currentFile,
    })).rejects.toThrow(/last remaining/i);
  });
});
