# THOUGHT-Like Transcript Examples

```text
thought> config

config

state
  route  none
  model  none

choose
  config local
  config connect
  config direct
  config my-brain
```

```text
thought> config direct

direct

state
  provider  none
  key       none
  model     none

next
  config direct provider <id>
  config direct key <api-key>
  config direct model <id>
```

```text
thought> mint

mint

state
  current work   none
  wallet         disconnected
  authorization  missing

next
  run

warnings
  confirm: side-effect gate metadata is visible before commit
```

```text
thought> path

path

state
  selected path  none

next
  path list
```
