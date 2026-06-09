import { describe, expect, it } from "vitest";
import { createSurfaceShell, renderBranchHelp, type SurfaceCommandNode } from "../src/index.js";

type TestState = {
  provider: string | null;
};

describe("dispatcher", () => {
  it("returns empty for blank dispatch", async () => {
    const shell = createShell();
    await expect(shell.dispatch("  ")).resolves.toMatchObject({ kind: "empty" });
    expect(shell.getHistory()).toEqual([]);
  });

  it("returns next action guidance for unknown commands", async () => {
    const shell = createShell();
    const result = await shell.dispatch("missing");
    expect(result).toMatchObject({
      kind: "guidance",
      title: "unknown command",
      next: [{ command: "help" }]
    });
  });

  it("dispatches branch help", async () => {
    const shell = createShell();
    const result = await shell.dispatch("config");
    expect(result).toMatchObject({
      kind: "guidance",
      title: "config",
      state: [{ label: "provider", value: "openai" }],
      next: [{ command: "config direct" }]
    });
  });

  it("passes raw remainder to handlers", async () => {
    const shell = createShell();
    const result = await shell.dispatch("prompt hello   world");
    expect(result).toMatchObject({
      kind: "return",
      body: "hello   world"
    });
  });

  it("blocks a second command while one is in flight", async () => {
    let release!: () => void;
    const done = new Promise<void>((resolve) => {
      release = resolve;
    });
    const root: SurfaceCommandNode<TestState>[] = [
      {
        id: "slow",
        path: ["slow"],
        title: "slow",
        run: async () => {
          await done;
          return { kind: "return", body: "done" };
        }
      }
    ];
    const shell = createShell(root);

    const first = shell.dispatch("slow");
    const second = await shell.dispatch("slow");
    expect(second.kind).toBe("blocked");

    release();
    await expect(first).resolves.toMatchObject({ kind: "return", body: "done" });
  });

  it("records command events in order", async () => {
    const shell = createShell();
    const result = await shell.dispatch("prompt hi");
    expect(result.events?.map((event) => event.type)).toEqual([
      "input.received",
      "command.started",
      "command.finished"
    ]);
  });

  it("returns a structured question handoff in question-first mode", async () => {
    const shell = createSurfaceShell({
      shellId: "ask",
      displayName: "Ask",
      mode: "question-first",
      commandPrefix: "/",
      historyLimit: 10,
      transcriptLimit: 10,
      getState: () => ({}),
      getPrompt: () => "> ",
      root: [{ id: "help", path: ["help"], title: "help" }]
    });

    await expect(shell.dispatch("What is PATH?")).resolves.toMatchObject({
      kind: "return",
      title: "question",
      body: "What is PATH?"
    });
  });
});

function createShell(root = defaultRoot()) {
  return createSurfaceShell<TestState>({
    shellId: "test",
    displayName: "Test",
    mode: "command-first",
    commandPrefix: null,
    historyLimit: 10,
    transcriptLimit: 10,
    getState: () => ({ provider: "openai" }),
    getPrompt: () => "test> ",
    root
  });
}

function defaultRoot(): SurfaceCommandNode<TestState>[] {
  const configNode: SurfaceCommandNode<TestState> = {
    id: "config",
    path: ["config"],
    title: "config",
    children: [{ id: "direct", path: ["config", "direct"], title: "direct" }]
  };
  configNode.renderHelp = (ctx) =>
    renderBranchHelp(configNode, ctx, {
      state: [{ label: "provider", value: ctx.state.provider ?? "not set" }],
      next: [{ command: "config direct" }]
    });

  return [
    configNode,
    {
      id: "prompt",
      path: ["prompt"],
      title: "prompt",
      run: (_ctx, remainder) => ({ kind: "return", body: remainder })
    },
    { id: "help", path: ["help"], title: "help", run: () => ({ kind: "return", body: "help" }) }
  ];
}
