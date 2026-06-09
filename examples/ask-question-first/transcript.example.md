# Ask Transcript Example

```text
> /config

config

Ask works now with Corpus Search.
A model runtime is optional. It can help Ask plan queries and write clearer answers from evidence.

state
  model runtime  none
  using          Corpus Search
  corpus         Inshell Public Corpus v2026.05.21.initial

choose
  /config browser
  /config localhost
  /config api
  /config clear

next
  /config clear  reset

warnings
  /config api: Your question and retrieved evidence may be sent to the configured provider.
```

```text
> /corpus

corpus

state
  corpus   Inshell Public Corpus v2026.05.21.initial
  sources  11
  chunks   64

choose
  /corpus sources
  /corpus chunks
  /corpus manifest
```
