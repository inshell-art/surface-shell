# Glossary

## Surface Shell

A progressive, state-aware command surface where compact commands reveal local command maps, current state, next actions, and side-effect boundaries.

## Command-First

A shell mode where normal input is interpreted as a command. THOUGHT CLI is the validation target.

## Question-First

A shell mode where normal input is interpreted as a question and commands require a prefix such as `/`. Ask Inshell is the validation target.

## Branch Command

A command node with children. When invoked without a more specific child or executable handler, it should return state-aware local help.

## Side-Effect Gate

Metadata describing whether a command reads, writes, uses a wallet, calls an external model, or touches a contract.
