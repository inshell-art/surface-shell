import { describe, expect, it } from "vitest";
import { createSurfaceShell, describeSideEffect, type SurfaceSideEffectKind } from "../src/index.js";

describe("side-effect gates", () => {
  it("supports app-agnostic gate kinds as metadata", () => {
    const kinds: SurfaceSideEffectKind[] = ["none", "read", "network", "external-model", "wallet", "contract", "write"];

    expect(
      kinds.map((kind) =>
        describeSideEffect({
          kind,
          requiresExplicitCommand: kind !== "none",
          requiresConfirmation: kind === "contract"
        })
      )
    ).toEqual([
      "none",
      "read explicit command required",
      "network explicit command required",
      "external-model explicit command required",
      "wallet explicit command required",
      "contract explicit command required requires confirmation",
      "write explicit command required"
    ]);
  });

  it("preserves explicit and confirmation requirements without executing side effects", async () => {
    let executed = false;
    const shell = createSurfaceShell({
      shellId: "side-effect-fixture",
      displayName: "Side Effect Fixture",
      mode: "command-first",
      commandPrefix: null,
      historyLimit: 10,
      transcriptLimit: 10,
      getState: () => ({}),
      getPrompt: () => ">",
      root: [
        {
          id: "admin",
          path: ["admin"],
          title: "admin",
          children: [
            {
              id: "admin-confirm",
              path: ["admin", "confirm"],
              title: "confirm",
              sideEffect: {
                kind: "contract",
                requiresExplicitCommand: true,
                requiresConfirmation: true,
                warning: "Requires an explicit command."
              },
              run: () => {
                executed = true;
                return { kind: "return", body: "done" };
              }
            }
          ]
        }
      ]
    });

    const help = await shell.dispatch("admin");
    expect(help.warnings).toContain("admin confirm: Requires an explicit command.");
    expect(executed).toBe(false);

    const result = await shell.dispatch("admin confirm");
    expect(executed).toBe(true);
    expect(result.events).toContainEqual(
      expect.objectContaining({
        type: "sideEffect.declared",
        sideEffect: expect.objectContaining({
          kind: "contract",
          requiresExplicitCommand: true,
          requiresConfirmation: true
        })
      })
    );
  });
});
