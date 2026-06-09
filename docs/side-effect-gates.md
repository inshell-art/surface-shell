# Side-Effect Gates

Side-effect gates are metadata. The core declares and renders them; applications still execute or block the real operation.

Use gates for external models, wallet actions, contract reads, contract writes, writes, network calls, and admin operations.

Side-effect gates should preserve:

- side-effect kind
- whether an explicit command is required
- whether confirmation is required
- a human-readable warning

The core never performs the side effect by seeing this metadata.
