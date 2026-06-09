# Command-First Fixture Golden

```text
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
direct

state
  provider  none
  key       none
  model     none

choose
  config direct provider
  config direct key
  config direct model

next
  config direct provider <id>
  config direct key <api-key>
  config direct model <id>
```
