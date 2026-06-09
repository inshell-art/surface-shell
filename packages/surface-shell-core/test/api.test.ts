import { describe, expect, it } from "vitest";
import {
  appendHistoryEntry,
  appendTranscriptEntry,
  applyRedactionRules,
  createCommandNode,
  createCommandTree,
  createInFlightLock,
  createSurfaceShell,
  dispatchSurfaceInput,
  renderSurfaceReturnText,
  resolveCommandNode,
  withInFlightLock
} from "../src/index.js";

describe("public API aliases", () => {
  it("exposes command tree helpers", () => {
    const help = createCommandNode({ id: "help", path: ["help"], title: "help" });
    const root = createCommandTree([help]);

    expect(resolveCommandNode(root, "help")?.node).toBe(help);
  });

  it("dispatches through dispatchSurfaceInput", async () => {
    const shell = createSurfaceShell({
      shellId: "api",
      displayName: "API",
      mode: "command-first",
      commandPrefix: null,
      historyLimit: 10,
      transcriptLimit: 10,
      getState: () => ({}),
      getPrompt: () => ">",
      root: [{ id: "help", path: ["help"], title: "help", run: () => ({ kind: "return", body: "ok" }) }]
    });

    await expect(dispatchSurfaceInput(shell, "help")).resolves.toMatchObject({ kind: "return", body: "ok" });
  });

  it("exposes rendering, redaction, history, and transcript aliases", () => {
    expect(renderSurfaceReturnText({ kind: "return", title: "ok" })).toBe("ok");
    expect(applyRedactionRules("key secret", [{ id: "key", pattern: /secret/, replacement: "[redacted]" }]).text).toBe(
      "key [redacted]"
    );
    expect(
      appendHistoryEntry([], { input: "help", rawInput: "help", kind: "command", at: "now" }, 1).map(
        (entry) => entry.input
      )
    ).toEqual(["help"]);
    expect(
      appendTranscriptEntry([], { input: "help", output: "ok", inputKind: "command", at: "now" }, 1).map(
        (entry) => entry.output
      )
    ).toEqual(["ok"]);
  });

  it("exposes withInFlightLock", async () => {
    const lock = createInFlightLock();
    await expect(withInFlightLock(lock, async () => "done")).resolves.toBe("done");

    lock.tryAcquire();
    await expect(withInFlightLock(lock, async () => "blocked")).resolves.toBeNull();
    lock.release();
  });
});
