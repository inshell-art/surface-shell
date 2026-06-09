# Surface Shell Manifesto

GUI shows controls but hides procedure.

CLI exposes procedure but hides the map.

AI chat accepts intent but blurs authority.

Surface Shell is a fourth shape.

It uses compact commands as tree nodes.
Each node returns the local map.
Each return shows current state, missing requirements, and next safe actions.
Natural language may suggest commands.
Explicit commands commit actions.
Dangerous side effects require visible gates.
Trace and provenance remain first-class.

The shell returns the map.

## Compact Commands

Compact commands are entry points, not hidden magic. `config` should be useful by itself because it returns the local map.

## Branch Nodes

Branch nodes replace memorized syntax. Users can move through `config`, then `config direct`, then the leaf command they need.

## State-Aware Help

State-aware help replaces GUI disabled buttons. It says what is missing and shows the next command that can resolve it.

## AI And Authority

AI may suggest, but commands commit. A natural-language turn can propose a command; the explicit command remains the side-effect boundary.

## Side-Effect Gates

Side effects require explicit gates. Wallet use, writes, network calls, contract calls, and external model calls must be visible before they matter.

## Trace

Trace is part of the interface. A Surface Shell should make routing, state, and side-effect boundaries inspectable.
