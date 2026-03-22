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

  afterEach(() => {
    fs.rmSync(env.tmp, { recursive: true, force: true });
  });

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

describe("addAccount - first time", () => {
  let env: TestEnv;

  beforeEach(() => { env = makeTmpEnv(); });
  afterEach(() => { fs.rmSync(env.tmp, { recursive: true, force: true }); });

  it("moves real ~/.claude to default, creates new account", async () => {
    fs.mkdirSync(env.claudeDir);
    fs.writeFileSync(path.join(env.claudeDir, "config.json"), "{}");

    await addAccount("work", env);

    expect(fs.existsSync(path.join(env.accountsDir, "default", "config.json"))).toBe(true);
    expect(fs.readlinkSync(env.claudeDir)).toBe(path.join(env.accountsDir, "default"));
    expect(fs.existsSync(path.join(env.accountsDir, "work"))).toBe(true);
    expect((await fsPromises.readFile(env.currentFile, "utf-8")).trim()).toBe("default");
  });

  it("creates empty default if ~/.claude does not exist", async () => {
    await addAccount("work", env);

    expect(fs.existsSync(path.join(env.accountsDir, "default"))).toBe(true);
    expect(fs.readlinkSync(env.claudeDir)).toBe(path.join(env.accountsDir, "default"));
  });

  it("throws if ~/.claude is already a symlink", async () => {
    fs.mkdirSync(path.join(env.tmp, "somewhere"));
    fs.symlinkSync(path.join(env.tmp, "somewhere"), env.claudeDir);

    await expect(addAccount("work", env)).rejects.toThrow(/already a symlink/i);
  });

  it("rejects name 'default'", async () => {
    await expect(addAccount("default", env)).rejects.toThrow(/reserved/i);
  });
});

describe("addAccount - subsequent", () => {
  let env: TestEnv;

  beforeEach(async () => {
    env = makeTmpEnv();
    fs.mkdirSync(env.accountsDir, { recursive: true });
    fs.mkdirSync(path.join(env.accountsDir, "default"));
    fs.symlinkSync(path.join(env.accountsDir, "default"), env.claudeDir);
    await fsPromises.writeFile(env.currentFile, "default\n");
  });

  afterEach(() => { fs.rmSync(env.tmp, { recursive: true, force: true }); });

  it("creates new account directory", async () => {
    await addAccount("personal", env);
    expect(fs.existsSync(path.join(env.accountsDir, "personal"))).toBe(true);
  });

  it("rejects duplicate name", async () => {
    fs.mkdirSync(path.join(env.accountsDir, "work"));
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
    fs.symlinkSync(path.join(env.accountsDir, "default"), env.claudeDir);
    await fsPromises.writeFile(env.currentFile, "default\n");
  });

  afterEach(() => { fs.rmSync(env.tmp, { recursive: true, force: true }); });

  it("switches symlink to target account", async () => {
    await switchAccount("work", env);
    expect(fs.readlinkSync(env.claudeDir)).toBe(path.join(env.accountsDir, "work"));
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

describe("switchAccount - stale .current", () => {
  let env: TestEnv;

  beforeEach(async () => {
    env = makeTmpEnv();
    fs.mkdirSync(env.accountsDir, { recursive: true });
    fs.mkdirSync(path.join(env.accountsDir, "work"));
    fs.symlinkSync(path.join(env.accountsDir, "work"), env.claudeDir);
    await fsPromises.writeFile(env.currentFile, "deleted\n");
  });

  afterEach(() => { fs.rmSync(env.tmp, { recursive: true, force: true }); });

  it("can still switch to a valid account even with stale .current", async () => {
    await switchAccount("work", env);
    expect(fs.readlinkSync(env.claudeDir)).toBe(path.join(env.accountsDir, "work"));
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
    fs.symlinkSync(path.join(env.accountsDir, "default"), env.claudeDir);
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
