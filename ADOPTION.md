# Adoption Guide

Surface Shell Core provides mechanics. Applications provide domain logic.

## 1. Adopt In A Command-First App

Use command-first mode when ordinary input is command input.

```ts
createSurfaceShell({
  mode: "command-first",
  commandPrefix: null,
  root,
  getState,
  getPrompt
});
```

Branch commands should show subtree help. Side-effect commands remain explicit.

## 2. Adopt In A Question-First App

Use question-first mode when ordinary input remains a user question.

```ts
createSurfaceShell({
  mode: "question-first",
  commandPrefix: "/",
  handleQuestion,
  root,
  getState,
  getPrompt
});
```

Slash commands reveal the control tree.

## 3. Design A Command Tree

Start with branch nodes users can remember:

```text
config
corpus
live
trace
help
```

Add leaf commands only when they perform a specific action.

## 4. Migrate Legacy Aliases

Keep old commands as aliases or hidden nodes with `canonicalPath`. Default help should teach the canonical tree.

## 5. Add Branch-Node Help

Use `renderBranchHelp` to return state, child commands, warnings, and next actions.

## 6. Add State-Aware Next Actions

Every missing requirement should point to a command.

```text
next
  prompt <text>
  config direct
```

## 7. Add Redaction Rules

Register patterns for key-setting commands before enabling history or transcript persistence.

```ts
{
  id: "api-key",
  pattern: /^\/config\s+api\s+key\s+\S+/i,
  replacement: "/config api key [redacted]",
  suppressHistory: true,
  suppressTranscript: true
}
```

## 8. Preserve App-Specific Side Effects

The core declares side-effect metadata. The app still owns wallet, contract, network, model, file, and admin operations.

## 9. Write Golden Transcript Tests

Record expected text for common flows. Tests should catch drift in branch maps, missing requirements, redaction, and side-effect warnings.

## Command-First Notes

THOUGHT-like apps validate staged command surfaces:

```text
ordinary input is command input
branch commands show subtree help
side-effect commands remain explicit
```

## Question-First Notes

Ask-like apps validate inquiry surfaces:

```text
plain input remains user question
slash commands reveal control tree
commandPrefix = "/"
```
