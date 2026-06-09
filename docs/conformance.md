# Conformance

## What Conformance Proves

Standalone conformance proves core mechanics: parsing, command resolution, dispatch, branch maps, redaction, history/transcript behavior, completions, side-effect metadata, and rendering.

## What Conformance Does Not Prove

Standalone conformance does not prove the abstraction is complete for a product. Application adoption proves the abstraction.

## Required Test Groups

- parser
- command tree
- dispatcher
- branch help
- redaction
- history
- transcript
- in-flight lock
- side-effect gates
- plain-text rendering
- completion
- fixture shells
- golden transcripts
- package boundary checks

## Fixture Shells

The test suite includes:

- command-first THOUGHT-like fixture
- question-first Ask-like fixture

These fixtures validate shape, not app product behavior.

## Golden Transcripts

Golden transcripts keep rendered local maps stable enough for humans to read and agents to compare.

## Package Boundary Checks

Package boundary tests prevent the core from importing application modules, UI frameworks, model provider clients, wallet libraries, contract libraries, or RPC clients.

## Commands

```sh
npm test
npm run typecheck
npm run build
```
