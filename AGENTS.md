# AGENTS.md

Surface Shell is not an agent framework.

It is a command-surface pattern and TypeScript reference implementation. Agents working in this repo should preserve the core boundary:

- core owns shell mechanics;
- applications own domain logic;
- side-effect gates are metadata;
- the core does not execute wallet, contract, model, file, admin, RPC, or app-specific operations.

## Agent Rules

1. Do not add app-specific logic to `packages/surface-shell-core`.
2. Do not rename exported concepts casually.
3. Preserve command-first and question-first support.
4. Preserve raw remainder handling; do not introduce shell-style POSIX quoting.
5. Preserve redaction-before-persistence.
6. Preserve side-effect gates as metadata only.
7. Add tests for parser, command tree, branch help, redaction, transcript/history, in-flight lock, completion, and golden transcripts when changing behavior.
8. Run:

```sh
npm test
npm run typecheck
npm run build
```

## Reference Adopters

- THOUGHT CLI validates command-first, side-effectful shells.
- Ask Inshell validates question-first, source-grounded shells.
