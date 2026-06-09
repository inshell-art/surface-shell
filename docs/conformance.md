# Conformance

The core conformance suite proves mechanics independent of any app.

Required groups:

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

Run:

```sh
npm test
npm run typecheck
npm run build
```

Current fixture shells:

- command-first THOUGHT-like fixture
- question-first Ask-like fixture

These fixtures validate shape, not app product behavior.
