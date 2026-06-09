# Command-First vs Question-First

Surface Shell supports two modes.

## Command-First

Ordinary input is command input.

```text
thought> config
thought> prompt THE SKY THINKS IN GREEN
thought> run
```

Use command-first mode for tools where procedure and explicit action boundaries are the main interface.

## Question-First

Ordinary input is a question. Commands use a prefix, usually `/`.

```text
> what is PATH?
> /config
> /corpus
```

Use question-first mode for inquiry surfaces where natural language is the primary input and commands expose configuration, corpus, trace, and runtime state.

Corpus Search can be base state in a question-first shell; it does not have to be modeled as a runtime.
