import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { switchItems, moveItemsToAccount, readCurrent, writeCurrent } from "../src/symlink.js";

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "cc-switch-test-"));
}

describe("switchItems", () => {
  let tmp: string;
  let claudeDir: string;
  let accountDir: string;

  beforeEach(() => {
    tmp = makeTmpDir();
    claudeDir = path.join(tmp, ".claude");
    accountDir = path.join(tmp, "account-work");
    fs.mkdirSync(claudeDir);
    fs.mkdirSync(accountDir);
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("creates symlinks for items that exist in account", async () => {
    fs.mkdirSync(path.join(accountDir, "hooks"));
    fs.mkdirSync(path.join(accountDir, "plugins"));

    await switchItems(claudeDir, accountDir);

    expect(fs.readlinkSync(path.join(claudeDir, "hooks"))).toBe(path.join(accountDir, "hooks"));
    expect(fs.readlinkSync(path.join(claudeDir, "plugins"))).toBe(path.join(accountDir, "plugins"));
  });

  it("skips items that do not exist in account", async () => {
    fs.mkdirSync(path.join(accountDir, "hooks"));
    // "plugins" does not exist in account

    await switchItems(claudeDir, accountDir);

    expect(fs.existsSync(path.join(claudeDir, "plugins"))).toBe(false);
  });

  it("replaces existing symlinks", async () => {
    const otherDir = path.join(tmp, "other");
    fs.mkdirSync(otherDir);
    fs.mkdirSync(path.join(otherDir, "hooks"));
    fs.mkdirSync(path.join(accountDir, "hooks"));

    // Create initial symlink
    fs.symlinkSync(path.join(otherDir, "hooks"), path.join(claudeDir, "hooks"));

    await switchItems(claudeDir, accountDir);

    expect(fs.readlinkSync(path.join(claudeDir, "hooks"))).toBe(path.join(accountDir, "hooks"));
  });

  it("does not overwrite real (non-symlink) items", async () => {
    fs.mkdirSync(path.join(claudeDir, "hooks"));
    fs.writeFileSync(path.join(claudeDir, "hooks", "keep.txt"), "data");
    fs.mkdirSync(path.join(accountDir, "hooks"));

    await switchItems(claudeDir, accountDir);

    // Real dir should still be there, not replaced
    expect(fs.lstatSync(path.join(claudeDir, "hooks")).isSymbolicLink()).toBe(false);
    expect(fs.existsSync(path.join(claudeDir, "hooks", "keep.txt"))).toBe(true);
  });

  it("handles settings.json as file symlink", async () => {
    fs.writeFileSync(path.join(accountDir, "settings.json"), '{"test":true}');

    await switchItems(claudeDir, accountDir);

    expect(fs.readlinkSync(path.join(claudeDir, "settings.json"))).toBe(
      path.join(accountDir, "settings.json")
    );
  });
});

describe("moveItemsToAccount", () => {
  let tmp: string;
  let claudeDir: string;
  let accountDir: string;

  beforeEach(() => {
    tmp = makeTmpDir();
    claudeDir = path.join(tmp, ".claude");
    accountDir = path.join(tmp, "account-default");
    fs.mkdirSync(claudeDir);
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("moves real items from claude dir to account dir", async () => {
    fs.mkdirSync(path.join(claudeDir, "hooks"));
    fs.writeFileSync(path.join(claudeDir, "hooks", "test.sh"), "#!/bin/bash");
    fs.writeFileSync(path.join(claudeDir, "settings.json"), "{}");

    await moveItemsToAccount(claudeDir, accountDir);

    expect(fs.existsSync(path.join(accountDir, "hooks", "test.sh"))).toBe(true);
    expect(fs.existsSync(path.join(accountDir, "settings.json"))).toBe(true);
    // Original should be gone (moved)
    expect(fs.existsSync(path.join(claudeDir, "hooks"))).toBe(false);
    expect(fs.existsSync(path.join(claudeDir, "settings.json"))).toBe(false);
  });

  it("skips symlinks (does not move them)", async () => {
    const elsewhere = path.join(tmp, "elsewhere");
    fs.mkdirSync(elsewhere);
    fs.symlinkSync(elsewhere, path.join(claudeDir, "hooks"));

    await moveItemsToAccount(claudeDir, accountDir);

    // Symlink should still be in claudeDir
    expect(fs.lstatSync(path.join(claudeDir, "hooks")).isSymbolicLink()).toBe(true);
    expect(fs.existsSync(path.join(accountDir, "hooks"))).toBe(false);
  });

  it("creates account dir if it does not exist", async () => {
    fs.mkdirSync(path.join(claudeDir, "plugins"));

    await moveItemsToAccount(claudeDir, accountDir);

    expect(fs.existsSync(accountDir)).toBe(true);
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
