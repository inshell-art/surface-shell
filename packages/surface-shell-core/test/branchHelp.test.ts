import { describe, expect, it } from "vitest";
import { createSurfaceShell, renderBranchHelp, renderText, type SurfaceCommandNode } from "../src/index.js";

describe("branchHelp", () => {
  it("renders state, child choices, next actions, and side-effect warnings", async () => {
    const confirmNode: SurfaceCommandNode = {
      id: "confirm",
      path: ["mint", "confirm"],
      title: "confirm",
      sideEffect: {
        kind: "contract-write",
        label: "mint transaction",
        requiresExplicitCommand: true,
        requiresConfirmation: true,
        warning: "Submits a mint transaction."
      }
    };
    const mintNode: SurfaceCommandNode = {
      id: "mint",
      path: ["mint"],
      title: "mint",
      children: [confirmNode]
    };
    mintNode.renderHelp = (ctx) =>
      renderBranchHelp(mintNode, ctx, {
        state: [{ label: "wallet", value: "not connected", status: "missing" }],
        next: [{ command: "wallet connect", preferred: true }]
      });
    const shell = createSurfaceShell({
      shellId: "thought",
      displayName: "THOUGHT",
      mode: "command-first",
      commandPrefix: null,
      historyLimit: 10,
      transcriptLimit: 10,
      getState: () => ({}),
      getPrompt: () => "thought> ",
      root: [mintNode]
    });

    const result = await shell.dispatch("mint");
    expect(renderText(result)).toContain("state\n  wallet  not connected");
    expect(renderText(result)).toContain("choose\n  mint confirm");
    expect(renderText(result)).toContain("next\n  wallet connect");
    expect(result.warnings).toContain("mint confirm: Submits a mint transaction.");
  });
});
