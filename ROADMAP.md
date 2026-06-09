# Roadmap

## Phase A: Standalone Repo

- npm workspace scaffold
- private `@inshell/surface-shell-core` package
- practical docs
- command-first and question-first examples

## Phase B: Core v0.1

- normalization and parser
- command tree and alias lookup
- dispatcher with branch help
- in-flight lock
- redaction
- history and transcript utilities
- completions
- side-effect metadata
- plain-text renderer

## Phase C: THOUGHT Adoption

Use the core dispatcher and branch-help helpers without moving THOUGHT-specific model, wallet, PATH, authorization, mint, provenance, or work-record logic into core.

## Phase D: Ask Adoption

Use question-first parsing and slash-command branch surfaces while keeping corpus retrieval, evidence packs, model planning, live resources, and source trace in Ask.

## Phase E: API Stabilization

Freeze a smaller API after both validation apps expose real integration pressure.
