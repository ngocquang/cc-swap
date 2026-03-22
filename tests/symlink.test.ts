import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { atomicSwap, readCurrent, writeCurrent } from "../src/symlink.js";

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "cc-switch-test-"));
}

describe("atomicSwap", () => {
  let tmp: string;
  let link: string;
  let targetA: string;
  let targetB: string;

  beforeEach(() => {
    tmp = makeTmpDir();
    link = path.join(tmp, "link");
    targetA = path.join(tmp, "a");
    targetB = path.join(tmp, "b");
    fs.mkdirSync(targetA);
    fs.mkdirSync(targetB);
    fs.symlinkSync(targetA, link);
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("swaps symlink to new target", async () => {
    await atomicSwap(link, targetB);
    expect(fs.readlinkSync(link)).toBe(targetB);
  });

  it("old target directory still exists after swap", async () => {
    await atomicSwap(link, targetB);
    expect(fs.existsSync(targetA)).toBe(true);
  });

  it("works when link does not exist yet", async () => {
    fs.unlinkSync(link);
    await atomicSwap(link, targetB);
    expect(fs.readlinkSync(link)).toBe(targetB);
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
