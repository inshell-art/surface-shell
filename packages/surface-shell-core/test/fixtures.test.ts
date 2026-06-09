import { describe, expect, it } from "vitest";
import { createAskLikeFixture, createThoughtLikeFixture } from "./fixtures/shellFixtures.js";

describe("fixture shells", () => {
  it("validates the command-first THOUGHT-like shape", async () => {
    const { shell } = createThoughtLikeFixture();

    expect(shell.parse("config direct provider openai")).toMatchObject({
      kind: "command",
      commandPath: ["config", "direct", "provider"],
      remainder: "openai"
    });
    expect(shell.parse("mybrain")).toMatchObject({
      kind: "command",
      commandPath: ["config", "my-brain"]
    });
    expect(shell.parse("mode direct")).toMatchObject({
      kind: "command",
      commandPath: ["config", "direct"]
    });

    const config = await shell.dispatch("config");
    expect(config.state).toContainEqual({ label: "route", value: "none", status: "missing" });
    expect(config.sections?.find((section) => section.title === "choose")?.lines).toEqual([
      "config local",
      "config connect",
      "config direct",
      "config my-brain"
    ]);

    const run = await shell.dispatch("run");
    expect(run.next).toContainEqual({ command: "prompt <text>" });

    const mint = await shell.dispatch("mint");
    expect(mint.next).toContainEqual({ command: "run" });
  });

  it("validates the question-first Ask-like shape", async () => {
    const { shell, state } = createAskLikeFixture();

    await expect(shell.dispatch("what is PATH?")).resolves.toMatchObject({
      kind: "return",
      title: "question",
      body: "handled: what is PATH?"
    });
    expect(state.questions).toEqual(["what is PATH?"]);

    const config = await shell.dispatch("/config");
    expect(config.body).toContain("A model runtime is optional.");
    expect(config.sections?.find((section) => section.title === "choose")?.lines).toEqual([
      "/config browser",
      "/config localhost",
      "/config api",
      "/config clear"
    ]);

    const corpus = await shell.dispatch("/corpus");
    expect(corpus.state).toContainEqual({ label: "sources", value: "2" });

    await expect(shell.dispatch("/config search")).resolves.toMatchObject({
      title: "unknown command",
      body: "unknown command: /config search"
    });
  });
});
