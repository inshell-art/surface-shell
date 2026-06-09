# Surface Shell Core v0.1 Spec

This repo implements the first standalone version of `@inshell/surface-shell-core`.

The implementation follows the development spec from `/Users/bigu/Downloads/surface_shell_core_repo_development_spec.md`.

## Scope

Implement generic shell mechanics:

- input normalization
- command-first parser
- question-first parser
- command tree and alias lookup
- dispatcher with branch help
- raw-remainder command handlers
- in-flight lock
- redaction rules
- history/transcript utilities
- command-tree completions
- side-effect gate metadata
- structured `SurfaceReturn`
- plain-text renderer

Do not implement app ontology or product runtime behavior.

## Definition Of Done

- `npm test` passes.
- `npm run build` passes.
- THOUGHT-style examples demonstrate command-first branch help, side-effect next actions, and redaction.
- Ask-style examples demonstrate question-first slash commands, `/config`, `/corpus`, and redaction.
