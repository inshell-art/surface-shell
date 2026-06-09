# Command-First Basic Golden Transcript

```text
example> config

config

state
  route  none
  model  none

choose
  config local
  config direct
```

```text
example> config direct

direct

state
  route  none
  model  none

choose
  config direct provider
  config direct model

next
  config direct provider <id>
  config direct model <id>
```

```text
example> run

run unavailable

missing
  prompt
  route

next
  prompt <text>
  config
```

```text
example> unknown

unknown command

unknown command: unknown

next
  help  show commands
```
