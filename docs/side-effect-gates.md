# Side-Effect Gates

Side-effect gates are metadata. The core declares and renders them; applications still execute or block the real operation.

A side-effect gate tells the surface how to warn, display, and require explicit command boundaries. It never executes the effect.

Use gates for reads, network calls, external model calls, wallet actions, contract reads, contract writes, writes, and admin operations.

## Examples

```ts
{ kind: "read", requiresExplicitCommand: false, label: "Reads cached local state" }
```

```ts
{ kind: "network", requiresExplicitCommand: true, label: "Fetches a remote resource" }
```

```ts
{
  kind: "external-model",
  requiresExplicitCommand: true,
  requiresConfirmation: false,
  label: "Sends prompt/evidence to configured model endpoint"
}
```

```ts
{ kind: "wallet", requiresExplicitCommand: true, requiresConfirmation: true }
```

```ts
{ kind: "contract-read", requiresExplicitCommand: true, label: "Reads contract state" }
```

```ts
{ kind: "contract-write", requiresExplicitCommand: true, requiresConfirmation: true }
```

```ts
{ kind: "write", requiresExplicitCommand: true, label: "Writes application state" }
```

```ts
{ kind: "admin", requiresExplicitCommand: true, requiresConfirmation: true }
```

Side-effect gates are metadata, not permission.
