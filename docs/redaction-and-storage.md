# Redaction And Storage

Redaction rules run before command history or transcript persistence.

Rules are app-configured regular expressions. They can:

- mask command echo
- mask rendered output fragments
- suppress a command from history
- suppress a turn from transcript

```ts
{
  id: "api-key",
  pattern: /^\/config\s+api\s+key\s+\S+/i,
  replacement: "/config api key [redacted]",
  suppressHistory: true,
  suppressTranscript: true
}
```

The core exposes pure helpers and storage adapters. Apps own browser or server persistence decisions.
