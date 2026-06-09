import {
  createSurfaceShell,
  renderBranchHelp,
  type SurfaceCommandNode,
  type SurfaceRedactionRule
} from "@inshell/surface-shell-core";

type ThoughtState = {
  route: "direct" | "local" | "connect";
  provider: string | null;
  keySet: boolean;
  model: string | null;
  walletConnected: boolean;
  pathSelected: boolean;
  authorization: "missing" | "ready";
};

const state: ThoughtState = {
  route: "direct",
  provider: "openai",
  keySet: true,
  model: "gpt-4.1",
  walletConnected: false,
  pathSelected: false,
  authorization: "missing"
};

const redactionRules: SurfaceRedactionRule[] = [
  {
    id: "thought-direct-key",
    pattern: /^(key|config key|config direct key)\s+\S+/i,
    replacement: "$1 <redacted>",
    suppressHistory: true,
    suppressTranscript: true
  }
];

const configDirectNode: SurfaceCommandNode<ThoughtState> = {
  id: "config-direct",
  path: ["config", "direct"],
  title: "direct",
  children: [
    { id: "provider", path: ["config", "direct", "provider"], title: "provider" },
    {
      id: "key",
      path: ["config", "direct", "key"],
      title: "key",
      run: (_ctx, remainder) => ({
        kind: "return",
        body: remainder ? "direct key stored" : "missing api key",
        suppressHistory: true
      })
    },
    { id: "model", path: ["config", "direct", "model"], title: "model" }
  ]
};

configDirectNode.renderHelp = (ctx) =>
  renderBranchHelp(configDirectNode, ctx, {
    state: [
      { label: "provider", value: ctx.state.provider ?? "not set", status: ctx.state.provider ? "ok" : "missing" },
      { label: "key", value: ctx.state.keySet ? "set" : "not set", status: ctx.state.keySet ? "ok" : "missing" },
      { label: "model", value: ctx.state.model ?? "not set", status: ctx.state.model ? "ok" : "missing" }
    ],
    next: [
      { command: "config direct provider list" },
      { command: "config direct provider <id>" },
      { command: "config direct key <api-key>" },
      { command: "config direct key clear" },
      { command: "config direct model list" },
      { command: "config direct model <id>" }
    ]
  });

const configNode: SurfaceCommandNode<ThoughtState> = {
  id: "config",
  path: ["config"],
  title: "config",
  children: [
    { id: "local", path: ["config", "local"], title: "local" },
    { id: "connect", path: ["config", "connect"], title: "connect" },
    configDirectNode,
    { id: "my-brain", path: ["config", "my-brain"], title: "my-brain", aliases: ["mybrain"] }
  ]
};

configNode.renderHelp = (ctx) =>
  renderBranchHelp(configNode, ctx, {
    state: [
      { label: "route", value: ctx.state.route },
      { label: "provider", value: ctx.state.provider ?? "not set" },
      { label: "key", value: ctx.state.keySet ? "set" : "not set" },
      { label: "model", value: ctx.state.model ?? "not set" }
    ],
    next: [{ command: "run" }]
  });

const mintNode: SurfaceCommandNode<ThoughtState> = {
  id: "mint",
  path: ["mint"],
  title: "mint",
  children: [
    {
      id: "confirm",
      path: ["mint", "confirm"],
      title: "confirm",
      sideEffect: {
        kind: "contract-write",
        label: "mint transaction",
        requiresExplicitCommand: true,
        requiresConfirmation: true,
        warning: "Submits ThoughtNFT.mint(...)."
      }
    }
  ]
};

mintNode.renderHelp = (ctx) =>
  renderBranchHelp(mintNode, ctx, {
    state: [
      { label: "wallet", value: ctx.state.walletConnected ? "connected" : "not connected", status: "missing" },
      { label: "PATH", value: ctx.state.pathSelected ? "selected" : "not selected", status: "missing" },
      { label: "authorization", value: ctx.state.authorization, status: "missing" }
    ],
    next: [{ command: "wallet connect", preferred: true }]
  });

export const thoughtSurfaceShell = createSurfaceShell<ThoughtState>({
  shellId: "thought",
  displayName: "THOUGHT",
  mode: "command-first",
  commandPrefix: null,
  historyLimit: 100,
  transcriptLimit: 100,
  redactionRules,
  getState: () => state,
  getPrompt: () => "thought> ",
  root: [
    configNode,
    mintNode,
    { id: "wallet", path: ["wallet"], title: "wallet" },
    { id: "run", path: ["run"], title: "run" },
    { id: "help", path: ["help"], title: "help" }
  ]
});
