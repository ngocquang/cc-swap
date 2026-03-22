import { describe, it, expect } from "vitest";
import { validateName } from "../src/validate.js";

describe("validateName", () => {
  it("accepts valid names", () => {
    expect(validateName("work")).toBeNull();
    expect(validateName("my_account")).toBeNull();
    expect(validateName("account-2")).toBeNull();
    expect(validateName("A1")).toBeNull();
  });

  it("rejects empty name", () => {
    expect(validateName("")).toMatch(/cannot be empty/i);
  });

  it("rejects names starting with dot", () => {
    expect(validateName(".hidden")).toMatch(/cannot start with/i);
  });

  it("rejects names starting with hyphen", () => {
    expect(validateName("-bad")).toMatch(/cannot start with/i);
  });

  it("rejects names with invalid characters", () => {
    expect(validateName("has space")).toMatch(/only contain/i);
    expect(validateName("has/slash")).toMatch(/only contain/i);
    expect(validateName("a@b")).toMatch(/only contain/i);
  });

  it("rejects names over 50 chars", () => {
    expect(validateName("a".repeat(51))).toMatch(/50 characters/i);
  });
});
