# Surface Shell Spec

## 0. Definition

Surface Shell is a progressive, state-aware command surface for AI-era tools.

> The shell returns the map.

Surface Shell is an interface paradigm. Surface Shell Spec is the guideline / implementation contract. `@inshell/surface-shell-core` is the TypeScript reference implementation. Surface Shell Protocol is a possible future interop layer, not a current claim.

The structured return object is the canonical output. Plain-text rendering is a default presentation layer.

## 1. Scope

`@inshell/surface-shell-core` provides shell mechanics: input normalization, parsing, command tree resolution, dispatch, branch-node help, structured returns, next actions, side-effect metadata, redaction, transcript/history helpers, completions, events, and plain-text rendering.

Applications provide domain logic.

## 2. Non-Goals

The core does not implement React UI, terminal emulation, shell-style POSIX parsing, process execution, model calls, agent planning, wallet logic, contract calls, RPC calls, corpus retrieval, THOUGHT minting, Ask evidence packs, or direct browser storage globals.

## 3. Core Modes

```ts
type SurfaceShellMode = "command-first" | "question-first";
```

Command-first mode routes ordinary input into the command tree.

Question-first mode routes ordinary input to `handleQuestion`; only prefix commands enter the command tree.

## 4. Input Model

Input is trimmed at the edges. Blank input is ignored. Command matching can be case-insensitive. Handlers receive the unmatched tail as raw remainder. No shell-style quoting parser is required, so `prompt "the sky"` keeps the quotes in the remainder.

## 5. Command Resolution

The resolver finds the longest valid command path. Aliases may resolve to canonical paths. Hidden nodes are valid resolution targets for compatibility, but default help/completion should teach canonical visible paths.

## 6. Command Tree

Applications provide the tree. The core never hardcodes app commands.

## 7. Command Node

```ts
type SurfaceCommandNode = {
  id: string;
  path: string[];
  title: string;
  summary?: string;
  aliases?: string[];
  hidden?: boolean;
  canonicalPath?: string[];
  children?: SurfaceCommandNode[];
  run?: SurfaceCommandHandler;
  renderHelp?: SurfaceHelpRenderer;
  sideEffect?: SurfaceSideEffectGate;
};
```

## 8. Branch-Node Help

A branch node with no deeper command returns a local map instead of an error. The map may include title, summary, current state, child commands, missing requirements, warnings, and next actions.

Branch help is part of the product surface. It is not an error state.

## 9. SurfaceReturn

```ts
type SurfaceReturn = {
  kind: "return" | "guidance" | "error" | "blocked" | "empty";
  title?: string;
  body?: string;
  sections?: SurfaceSection[];
  state?: SurfaceStateLine[];
  next?: SurfaceNextAction[];
  warnings?: string[];
  errors?: string[];
  events?: SurfaceEvent[];
  suppressHistory?: boolean;
  suppressTranscript?: boolean;
};
```

Structured `SurfaceReturn` is the API. Rendered text is one presentation.

## 10. State Lines

State lines are structured label/value pairs with optional status: `ok`, `missing`, `warning`, `error`, or `muted`.

## 11. Next Actions

Next actions are structured command suggestions. They can carry labels, reasons, preference markers, and side-effect metadata.

## 12. Side-Effect Gates

```ts
type SurfaceSideEffectKind =
  | "none"
  | "read"
  | "network"
  | "external-model"
  | "wallet"
  | "contract"
  | "contract-read"
  | "contract-write"
  | "write"
  | "admin";
```

Side-effect gates declare risk and required explicitness; they do not execute effects.

## 13. Transcript And History

Command history stores navigable submitted commands. Transcript stores visible turn records. Both are capped by configured limits. Redaction runs before persistence.

## 14. Redaction

Redaction rules are app-configured regular expressions. They can mask text and suppress history or transcript persistence.

## 15. In-Flight Lock

The in-flight lock prevents duplicate concurrent command execution. Behavior is configurable as ignore or blocked return.

## 16. Completion

Completions are generated from the command tree. Apps may add dynamic completions from state, such as `return` and `cancel` while a shell is waiting.

## 17. Event / Trace Records

The core emits input, command start, command finish, blocked, and side-effect declaration events. Events should be safe for trace after redaction.

## 18. Rendering

The plain-text renderer is stable and readable. It is not the canonical API.

## 19. Package Boundary

Core source must stay app-agnostic. It must not import THOUGHT, Ask, React, wallet libraries, contract libraries, model provider clients, RPC clients, or application modules.

## 20. Conformance Checklist

- parser trims input, ignores blank input, and preserves raw remainder
- command tree resolves nested paths and aliases
- hidden aliases resolve but are not taught by default
- branch commands return local maps
- unknown commands return guidance
- question-first mode routes plain input to the question handler
- side-effect gates are metadata only
- redaction runs before transcript/history persistence
- history/transcript limits are enforced
- completions work for root, nested, alias, slash, and dynamic cases
- golden transcript fixtures pass
- package boundary checks pass
