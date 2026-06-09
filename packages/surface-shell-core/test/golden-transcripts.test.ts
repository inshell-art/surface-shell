import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { createAskLikeFixture, createThoughtLikeFixture } from "./fixtures/shellFixtures.js";

const testDir = dirname(fileURLToPath(import.meta.url));

describe("golden transcript qualities", () => {
  it("keeps the command-first local map stable", async () => {
    const { shell } = createThoughtLikeFixture();
    const golden = readGolden("command-first-basic.md");

    const config = shell.renderReturn(await shell.dispatch("config"));
    expect(config).toContain("config");
    expect(config).toContain("choose\n  config local\n  config connect\n  config direct\n  config my-brain");
    expect(golden).toContain(config);

    const direct = shell.renderReturn(await shell.dispatch("config direct"));
    expect(direct).toContain("provider  none");
    expect(direct).toContain("config direct key <api-key>");
    expect(golden).toContain(direct);

    const runBeforePrompt = await shell.dispatch("run");
    expect(runBeforePrompt.next).toContainEqual({ command: "prompt <text>" });

    await shell.dispatch("prompt THE SKY THINKS IN GREEN");
    const runAfterPrompt = shell.renderReturn(await shell.dispatch("run"));
    expect(runAfterPrompt).toContain("route  missing");
    expect(runAfterPrompt).toContain("model  missing");

    const mint = shell.renderReturn(await shell.dispatch("mint"));
    expect(mint).toContain("current work   none");
    expect(mint).toContain("next\n  run");

    const path = shell.renderReturn(await shell.dispatch("path"));
    expect(path).toContain("selected path  none");
    expect(path).toContain("path list");

    const confirm = await shell.dispatch("confirm");
    expect(confirm.kind).toBe("blocked");
    expect(confirm.next).toContainEqual({ command: "authorize" });
  });

  it("keeps the question-first local map stable", async () => {
    const { shell, state } = createAskLikeFixture();
    const golden = readGolden("question-first-basic.md");

    const config = shell.renderReturn(await shell.dispatch("/config"));
    expect(config).toContain("Ask works now with Corpus Search.");
    expect(config).toContain("/config browser");
    expect(config).toContain("/config api");
    expect(golden).toContain("Ask works now with Corpus Search.");

    const question = await shell.dispatch("what is PATH?");
    expect(question.body).toBe("handled: what is PATH?");
    expect(state.questions).toEqual(["what is PATH?"]);

    const corpus = shell.renderReturn(await shell.dispatch("/corpus"));
    expect(corpus).toContain("corpus   vfixture");
    expect(corpus).toContain("/corpus sources");
    expect(golden).toContain("corpus   vfixture");

    const sources = await shell.dispatch("/sources");
    expect(sources).toMatchObject({ kind: "return", title: "sources", body: "2" });

    const invalidRuntime = await shell.dispatch("/config search");
    expect(invalidRuntime).toMatchObject({
      kind: "guidance",
      title: "unknown command",
      body: "unknown command: /config search"
    });

    const clear = await shell.dispatch("/config clear");
    expect(clear.state).toContainEqual({ label: "model runtime", value: "none" });
    expect(clear.state).toContainEqual({ label: "using", value: "Corpus Search" });
  });
});

function readGolden(file: string): string {
  return readFileSync(join(testDir, "fixtures", "golden", file), "utf8");
}
