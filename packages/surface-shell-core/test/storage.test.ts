import { describe, expect, it } from "vitest";
import {
  addHistoryEntry,
  addTranscriptEntry,
  createSurfaceShell,
  createMemoryStorageAdapter,
  createSurfaceHistory,
  createSurfaceTranscript,
  type SurfaceRedactionRule
} from "../src/index.js";

describe("storage and capped collections", () => {
  it("sets, gets, and removes memory storage entries", async () => {
    const storage = createMemoryStorageAdapter();
    await storage.setItem("key", "value");
    await expect(Promise.resolve(storage.getItem("key"))).resolves.toBe("value");
    await storage.removeItem("key");
    await expect(Promise.resolve(storage.getItem("key"))).resolves.toBeNull();
  });

  it("caps history at the configured limit", () => {
    let history = createSurfaceHistory(2);
    history = addHistoryEntry(history, { input: "one", rawInput: "one", kind: "command", at: "1" }, 2);
    history = addHistoryEntry(history, { input: "two", rawInput: "two", kind: "command", at: "2" }, 2);
    history = addHistoryEntry(history, { input: "three", rawInput: "three", kind: "command", at: "3" }, 2);
    expect(history.map((entry) => entry.input)).toEqual(["two", "three"]);
  });

  it("caps transcript at the configured limit", () => {
    let transcript = createSurfaceTranscript(1);
    transcript = addTranscriptEntry(transcript, { input: "one", output: "one", inputKind: "command", at: "1" }, 1);
    transcript = addTranscriptEntry(transcript, { input: "two", output: "two", inputKind: "command", at: "2" }, 1);
    expect(transcript.map((entry) => entry.input)).toEqual(["two"]);
  });

  it("stores command history only and caps persisted turns after redaction", async () => {
    const secretRule: SurfaceRedactionRule = {
      id: "secret",
      pattern: /^\/?secret\s+\S+/i,
      replacement: "/secret [redacted]"
    };
    const shell = createSurfaceShell({
      shellId: "storage-fixture",
      displayName: "Storage Fixture",
      mode: "question-first",
      commandPrefix: "/",
      historyLimit: 3,
      transcriptLimit: 3,
      redactionRules: [secretRule],
      getState: () => ({}),
      getPrompt: () => ">",
      handleQuestion: (_ctx, question) => ({ kind: "return", body: question }),
      root: [
        { id: "one", path: ["one"], title: "one", run: () => ({ kind: "return", body: "one" }) },
        { id: "two", path: ["two"], title: "two", run: () => ({ kind: "return", body: "two" }) },
        { id: "three", path: ["three"], title: "three", run: () => ({ kind: "return", body: "three" }) },
        { id: "four", path: ["four"], title: "four", run: () => ({ kind: "return", body: "four" }) },
        { id: "secret", path: ["secret"], title: "secret", run: () => ({ kind: "return", body: "secret sk-1" }) }
      ]
    });

    await shell.dispatch("plain question");
    await shell.dispatch("/one");
    await shell.dispatch("/two");
    await shell.dispatch("/three");
    await shell.dispatch("/four");
    await shell.dispatch("/secret sk-test");

    expect(shell.getHistory().map((entry) => entry.input)).toEqual(["/three", "/four", "/secret [redacted]"]);
    expect(shell.getTranscript()).toHaveLength(3);
    expect(shell.getTranscript().at(-1)?.input).toBe("/secret [redacted]");
    expect(shell.getTranscript().at(-1)?.output).not.toContain("sk-test");
  });
});
