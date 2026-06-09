# Surface Shell Core Spec

Surface Shell is a progressive, state-aware command surface for AI-age tools.

> The shell returns the map.

Surface Shell is an interface pattern where compact commands reveal the local command tree, current state, missing requirements, and next safe actions. Natural language may help express intent, but explicit commands remain the boundary for side effects.

## 1. Scope

`@inshell/surface-shell-core` provides shell mechanics: input normalization, parsing, command tree resolution, dispatch, branch-node help, structured returns, next actions, side-effect metadata, redaction, transcript/history helpers, completions, events, and plain-text rendering.

Applications provide domain logic.

## 2. Non-Goals

The core does not implement React UI, terminal emulation, shell-style POSIX parsing, process execution, model calls, agent planning, wallet logic, contract calls, RPC calls, corpus retrieval, THOUGHT minting, Ask evidence packs, or direct browser storage globals.

## 3. Input Model

Input is trimmed at the edges. Blank input is ignored. Command matching can be case-insensitive. Handlers receive the unmatched tail as raw remainder. No shell-style quoting parser is required, so `prompt "the sky"` keeps the quotes in the remainder.

## 4. Command Resolution

The resolver finds the longest valid command path. Aliases may resolve to canonical paths. Hidden nodes can resolve but are omitted from default help/completion output.

## 5. Command Tree

Applications provide the tree. The core never hardcodes app commands.

## 6. Command Node

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

## 7. Branch-Node Help

A branch node with no deeper command returns a local map instead of an error. The map may include title, summary, current state, child commands, missing requirements, warnings, and next actions.

## 8. Surface Return

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

## 9. State Lines

State lines are structured label/value pairs with optional status: `ok`, `missing`, `warning`, `error`, or `muted`.

## 10. Next Actions

Next actions are structured command suggestions. They can carry labels, reasons, preference markers, and side-effect metadata.

## 11. Side-Effect Gates

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

Side-effect gates are metadata. They do not execute the side effect.

## 12. Transcript/History

Command history stores navigable submitted commands. Transcript stores visible turn records. Both are capped by configured limits. Redaction runs before persistence.

## 13. Redaction

Redaction rules are app-configured regular expressions. They can mask text and suppress history or transcript persistence.

## 14. In-Flight Lock

The in-flight lock prevents duplicate concurrent command execution. Behavior is configurable as ignore or blocked return.

## 15. Command-First Mode

In command-first mode, ordinary input enters command resolution.

## 16. Question-First Mode

In question-first mode, ordinary input goes to the question handler. Input beginning with `commandPrefix`, usually `/`, enters command resolution.

## 17. Completion Behavior

Completions are generated from the command tree. Apps may add dynamic completions from state, such as `return` and `cancel` while a shell is waiting.

## 18. Event/Trace Records

The core emits input, command start, command finish, blocked, and side-effect declaration events. Events should be safe for trace after redaction.

## 19. Rendering Expectations

The plain-text renderer is stable and readable. Structured returns remain the primary API; rendering is a default view.

## 20. Conformance Checklist

- parser trims input, ignores blank input, and preserves raw remainder
- command tree resolves nested paths and aliases
- branch commands return local maps
- unknown commands return guidance
- question-first mode routes plain input to the question handler
- side-effect gates are metadata only
- redaction runs before transcript/history persistence
- history/transcript limits are enforced
- completions work for root, nested, alias, slash, and dynamic cases
- golden transcript fixtures pass
