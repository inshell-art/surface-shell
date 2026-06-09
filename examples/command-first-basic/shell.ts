import {
  createCommandNode,
  createCommandTree,
  createSurfaceShell,
  renderBranchHelp,
  type SurfaceCommandNode
} from "@inshell/surface-shell-core";

type ExampleState = {
  route: "local" | "direct" | null;
  model: string | null;
  prompt: string;
};

const state: ExampleState = {
  route: null,
  model: null,
  prompt: ""
};

const configNode: SurfaceCommandNode<ExampleState> = createCommandNode({
  id: "config",
  path: ["config"],
  title: "config",
  children: [
    {
      id: "config-local",
      path: ["config", "local"],
      title: "local",
      run: () => {
        state.route = "local";
        return { kind: "return", body: "route set to local" };
      }
    },
    {
      id: "config-direct",
      path: ["config", "direct"],
      title: "direct",
      run: () => {
        state.route = "direct";
        return { kind: "return", body: "route set to direct" };
      }
    }
  ]
});

configNode.renderHelp = (ctx) =>
  renderBranchHelp(configNode, ctx, {
    state: [
      { label: "route", value: ctx.state.route ?? "none" },
      { label: "model", value: ctx.state.model ?? "none" }
    ]
  });

export const commandFirstBasicShell = createSurfaceShell<ExampleState>({
  shellId: "example.command-first-basic",
  displayName: "Command First Basic",
  mode: "command-first",
  commandPrefix: null,
  historyLimit: 100,
  transcriptLimit: 100,
  getState: () => state,
  getPrompt: () => "example> ",
  root: createCommandTree([
    configNode,
    {
      id: "prompt",
      path: ["prompt"],
      title: "prompt",
      run: (_ctx, remainder) => {
        state.prompt = remainder;
        return { kind: "return", body: "prompt stored" };
      }
    },
    {
      id: "run",
      path: ["run"],
      title: "run",
      run: () => {
        const missing = [
          !state.prompt ? "prompt" : null,
          !state.route ? "route" : null
        ].filter(Boolean) as string[];

        if (missing.length > 0) {
          return {
            kind: "guidance",
            title: "run unavailable",
            sections: [{ title: "missing", lines: missing }],
            next: [{ command: "prompt <text>" }, { command: "config" }]
          };
        }

        return { kind: "return", title: "run", body: "ready" };
      }
    },
    { id: "current", path: ["current"], title: "current", run: () => ({ kind: "return", body: state.prompt }) },
    { id: "help", path: ["help"], title: "help", run: () => ({ kind: "guidance", title: "help" }) }
  ])
});
