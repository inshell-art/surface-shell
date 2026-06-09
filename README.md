# Surface Shell

A progressive, state-aware command surface for AI-age tools.

> The shell returns the map.

GUI shows controls but can hide procedure. CLI exposes procedure but often hides the map. AI chat accepts intent but can blur authority. Surface Shell keeps command precision while returning the local command tree, current state, missing requirements, and next safe actions.

Surface Shell Core provides shell mechanics. Applications provide domain logic.

## Install

```sh
npm install @inshell/surface-shell-core
```

The package is currently private while the API is validated by reference adopters.

## Minimal Command-First Example

```ts
import { createSurfaceShell, renderBranchHelp, type SurfaceCommandNode } from "@inshell/surface-shell-core";

type State = { route: string | null; model: string | null };

const configNode: SurfaceCommandNode<State> = {
  id: "config",
  path: ["config"],
  title: "config",
  children: [
    { id: "config-local", path: ["config", "local"], title: "local" },
    { id: "config-direct", path: ["config", "direct"], title: "direct" }
  ]
};

configNode.renderHelp = (ctx) =>
  renderBranchHelp(configNode, ctx, {
    state: [
      { label: "route", value: ctx.state.route ?? "none" },
      { label: "model", value: ctx.state.model ?? "none" }
    ]
  });

const shell = createSurfaceShell<State>({
  shellId: "example.command",
  displayName: "Command Example",
  mode: "command-first",
  commandPrefix: null,
  historyLimit: 100,
  transcriptLimit: 100,
  getState: () => ({ route: null, model: null }),
  getPrompt: () => "example> ",
  root: [configNode]
});

await shell.dispatch("config");
```

## Minimal Question-First Example

```ts
import { createSurfaceShell } from "@inshell/surface-shell-core";

const shell = createSurfaceShell({
  shellId: "example.question",
  displayName: "Question Example",
  mode: "question-first",
  commandPrefix: "/",
  historyLimit: 100,
  transcriptLimit: 100,
  getState: () => ({ using: "Corpus Search" }),
  getPrompt: () => "> ",
  handleQuestion: (_ctx, question) => ({ kind: "return", title: "question", body: question }),
  root: [
    { id: "config", path: ["config"], title: "config" },
    { id: "corpus", path: ["corpus"], title: "corpus" }
  ]
});

await shell.dispatch("what is PATH?");
await shell.dispatch("/config");
```

## Core Concepts

- command tree
- branch node
- state-aware help
- next actions
- side-effect gates
- redaction
- transcript and command history

## Reference Adopters

- THOUGHT CLI: command-first, side-effectful shell
- Ask Inshell: question-first, source-grounded shell

## Docs

- [SPEC.md](SPEC.md)
- [PRINCIPLES.md](PRINCIPLES.md)
- [API.md](API.md)
- [ADOPTION.md](ADOPTION.md)
- [docs/conformance.md](docs/conformance.md)
