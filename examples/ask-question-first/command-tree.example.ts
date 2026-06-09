import {
  createSurfaceShell,
  renderBranchHelp,
  type SurfaceCommandNode,
  type SurfaceRedactionRule
} from "@inshell/surface-shell-core";

type AskState = {
  runtime: "none" | "browser" | "localhost" | "api";
  corpusName: string;
  sources: number;
  chunks: number;
};

const state: AskState = {
  runtime: "none",
  corpusName: "Inshell Public Corpus v2026.05.21.initial",
  sources: 11,
  chunks: 64
};

const redactionRules: SurfaceRedactionRule[] = [
  {
    id: "ask-api-key",
    pattern: /^\/config\s+api\s+key\s+\S+/i,
    replacement: "/config api key <redacted>",
    suppressHistory: true,
    suppressTranscript: true
  },
  {
    id: "ask-api-inline-key",
    pattern: /^\/config\s+api\b.*\bkey=\S+/i,
    replacement: "/config api <redacted>",
    suppressHistory: true
  }
];

const configNode: SurfaceCommandNode<AskState> = {
  id: "config",
  path: ["config"],
  title: "config",
  children: [
    { id: "browser", path: ["config", "browser"], title: "browser" },
    { id: "localhost", path: ["config", "localhost"], title: "localhost" },
    {
      id: "api",
      path: ["config", "api"],
      title: "api",
      sideEffect: {
        kind: "external-model",
        requiresExplicitCommand: true,
        warning: "Your question and retrieved evidence may be sent to the configured provider."
      },
      children: [{ id: "key", path: ["config", "api", "key"], title: "key" }]
    },
    { id: "clear", path: ["config", "clear"], title: "clear" }
  ]
};

configNode.renderHelp = (ctx) =>
  renderBranchHelp(configNode, ctx, {
    body:
      "Ask works now with Corpus Search.\nA model runtime is optional. It can help Ask plan queries and write clearer answers from evidence.",
    state: [
      { label: "model runtime", value: ctx.state.runtime },
      { label: "using", value: "Corpus Search" },
      { label: "corpus", value: ctx.state.corpusName }
    ],
    chooseTitle: "choose",
    next: [{ command: "/config clear", label: "reset" }]
  });

const corpusNode: SurfaceCommandNode<AskState> = {
  id: "corpus",
  path: ["corpus"],
  title: "corpus",
  children: [
    { id: "sources", path: ["corpus", "sources"], title: "sources" },
    { id: "chunks", path: ["corpus", "chunks"], title: "chunks" },
    { id: "manifest", path: ["corpus", "manifest"], title: "manifest" }
  ]
};

corpusNode.renderHelp = (ctx) =>
  renderBranchHelp(corpusNode, ctx, {
    state: [
      { label: "corpus", value: ctx.state.corpusName },
      { label: "sources", value: String(ctx.state.sources) },
      { label: "chunks", value: String(ctx.state.chunks) }
    ]
  });

export const askSurfaceShell = createSurfaceShell<AskState>({
  shellId: "ask",
  displayName: "Ask",
  mode: "question-first",
  commandPrefix: "/",
  historyLimit: 100,
  transcriptLimit: 100,
  redactionRules,
  getState: () => state,
  getPrompt: () => "> ",
  root: [
    configNode,
    corpusNode,
    { id: "live", path: ["live"], title: "live" },
    { id: "trace", path: ["trace"], title: "trace" },
    { id: "runtime", path: ["runtime"], title: "runtime" },
    { id: "doctor", path: ["doctor"], title: "doctor" },
    { id: "help", path: ["help"], title: "help" }
  ]
});
