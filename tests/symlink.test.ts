import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { populateAccount, readCurrent, writeCurrent } from "../src/symlink.js";
import { DEFAULT_ITEMS } from "../src/items.js";

const TEST_ITEMS = [...DEFAULT_ITEMS];

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "cc-swap-test-"));
}

describe("populateAccount", () => {
  let tmp: string;
  let claudeDir: string;
  let accountDir: string;

  beforeEach(() => {
    tmp = makeTmpDir();
    claudeDir = path.join(tmp, ".claude");
    accountDir = path.join(tmp, "account-work");
    fs.mkdirSync(claudeDir);
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("creates symlinks in account dir pointing back to claude dir", async () => {
    fs.mkdirSync(path.join(claudeDir, "hooks"));
    fs.mkdirSync(path.join(claudeDir, "plugins"));

    await populateAccount(claudeDir, accountDir, TEST_ITEMS);

    // Account items are symlinks pointing to ~/.claude
    expect(fs.readlinkSync(path.join(accountDir, "hooks"))).toBe(path.join(claudeDir, "hooks"));
    expect(fs.readlinkSync(path.join(accountDir, "plugins"))).toBe(path.join(claudeDir, "plugins"));
  });

  it("skips items that do not exist in claude dir", async () => {
    fs.mkdirSync(path.join(claudeDir, "hooks"));
    // "plugins" does not exist in claudeDir

    await populateAccount(claudeDir, accountDir, TEST_ITEMS);

    expect(fs.existsSync(path.join(accountDir, "plugins"))).toBe(false);
    expect(fs.readlinkSync(path.join(accountDir, "hooks"))).toBe(path.join(claudeDir, "hooks"));
  });

  it("does not overwrite existing items in account (custom overrides)", async () => {
    fs.mkdirSync(path.join(claudeDir, "hooks"));
    fs.mkdirSync(accountDir);
    // Account has its own custom hooks (override)
    fs.mkdirSync(path.join(accountDir, "hooks"));
    fs.writeFileSync(path.join(accountDir, "hooks", "custom.sh"), "#!/bin/bash");

    await populateAccount(claudeDir, accountDir, TEST_ITEMS);

    // Should NOT be a symlink — the custom override is preserved
    expect(fs.lstatSync(path.join(accountDir, "hooks")).isSymbolicLink()).toBe(false);
    expect(fs.existsSync(path.join(accountDir, "hooks", "custom.sh"))).toBe(true);
  });

  it("handles settings.json as file symlink", async () => {
    fs.writeFileSync(path.join(claudeDir, "settings.json"), '{"test":true}');

    await populateAccount(claudeDir, accountDir, TEST_ITEMS);

    expect(fs.readlinkSync(path.join(accountDir, "settings.json"))).toBe(
      path.join(claudeDir, "settings.json")
    );
  });

  it("creates account dir if it does not exist", async () => {
    fs.mkdirSync(path.join(claudeDir, "hooks"));

    await populateAccount(claudeDir, accountDir, TEST_ITEMS);

    expect(fs.existsSync(accountDir)).toBe(true);
  });

  it("does not touch ~/.claude (source of truth)", async () => {
    fs.mkdirSync(path.join(claudeDir, "hooks"));
    fs.writeFileSync(path.join(claudeDir, "settings.json"), "{}");

    await populateAccount(claudeDir, accountDir, TEST_ITEMS);

    // ~/.claude items are still real, not symlinks
    expect(fs.lstatSync(path.join(claudeDir, "hooks")).isSymbolicLink()).toBe(false);
    expect(fs.lstatSync(path.join(claudeDir, "settings.json")).isSymbolicLink()).toBe(false);
  });
});

describe("readCurrent / writeCurrent", () => {
  let tmp: string;
  let currentFile: string;

  beforeEach(() => {
    tmp = makeTmpDir();
    currentFile = path.join(tmp, ".current");
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("writes and reads current account name", async () => {
    await writeCurrent(currentFile, "work");
    expect(await readCurrent(currentFile)).toBe("work");
  });

  it("returns null when file does not exist", async () => {
    expect(await readCurrent(currentFile)).toBeNull();
  });

  it("returns null for empty file", async () => {
    await fsPromises.writeFile(currentFile, "");
    expect(await readCurrent(currentFile)).toBeNull();
  });

  it("trims whitespace", async () => {
    await fsPromises.writeFile(currentFile, "  work \n");
    expect(await readCurrent(currentFile)).toBe("work");
  });
});
