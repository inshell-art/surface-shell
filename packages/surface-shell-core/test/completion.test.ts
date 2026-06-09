import { describe, expect, it } from "vitest";
import { createSurfaceShell, getCommandCompletions, type SurfaceCommandNode } from "../src/index.js";

const root: SurfaceCommandNode[] = [
  {
    id: "config",
    path: ["config"],
    title: "config",
    aliases: ["cfg"],
    children: [
      { id: "browser", path: ["config", "browser"], title: "browser" },
      { id: "api", path: ["config", "api"], title: "api" }
    ]
  },
  { id: "corpus", path: ["corpus"], title: "corpus" },
  { id: "legacy", path: ["legacy"], title: "legacy", hidden: true }
];

describe("completion", () => {
  it("returns top-level completions", () => {
    const completions = getCommandCompletions("", { config: commandFirst() });
    expect(completions.map((completion) => completion.value)).toEqual(["config", "corpus"]);
  });

  it("returns nested completions", () => {
    const completions = getCommandCompletions("config ", { config: commandFirst() });
    expect(completions.map((completion) => completion.value)).toEqual(["config browser", "config api"]);
  });

  it("includes aliases only when requested", () => {
    const withoutAliases = getCommandCompletions("c", { config: commandFirst() });
    const withAliases = getCommandCompletions("c", { config: commandFirst(), includeAliases: true });
    expect(withoutAliases.map((completion) => completion.kind)).toEqual(["command", "command"]);
    expect(withAliases.some((completion) => completion.kind === "alias" && completion.value === "cfg")).toBe(true);
  });

  it("includes dynamic completions", () => {
    const completions = getCommandCompletions("config ", {
      config: commandFirst(),
      dynamic: [{ value: "return", kind: "next-action", label: "return response" }]
    });
    expect(completions.at(-1)).toMatchObject({ value: "return", kind: "next-action" });
  });

  it("adds slash prefixes for question-first shells", () => {
    const shell = createSurfaceShell({
      shellId: "ask",
      displayName: "Ask",
      mode: "question-first",
      commandPrefix: "/",
      historyLimit: 10,
      transcriptLimit: 10,
      getState: () => ({}),
      getPrompt: () => "> ",
      root
    });

    expect(shell.getCompletions("/").map((completion) => completion.value)).toEqual(["/config", "/corpus"]);
    expect(shell.getCompletions("/co").map((completion) => completion.value)).toEqual(["/config", "/corpus"]);
  });

  it("adds state-driven next-action completions from the app callback", () => {
    const shell = createSurfaceShell({
      shellId: "waiting",
      displayName: "Waiting",
      mode: "command-first",
      commandPrefix: null,
      historyLimit: 10,
      transcriptLimit: 10,
      getState: () => ({ waiting: true }),
      getPrompt: () => ">",
      getDynamicCompletions: () => [
        { value: "return", kind: "next-action", label: "return response" },
        { value: "cancel", kind: "next-action", label: "cancel response" }
      ],
      root
    });

    expect(shell.getCompletions("").filter((completion) => completion.kind === "next-action")).toEqual([
      { value: "return", kind: "next-action", label: "return response" },
      { value: "cancel", kind: "next-action", label: "cancel response" }
    ]);
  });
});

function commandFirst() {
  return {
    mode: "command-first" as const,
    commandPrefix: null,
    root
  };
}
