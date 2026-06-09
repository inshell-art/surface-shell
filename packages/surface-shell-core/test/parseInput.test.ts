import { describe, expect, it } from "vitest";
import { parseInput, type SurfaceCommandNode } from "../src/index.js";

const commandRoot: SurfaceCommandNode[] = [
  {
    id: "config",
    path: ["config"],
    title: "config",
    children: [
      {
        id: "direct",
        path: ["config", "direct"],
        title: "direct",
        children: [{ id: "key", path: ["config", "direct", "key"], title: "key" }]
      }
    ]
  },
  { id: "help", path: ["help"], title: "help" }
];

describe("parseInput", () => {
  it("parses blank input", () => {
    expect(parseInput("   ", commandFirst()).kind).toBe("blank");
  });

  it("parses command-first commands with raw remainder", () => {
    const result = parseInput("config direct key sk-123", commandFirst());
    expect(result).toMatchObject({
      kind: "command",
      commandPath: ["config", "direct", "key"],
      remainder: "sk-123"
    });
  });

  it("matches command heads case-insensitively by default", () => {
    const result = parseInput("CONFIG direct", commandFirst());
    expect(result).toMatchObject({
      kind: "command",
      commandPath: ["config", "direct"]
    });
  });

  it("returns unknown for command-first misses", () => {
    const result = parseInput("missing thing", commandFirst());
    expect(result).toMatchObject({
      kind: "unknown",
      commandPath: ["missing"],
      remainder: "thing"
    });
  });

  it("parses question-first natural language as a question", () => {
    const result = parseInput("what is PATH?", questionFirst());
    expect(result).toMatchObject({
      kind: "question",
      question: "what is PATH?"
    });
  });

  it("parses question-first slash commands", () => {
    const result = parseInput("/config direct", questionFirst());
    expect(result).toMatchObject({
      kind: "command",
      commandPath: ["config", "direct"],
      prefix: "/",
      remainder: ""
    });
  });

  it("returns unknown for unknown slash commands", () => {
    const result = parseInput("/missing", questionFirst());
    expect(result).toMatchObject({
      kind: "unknown",
      commandPath: ["missing"],
      prefix: "/"
    });
  });
});

function commandFirst() {
  return {
    mode: "command-first" as const,
    commandPrefix: null,
    root: commandRoot
  };
}

function questionFirst() {
  return {
    mode: "question-first" as const,
    commandPrefix: "/",
    root: commandRoot
  };
}
