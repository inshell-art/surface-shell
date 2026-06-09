# Lineage

Surface Shell is validated by two opposite application shapes.

## THOUGHT CLI

THOUGHT CLI validates command-first behavior:

- command tree
- branch-node help
- state-aware next actions
- in-flight lock
- secret redaction
- side-effect gates
- explicit wallet and contract boundaries
- waiting prompt state

It is the hard case because it has staged side effects.

## Ask Inshell

Ask Inshell validates question-first behavior:

- plain questions
- slash command tree
- state-aware config help
- corpus/source navigation
- trace-first debugging
- no wallet, account, or model requirement

It is the public case because normal input remains natural language while slash commands expose the local map.
