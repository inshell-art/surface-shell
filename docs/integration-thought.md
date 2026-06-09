# THOUGHT Integration Notes

THOUGHT should keep model routes, provider keys, prompts, run payloads, wallet connection, PATH checks, authorization, mint transactions, work records, and provenance outside this package.

The core should only help THOUGHT expose command trees, branch help, redaction, completions, in-flight blocking, and structured command returns.

Reference shape:

```text
command-first
prompt: thought>
branch commands: config, prompt, run, mint, path, wallet
side-effect gates: wallet, contract, external-model
```
