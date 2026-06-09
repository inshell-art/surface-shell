# Surface Shell Core v0.1 Spec

This repo implements the first standalone version of `@inshell/surface-shell-core`.

Surface Shell is a progressive, state-aware command surface for AI-age tools.

The shell returns the map.

Surface Shell is an interface pattern where compact commands reveal the local command tree, current state, missing requirements, and next safe actions. Natural language may help express intent, but explicit commands commit side effects.

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

## Validation Ladder

1. Standalone core tests
2. Fixture shells
3. THOUGHT CLI integration
4. Ask Inshell integration
5. Golden transcript tests across both apps

Standalone validation proves parser, dispatch, branch help, redaction, history/transcript, completion, side-effect metadata, and package-boundary behavior. It does not prove the abstraction is complete until THOUGHT CLI and Ask Inshell adopt the package.

## Definition Of Done

- `npm test` passes.
- `npm run build` passes.
- THOUGHT-style examples demonstrate command-first branch help, side-effect next actions, and redaction.
- Ask-style examples demonstrate question-first slash commands, `/config`, `/corpus`, and redaction.
