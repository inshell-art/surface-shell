import {
  createSurfaceShell,
  renderBranchHelp,
  type SurfaceCommandNode,
  type SurfaceRedactionRule,
  type SurfaceShell
} from "../../src/index.js";

export type ThoughtLikeState = {
  route: "local" | "connect" | "direct" | null;
  provider: string | null;
  keySet: boolean;
  model: string | null;
  prompt: string;
  wallet: "connected" | "disconnected";
  currentWork: string | null;
  selectedPath: string | null;
  authorized: boolean;
  waitingForBrain: boolean;
};

export type AskLikeState = {
  modelRuntime: "none" | "browser" | "localhost" | "api";
  using: "Corpus Search";
  corpusVersion: string;
  sources: number;
  chunks: number;
  questions: string[];
};

export type Fixture<TState> = {
  shell: SurfaceShell<TState>;
  state: TState;
};

export function createThoughtLikeFixture(overrides: Partial<ThoughtLikeState> = {}): Fixture<ThoughtLikeState> {
  const state: ThoughtLikeState = {
    route: null,
    provider: null,
    keySet: false,
    model: null,
    prompt: "",
    wallet: "disconnected",
    currentWork: null,
    selectedPath: null,
    authorized: false,
    waitingForBrain: false,
    ...overrides
  };

  const configDirectNode: SurfaceCommandNode<ThoughtLikeState> = {
    id: "config-direct",
    path: ["config", "direct"],
    title: "direct",
    children: [
      {
        id: "config-direct-provider",
        path: ["config", "direct", "provider"],
        title: "provider",
        run: (_ctx, remainder) => {
          state.provider = remainder || null;
          if (remainder) {
            state.route = "direct";
          }
          return { kind: "return", body: remainder ? "provider stored" : "provider missing" };
        }
      },
      {
        id: "config-direct-key",
        path: ["config", "direct", "key"],
        title: "key",
        run: (_ctx, remainder) => {
          if (remainder === "clear") {
            state.keySet = false;
            return { kind: "return", body: "key cleared" };
          }
          state.keySet = Boolean(remainder);
          return { kind: "return", body: state.keySet ? "key stored" : "key missing", suppressHistory: true };
        }
      },
      {
        id: "config-direct-model",
        path: ["config", "direct", "model"],
        title: "model",
        run: (_ctx, remainder) => {
          state.model = remainder || null;
          return { kind: "return", body: remainder ? "model stored" : "model missing" };
        }
      }
    ]
  };

  configDirectNode.renderHelp = (ctx) =>
    renderBranchHelp(configDirectNode, ctx, {
      state: [
        {
          label: "provider",
          value: ctx.state.provider ?? "none",
          status: ctx.state.provider ? "ok" : "missing"
        },
        { label: "key", value: ctx.state.keySet ? "set" : "none", status: ctx.state.keySet ? "ok" : "missing" },
        { label: "model", value: ctx.state.model ?? "none", status: ctx.state.model ? "ok" : "missing" }
      ],
      next: [
        { command: "config direct provider <id>" },
        { command: "config direct key <api-key>" },
        { command: "config direct model <id>" }
      ]
    });

  const configNode: SurfaceCommandNode<ThoughtLikeState> = {
    id: "config",
    path: ["config"],
    title: "config",
    children: [
      {
        id: "config-local",
        path: ["config", "local"],
        title: "local",
        children: [
          { id: "config-local-detect", path: ["config", "local", "detect"], title: "detect" },
          { id: "config-local-endpoint", path: ["config", "local", "endpoint"], title: "endpoint" },
          { id: "config-local-model", path: ["config", "local", "model"], title: "model" }
        ]
      },
      {
        id: "config-connect",
        path: ["config", "connect"],
        title: "connect",
        children: [
          { id: "config-connect-authorize", path: ["config", "connect", "authorize"], title: "authorize" },
          { id: "config-connect-disconnect", path: ["config", "connect", "disconnect"], title: "disconnect" },
          { id: "config-connect-model", path: ["config", "connect", "model"], title: "model" }
        ]
      },
      configDirectNode,
      {
        id: "config-my-brain",
        path: ["config", "my-brain"],
        title: "my-brain",
        aliases: ["mybrain"]
      }
    ]
  };

  configNode.renderHelp = (ctx) =>
    renderBranchHelp(configNode, ctx, {
      state: [
        { label: "route", value: ctx.state.route ?? "none", status: ctx.state.route ? "ok" : "missing" },
        { label: "model", value: ctx.state.model ?? "none", status: ctx.state.model ? "ok" : "missing" }
      ]
    });

  const pathNode: SurfaceCommandNode<ThoughtLikeState> = {
    id: "path",
    path: ["path"],
    title: "path",
    children: [
      { id: "path-list", path: ["path", "list"], title: "list" },
      { id: "path-select", path: ["path", "select"], title: "select" }
    ]
  };

  pathNode.renderHelp = (ctx) =>
    renderBranchHelp(pathNode, ctx, {
      state: [
        {
          label: "selected path",
          value: ctx.state.selectedPath ?? "none",
          status: ctx.state.selectedPath ? "ok" : "missing"
        }
      ],
      next: [{ command: "path list" }]
    });

  const mintNode: SurfaceCommandNode<ThoughtLikeState> = {
    id: "mint",
    path: ["mint"],
    title: "mint",
    children: [
      {
        id: "mint-confirm",
        path: ["mint", "confirm"],
        title: "confirm",
        sideEffect: {
          kind: "contract",
          requiresExplicitCommand: true,
          requiresConfirmation: true,
          warning: "Submits a generic contract action."
        }
      }
    ]
  };

  mintNode.renderHelp = (ctx) =>
    renderBranchHelp(mintNode, ctx, {
      state: [
        {
          label: "current work",
          value: ctx.state.currentWork ?? "none",
          status: ctx.state.currentWork ? "ok" : "missing"
        },
        { label: "wallet", value: ctx.state.wallet },
        { label: "authorization", value: ctx.state.authorized ? "ready" : "missing", status: "missing" }
      ],
      next: ctx.state.currentWork ? [{ command: "authorize" }] : [{ command: "run" }]
    });

  const modeAliasNode: SurfaceCommandNode<ThoughtLikeState> = {
    id: "mode",
    path: ["mode"],
    title: "mode",
    hidden: true,
    children: [
      {
        id: "mode-direct",
        path: ["mode", "direct"],
        title: "direct",
        canonicalPath: ["config", "direct"],
        renderHelp: configDirectNode.renderHelp
      }
    ]
  };

  const root: SurfaceCommandNode<ThoughtLikeState>[] = [
    configNode,
    modeAliasNode,
    {
      id: "mybrain",
      path: ["mybrain"],
      title: "my-brain",
      canonicalPath: ["config", "my-brain"],
      hidden: true
    },
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
        if (!state.prompt) {
          return {
            kind: "guidance",
            title: "run",
            state: [{ label: "prompt", value: "missing", status: "missing" }],
            next: [{ command: "prompt <text>" }]
          };
        }

        if (!state.route || !state.model) {
          return {
            kind: "guidance",
            title: "run",
            state: [
              { label: "route", value: state.route ?? "missing", status: state.route ? "ok" : "missing" },
              { label: "model", value: state.model ?? "missing", status: state.model ? "ok" : "missing" }
            ],
            next: [{ command: "config" }]
          };
        }

        state.currentWork = "work.fixture";
        return { kind: "return", title: "run", body: "work created" };
      }
    },
    { id: "work", path: ["work"], title: "work" },
    mintNode,
    pathNode,
    {
      id: "authorize",
      path: ["authorize"],
      title: "authorize",
      sideEffect: {
        kind: "wallet",
        requiresExplicitCommand: true,
        requiresConfirmation: true,
        warning: "Requests a generic wallet authorization."
      },
      run: () => {
        state.authorized = true;
        return { kind: "return", body: "authorized" };
      }
    },
    {
      id: "confirm",
      path: ["confirm"],
      title: "confirm",
      sideEffect: {
        kind: "contract",
        requiresExplicitCommand: true,
        requiresConfirmation: true,
        warning: "Submits a generic contract action."
      },
      run: () => {
        if (!state.authorized) {
          return {
            kind: "blocked",
            title: "confirm",
            state: [{ label: "authorization", value: "missing", status: "missing" }],
            next: [{ command: "authorize" }]
          };
        }
        return { kind: "return", body: "confirmed" };
      }
    },
    { id: "current", path: ["current"], title: "current" },
    { id: "help", path: ["help"], title: "help", run: () => ({ kind: "guidance", title: "help" }) }
  ];

  const redactionRules: SurfaceRedactionRule[] = [
    {
      id: "fixture-command-key",
      pattern: /^(key|config key|config direct key)\s+(?!clear\b|<api-key>\s*$)\S+/i,
      replacement: "$1 [redacted]",
      suppressHistory: true,
      suppressTranscript: true
    },
    {
      id: "fixture-output-secret",
      pattern: /sk-[A-Za-z0-9-]+/g,
      replacement: "[redacted]"
    }
  ];

  return {
    state,
    shell: createSurfaceShell<ThoughtLikeState>({
      shellId: "fixture.thought-like",
      displayName: "THOUGHT-like Fixture",
      mode: "command-first",
      commandPrefix: null,
      historyLimit: 3,
      transcriptLimit: 3,
      redactionRules,
      getState: () => state,
      getPrompt: () => "thought>",
      getDynamicCompletions: () =>
        state.waitingForBrain
          ? [
              { value: "return", kind: "next-action", label: "return response" },
              { value: "cancel", kind: "next-action", label: "cancel response" }
            ]
          : [],
      root
    })
  };
}

export function createAskLikeFixture(overrides: Partial<AskLikeState> = {}): Fixture<AskLikeState> {
  const state: AskLikeState = {
    modelRuntime: "none",
    using: "Corpus Search",
    corpusVersion: "vfixture",
    sources: 2,
    chunks: 5,
    questions: [],
    ...overrides
  };

  const configNode: SurfaceCommandNode<AskLikeState> = {
    id: "config",
    path: ["config"],
    title: "config",
    children: [
      { id: "config-browser", path: ["config", "browser"], title: "browser" },
      {
        id: "config-localhost",
        path: ["config", "localhost"],
        title: "localhost",
        children: [{ id: "config-localhost-detect", path: ["config", "localhost", "detect"], title: "detect" }]
      },
      {
        id: "config-api",
        path: ["config", "api"],
        title: "api",
        sideEffect: {
          kind: "external-model",
          requiresExplicitCommand: true,
          warning: "May send a question and evidence to a configured provider."
        },
        children: [
          {
            id: "config-api-key",
            path: ["config", "api", "key"],
            title: "key",
            run: () => ({ kind: "return", body: "api key stored", suppressHistory: true, suppressTranscript: true })
          }
        ]
      },
      {
        id: "config-clear",
        path: ["config", "clear"],
        title: "clear",
        run: () => {
          state.modelRuntime = "none";
          return {
            kind: "return",
            title: "config",
            state: [
              { label: "model runtime", value: state.modelRuntime },
              { label: "using", value: state.using }
            ]
          };
        }
      }
    ]
  };

  configNode.renderHelp = (ctx) =>
    renderBranchHelp(configNode, ctx, {
      body: "Ask works now with Corpus Search.\nA model runtime is optional.",
      state: [
        { label: "model runtime", value: ctx.state.modelRuntime },
        { label: "using", value: ctx.state.using },
        { label: "corpus", value: ctx.state.corpusVersion }
      ]
    });

  const corpusSourcesNode: SurfaceCommandNode<AskLikeState> = {
    id: "corpus-sources",
    path: ["corpus", "sources"],
    title: "sources",
    run: (ctx) => ({ kind: "return", title: "sources", body: String(ctx.state.sources) })
  };

  const corpusNode: SurfaceCommandNode<AskLikeState> = {
    id: "corpus",
    path: ["corpus"],
    title: "corpus",
    children: [
      corpusSourcesNode,
      { id: "corpus-source", path: ["corpus", "source"], title: "source" },
      { id: "corpus-chunks", path: ["corpus", "chunks"], title: "chunks" },
      { id: "corpus-manifest", path: ["corpus", "manifest"], title: "manifest" }
    ]
  };

  corpusNode.renderHelp = (ctx) =>
    renderBranchHelp(corpusNode, ctx, {
      state: [
        { label: "corpus", value: ctx.state.corpusVersion },
        { label: "sources", value: String(ctx.state.sources) },
        { label: "chunks", value: String(ctx.state.chunks) }
      ]
    });

  const root: SurfaceCommandNode<AskLikeState>[] = [
    configNode,
    corpusNode,
    {
      id: "sources",
      path: ["sources"],
      title: "sources",
      canonicalPath: ["corpus", "sources"],
      hidden: true,
      run: corpusSourcesNode.run
    },
    { id: "trace", path: ["trace"], title: "trace" },
    { id: "runtime", path: ["runtime"], title: "runtime" },
    { id: "doctor", path: ["doctor"], title: "doctor" },
    { id: "help", path: ["help"], title: "help", run: () => ({ kind: "guidance", title: "help" }) }
  ];

  const redactionRules: SurfaceRedactionRule[] = [
    {
      id: "fixture-ask-api-key",
      pattern: /^\/config\s+api\s+key\s+\S+/i,
      replacement: "/config api key [redacted]",
      suppressHistory: true,
      suppressTranscript: true
    },
    {
      id: "fixture-ask-inline-key",
      pattern: /^\/config\s+api\b.*\bkey=\S+/i,
      replacement: "/config api [redacted]",
      suppressHistory: true
    },
    {
      id: "fixture-ask-output-secret",
      pattern: /sk-[A-Za-z0-9-]+/g,
      replacement: "[redacted]"
    }
  ];

  return {
    state,
    shell: createSurfaceShell<AskLikeState>({
      shellId: "fixture.ask-like",
      displayName: "Ask-like Fixture",
      mode: "question-first",
      commandPrefix: "/",
      historyLimit: 3,
      transcriptLimit: 3,
      redactionRules,
      getState: () => state,
      getPrompt: () => ">",
      handleQuestion: (_ctx, question) => {
        state.questions.push(question);
        return { kind: "return", title: "question", body: `handled: ${question}` };
      },
      root
    })
  };
}
