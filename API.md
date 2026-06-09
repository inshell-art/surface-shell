# API Reference

This document names the public exports from `@inshell/surface-shell-core`. Some exports have compatibility aliases so adopters can use plain conceptual names while the implementation keeps its current module names.

Structured objects are the API. Plain text is a renderer.

## createSurfaceShell

Purpose: create a shell instance from a config.

Input: `SurfaceShellConfig<TState>`.

Output: `SurfaceShell<TState>`.

```ts
const shell = createSurfaceShell({
  shellId: "example",
  displayName: "Example",
  mode: "command-first",
  commandPrefix: null,
  historyLimit: 100,
  transcriptLimit: 100,
  getState: () => ({}),
  getPrompt: () => ">",
  root: []
});
```

App note: command handlers and state providers stay app-owned.

## createCommandNode

Purpose: declare a command node with type inference.

Input: `SurfaceCommandNode<TState>`.

Output: `SurfaceCommandNode<TState>`.

```ts
const help = createCommandNode({ id: "help", path: ["help"], title: "help" });
```

## createCommandTree / normalizeCommandTree

Purpose: declare a command tree. `normalizeCommandTree` is currently identity behavior reserved for future validation/normalization.

Input: `SurfaceCommandNode<TState>[]`.

Output: `SurfaceCommandNode<TState>[]`.

```ts
const root = createCommandTree([help]);
```

## dispatchSurfaceInput

Purpose: dispatch input through an existing shell.

Input: `SurfaceShell`, input string.

Output: `Promise<SurfaceReturn>`.

```ts
const result = await dispatchSurfaceInput(shell, "help");
```

Alias note: this calls `shell.dispatch(input)`.

## resolveCommandNode

Purpose: find the longest matching command node.

Input: root command tree, command text, lookup options.

Output: `SurfaceCommandMatch | null`.

```ts
const match = resolveCommandNode(root, "config direct provider openai");
```

Alias note: equivalent to `findLongestCommandMatch`.

## renderBranchHelp

Purpose: build a structured local map for a branch node.

Input: command node, context, help options.

Output: `SurfaceReturn`.

```ts
renderBranchHelp(configNode, ctx, {
  state: [{ label: "route", value: "none" }],
  next: [{ command: "config direct" }]
});
```

## renderSurfaceReturnText

Purpose: render a structured return to plain text.

Input: `SurfaceReturn`.

Output: string.

```ts
const text = renderSurfaceReturnText(result);
```

Alias note: equivalent to `renderText`.

## applyRedactionRules

Purpose: apply configured redaction rules for a phase.

Input: text, `SurfaceRedactionRule[]`, redaction phase.

Output: `SurfaceRedactionResult`.

```ts
const redacted = applyRedactionRules(input, rules, "history");
```

Alias note: equivalent to `applyRedaction`.

## appendHistoryEntry

Purpose: append and cap command history.

Input: history array, entry, limit.

Output: capped history array.

```ts
history = appendHistoryEntry(history, entry, 100);
```

Alias note: equivalent to `addHistoryEntry`.

## appendTranscriptEntry

Purpose: append and cap transcript turns.

Input: transcript array, entry, limit.

Output: capped transcript array.

```ts
transcript = appendTranscriptEntry(transcript, entry, 100);
```

Alias note: equivalent to `addTranscriptEntry`.

## createInFlightLock / withInFlightLock

Purpose: prevent concurrent command execution.

Input: none for `createInFlightLock`; lock and async work for `withInFlightLock`.

Output: lock instance, or work result/null when already locked.

```ts
const lock = createInFlightLock();
await withInFlightLock(lock, async () => runCommand());
```

App note: the shell dispatcher already uses an in-flight lock. These helpers are exposed for app-owned orchestration.
