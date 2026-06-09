import { describe, expect, it } from "vitest";
import {
  addHistoryEntry,
  addTranscriptEntry,
  createMemoryStorageAdapter,
  createSurfaceHistory,
  createSurfaceTranscript
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
});
