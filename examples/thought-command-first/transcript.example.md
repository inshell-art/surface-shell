# THOUGHT Transcript Example

```text
thought> config

config

state
  route     direct
  provider  openai
  key       set
  model     gpt-4.1

choose
  config local
  config connect
  config direct
  config my-brain

next
  run
```

```text
thought> mint

mint

state
  wallet         not connected
  PATH           not selected
  authorization  missing

choose
  mint confirm

next
  wallet connect

warnings
  mint confirm: Submits ThoughtNFT.mint(...).
```
