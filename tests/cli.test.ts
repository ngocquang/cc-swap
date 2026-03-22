import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const CLI = path.resolve("dist/cli.js");

function run(args: string[], env: Record<string, string> = {}): string {
  return execFileSync(process.execPath, [CLI, ...args], {
    cwd: path.resolve("."),
    env: { ...process.env, ...env },
    encoding: "utf-8",
  }).trim();
}

describe("CLI integration", () => {
  let tmp: string;
  let testEnv: Record<string, string>;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cc-swap-cli-"));
    // Create fake ~/.claude with some items
    const claudeDir = path.join(tmp, ".claude");
    fs.mkdirSync(claudeDir);
    fs.mkdirSync(path.join(claudeDir, "hooks"));
    fs.writeFileSync(path.join(claudeDir, "settings.json"), "{}");

    testEnv = {
      CC_SWAP_HOME: tmp,
      CC_SWAP_CLAUDE_DIR: claudeDir,
      CC_SWAP_NO_LAUNCH: "1",
    };
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("list shows no accounts before init", () => {
    const out = run(["list"], testEnv);
    expect(out).toMatch(/no accounts/i);
  });

  it("add creates account with symlinks to ~/.claude", () => {
    const out = run(["add", "work"], testEnv);
    expect(out).toMatch(/added.*work/i);

    const listOut = run(["list"], testEnv);
    expect(listOut).toContain("work");
    expect(listOut).toContain("active");
  });

  it("switch changes active account", () => {
    run(["add", "work"], testEnv);
    run(["add", "personal"], testEnv);
    const out = run(["switch", "personal"], testEnv);
    expect(out).toMatch(/switched to.*personal/i);
  });

  it("no-args round-robin switches to next", () => {
    run(["add", "work"], testEnv);
    run(["add", "personal"], testEnv);
    const out = run([], testEnv);
    expect(out).toMatch(/switched/i);
  });

  it("switch nonexistent account exits with code 1", () => {
    expect(() => run(["switch", "nonexistent"], testEnv)).toThrow();
  });

  it("add duplicate name exits with code 1", () => {
    run(["add", "work"], testEnv);
    expect(() => run(["add", "work"], testEnv)).toThrow();
  });
});
