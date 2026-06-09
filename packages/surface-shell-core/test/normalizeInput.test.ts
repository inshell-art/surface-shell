import { describe, expect, it } from "vitest";
import { normalizeInput } from "../src/index.js";

describe("normalizeInput", () => {
  it("trims leading and trailing whitespace", () => {
    expect(normalizeInput("  config direct  ")).toBe("config direct");
  });

  it("preserves internal whitespace", () => {
    expect(normalizeInput("config   direct\tkey")).toBe("config   direct\tkey");
  });

  it("returns an empty string for blank input", () => {
    expect(normalizeInput(" \n\t ")).toBe("");
  });
});
