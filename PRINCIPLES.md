# Surface Shell Principles

Surface Shell is a progressive, state-aware command surface for AI-era tools.

The shell returns the map.

1. The shell returns the map.
2. Every branch command should be useful by itself.
3. State appears before syntax.
4. Missing requirements include next actions.
5. Short commands open subtrees.
6. Long one-shot commands are optional, not the teaching path.
7. Unknown commands return guidance, not dead ends.
8. Dangerous side effects require explicit commands.
9. Side-effect gates are metadata, not permission.
10. Secrets are redacted before transcript/history persistence.
11. Natural language may suggest; explicit commands commit.
12. Command-first and question-first are both valid modes.
13. Humans read the map; agents inspect the structure.
14. Core mechanics remain app-agnostic.

## Examples

Bad:

```text
wallet not connected.
```

Good:

```text
wallet not connected.

next
  wallet connect
```

Bad:

```text
use: config direct provider <id> key <api-key> model <id>
```

Good:

```text
direct

state
  provider   none
  key        none
  model      none

next
  config direct provider <id>
  config direct key <api-key>
  config direct model <id>
```

## Validation Ladder

1. Standalone core tests
2. Fixture shells
3. THOUGHT CLI integration
4. Ask Inshell integration
5. Golden transcript tests across both apps
