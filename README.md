# Surface Shell

A progressive, state-aware command surface for AI-age tools.

Surface Shell is not a terminal emulator and not an agent framework. It is a small TypeScript core for building command/question interfaces where compact commands reveal the local command tree, current state, missing requirements, next actions, and side-effect gates.

The shell returns the map.

## Why It Exists

AI-age tools often carry hidden state: model route, provider, prompt, runtime, current output, evidence, provenance, wallet, authorization, and live resource state. A Surface Shell lets an app expose that state through compact commands without moving app-specific business logic into the shell core.

The core package provides generic mechanics only:

- input normalization
- command-first and question-first parsing
- command tree and alias lookup
- branch help helpers
- raw-remainder dispatch
- in-flight locking
- redaction rules
- history and transcript utilities
- command-tree completions
- side-effect metadata
- structured returns and plain-text rendering

## Install, Build, Test

```sh
npm install
npm test
npm run build
npm run typecheck
```

The package is private until both validation apps adopt it:

```ts
import { createSurfaceShell } from "@inshell/surface-shell-core";
```

## Minimal Command-First Example

```ts
import { createSurfaceShell, renderBranchHelp, type SurfaceCommandNode } from "@inshell/surface-shell-core";

type State = { provider: string | null };

const configNode: SurfaceCommandNode<State> = {
  id: "config",
  path: ["config"],
  title: "config",
  children: [{ id: "direct", path: ["config", "direct"], title: "direct" }]
};

configNode.renderHelp = (ctx) =>
  renderBranchHelp(configNode, ctx, {
    state: [{ label: "provider", value: ctx.state.provider ?? "not set", status: "ok" }],
    next: [{ command: "config direct" }]
  });

const shell = createSurfaceShell<State>({
  shellId: "thought",
  displayName: "THOUGHT",
  mode: "command-first",
  commandPrefix: null,
  historyLimit: 100,
  transcriptLimit: 100,
  getState: () => ({ provider: "openai" }),
  getPrompt: () => "thought> ",
  root: [configNode]
});
```

## Minimal Question-First Example

```ts
import { createSurfaceShell } from "@inshell/surface-shell-core";

const shell = createSurfaceShell({
  shellId: "ask",
  displayName: "Ask",
  mode: "question-first",
  commandPrefix: "/",
  historyLimit: 50,
  transcriptLimit: 50,
  getState: () => ({ runtime: "corpus" }),
  getPrompt: () => "> ",
  root: [
    { id: "config", path: ["config"], title: "config" },
    { id: "corpus", path: ["corpus"], title: "corpus" }
  ]
});

await shell.dispatch("What is PATH?");
await shell.dispatch("/config");
```

## Core Principles

1. The shell returns the map.
2. State before syntax.
3. Branch commands are panels.
4. Every failure gives next actions.
5. Canonical commands are taught; aliases are tolerated.
6. Secrets are never history.
7. Natural language may suggest; commands commit.
8. Side effects require explicit gates.
9. Apps own ontology; core owns shell mechanics.
10. Trace is part of the interface.

## Non-Goals

Surface Shell core does not provide React components, terminal emulation, PTY support, shell quoting, process execution, model clients, wallet logic, contract calls, corpus retrieval, evidence packs, or app-specific command semantics.

## Validation Apps

THOUGHT CLI validates command-first, side-effectful workflows. Ask Inshell validates question-first, source-grounded workflows. The examples in `examples/` show both shapes without importing either app.
