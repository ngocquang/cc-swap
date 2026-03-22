import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const CLI = path.resolve("src/cli.ts");
const TSX = path.resolve("node_modules/.bin/tsx");

function run(args: string[], env: Record<string, string> = {}): string {
  return execFileSync(TSX, [CLI, ...args], {
    cwd: path.resolve("."),
    env: { ...process.env, ...env },
    encoding: "utf-8",
  }).trim();
}

describe("CLI integration", () => {
  let tmp: string;
  let testEnv: Record<string, string>;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cc-switch-cli-"));
    testEnv = {
      CC_SWITCH_HOME: tmp,
      CC_SWITCH_CLAUDE_DIR: path.join(tmp, ".claude"),
    };
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("list shows no accounts before init", () => {
    const out = run(["list"], testEnv);
    expect(out).toMatch(/no accounts/i);
  });

  it("add creates first account and default", () => {
    fs.mkdirSync(path.join(tmp, ".claude"));
    const out = run(["add", "work"], testEnv);
    expect(out).toMatch(/added.*work/i);
    const listOut = run(["list"], testEnv);
    expect(listOut).toContain("default");
    expect(listOut).toContain("work");
  });

  it("switch changes active account", () => {
    fs.mkdirSync(path.join(tmp, ".claude"));
    run(["add", "work"], testEnv);
    const out = run(["switch", "work"], testEnv);
    expect(out).toMatch(/switched to.*work/i);
  });

  it("no-args round-robin switches to next", () => {
    fs.mkdirSync(path.join(tmp, ".claude"));
    run(["add", "work"], testEnv);
    const out = run([], testEnv);
    expect(out).toMatch(/switched/i);
  });

  it("switch nonexistent account exits with code 1", () => {
    expect(() => run(["switch", "nonexistent"], testEnv)).toThrow();
  });

  it("add 'default' as first account name exits with code 1", () => {
    fs.mkdirSync(path.join(tmp, ".claude"));
    expect(() => run(["add", "default"], testEnv)).toThrow();
  });
});
