# Ask-Like Adoption Notes

- Keep question handling, corpus retrieval, evidence packs, live resources, source trace, and answer generation outside Surface Shell Core.
- Use `mode: "question-first"` and `commandPrefix: "/"`.
- Use branch help for `/config`, `/corpus`, and `/live`.
- Keep Corpus Search as the base layer; model runtime is optional app state.
- Redact API-key configuration commands before history or transcript persistence.
