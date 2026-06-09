# Glossary

## Surface Shell

A progressive, state-aware command surface for AI-era tools.

## Command Surface

The visible interface where commands are entered and the shell returns state, maps, and next actions.

## Command Tree

The structured hierarchy of command nodes.

## Command Node

One node in the command tree, such as `config`, `config direct`, or `/corpus`.

## Branch Node

A command node that reveals a local map instead of requiring all arguments at once.

## Leaf Command

A command node that performs a specific operation.

## Local Map

The relevant subtree and state returned by a branch node.

## State-Aware Help

Help output that includes current state, missing requirements, and next actions.

## Next Action

A suggested command the user can run next.

## Side-Effect Gate

Metadata declaring that a command touches a sensitive or external effect boundary.

## Explicit Command

A user-entered command, rather than an inferred action.

## Explicit Commit

A user-entered command that commits a side effect after the map/state has been shown.

## Command-First Shell

A shell where ordinary input enters the command tree.

## Question-First Shell

A shell where ordinary input is treated as a question and prefixed input enters the command tree.

## Raw Remainder

The unmatched tail of command input passed directly to a handler without shell-style quote parsing.

## Hidden Alias

A compatibility command path that resolves but is not shown in default help.

## Canonical Path

The command path taught by help and completions.

## SurfaceReturn

The structured output produced by a command or question turn.

## SurfaceEvent

A structured record of how the shell routed, executed, or answered a turn.

Avoid `SS`, `AI shell`, `agent shell`, `smart terminal`, `magic terminal`, and `Do What I Mean shell` as primary descriptors.
