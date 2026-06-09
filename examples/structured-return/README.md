# Structured Return Example

Plain text is renderable output. Structured return is the API.

```ts
const result = {
  kind: "guidance",
  title: "config",
  state: [
    { label: "route", value: "none", status: "missing" },
    { label: "model", value: "none", status: "missing" }
  ],
  next: [
    { command: "config local", label: "Use local model" },
    {
      command: "config direct",
      label: "Use direct provider",
      sideEffect: {
        kind: "external-model",
        requiresExplicitCommand: true
      }
    }
  ],
  warnings: []
};
```

Humans can read a rendered map. Agents can inspect the same `SurfaceReturn` fields.
