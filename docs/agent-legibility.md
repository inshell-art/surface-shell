# Agent Legibility

Surface Shell is human-primary and agent-legible.

## Human-Primary

Surface Shell returns readable command maps, state, missing requirements, and next actions for human operators.

## Agent-Legible

The same shell state is available as structured data.

## What Agents May Inspect

- command tree
- canonical paths
- aliases / hidden aliases
- current state lines
- missing requirements
- next actions
- side-effect gates
- warnings/errors
- events/trace records

## What Agents Must Not Assume

- side-effect gates do not grant permission to execute side effects
- hidden aliases are compatibility paths, not teaching paths
- branch help is part of the product, not an error state
- rendered text is not the canonical API; structured returns are

## Commit Rule

Natural language may suggest. Explicit commands commit. Side-effect gates remain visible.
