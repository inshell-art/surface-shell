# Glossary

| Term | Definition |
|---|---|
| Surface Shell | A progressive, state-aware command surface for AI-age tools. |
| surface | The visible interaction layer where the user reads state and gives input. |
| shell | The commandable runtime around a tool. |
| command surface | A visible command interface, not necessarily a traditional terminal. |
| command tree | The structured hierarchy of commands and subcommands. |
| command node | One node in the command tree, such as `config`, `config direct`, or `/corpus`. |
| branch node | A command node that opens a subtree instead of requiring all arguments at once. |
| leaf command | A command node that performs a specific action. |
| local map | The relevant subtree returned by the current command node. |
| state-aware help | Help output that includes current state, missing requirements, and next actions. |
| next action | A suggested command the user can run next. |
| side-effect gate | A boundary requiring explicit user action before writes, wallet use, contract calls, external calls, or other consequential operations. |
| explicit commit | A command that confirms a side effect. |
| in-flight lock | A guard that prevents starting a second command while one command is running. |
| transcript | The visible record of shell turns. |
| command history | The navigable list of past submitted commands. |
| redaction rule | A rule that masks secrets before transcript/history persistence. |
| return | The structured output produced by a command or question turn. |
| trace | A structured record of how the shell routed, executed, or answered a turn. |
| command-first shell | A Surface Shell where ordinary input is interpreted as commands. |
| question-first shell | A Surface Shell where ordinary input is interpreted as a question and commands use a prefix such as `/`. |

Avoid `AI shell`, `agent shell`, `chat shell`, `smart terminal`, `natural-language terminal`, `DWIM shell`, and `SS` as primary descriptors.
