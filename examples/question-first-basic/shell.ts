import {
  createCommandTree,
  createSurfaceShell,
  renderBranchHelp,
  type SurfaceCommandNode
} from "@inshell/surface-shell-core";

type ExampleState = {
  using: "Corpus Search";
  corpus: string;
};

const state: ExampleState = {
  using: "Corpus Search",
  corpus: "vfixture"
};

const configNode: SurfaceCommandNode<ExampleState> = {
  id: "config",
  path: ["config"],
  title: "config",
  summary: "Ask works now with Corpus Search.\nA model runtime is optional.",
  children: [
    { id: "config-browser", path: ["config", "browser"], title: "browser" },
    { id: "config-api", path: ["config", "api"], title: "api" }
  ]
};

configNode.renderHelp = (ctx) =>
  renderBranchHelp(configNode, ctx, {
    state: [
      { label: "using", value: ctx.state.using },
      { label: "corpus", value: ctx.state.corpus }
    ]
  });

export const questionFirstBasicShell = createSurfaceShell<ExampleState>({
  shellId: "example.question-first-basic",
  displayName: "Question First Basic",
  mode: "question-first",
  commandPrefix: "/",
  historyLimit: 100,
  transcriptLimit: 100,
  getState: () => state,
  getPrompt: () => "> ",
  handleQuestion: () => ({
    kind: "return",
    title: "question received",
    sections: [{ title: "using", lines: [state.using] }]
  }),
  root: createCommandTree([
    configNode,
    { id: "corpus", path: ["corpus"], title: "corpus", run: () => ({ kind: "return", body: state.corpus }) },
    { id: "trace", path: ["trace"], title: "trace", run: () => ({ kind: "return", body: "trace empty" }) },
    { id: "help", path: ["help"], title: "help", run: () => ({ kind: "guidance", title: "help" }) }
  ])
});
