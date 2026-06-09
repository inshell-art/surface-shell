import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const testDir = dirname(fileURLToPath(import.meta.url));
const srcDir = join(testDir, "..", "src");
const forbiddenDependencyPattern =
  /\b(?:from\s+["']|import\s*\(\s*["']|require\s*\(\s*["'])(?:[^"']*\/)?(?:react|vite|viem|ethers|web-llm|openai|openrouter|anthropic|ollama|rpc|wallet|contract|THOUGHT|PATH|Pulse|Ask(?:-?Inshell)?)(?:\/[^"']*)?["']/i;
const forbiddenAppIdentifierPattern = /\b(?:THOUGHT|PATH|Pulse|Ask Inshell|WebLLM|OpenAI|OpenRouter|Anthropic|React|Vite|viem)\b/;

const sourceFiles = [
  "branchHelp.ts",
  "commandTree.ts",
  "completion.ts",
  "dispatcher.ts",
  "events.ts",
  "history.ts",
  "inFlight.ts",
  "index.ts",
  "nextActions.ts",
  "normalizeInput.ts",
  "parseInput.ts",
  "redaction.ts",
  "renderText.ts",
  "sideEffectGate.ts",
  "state.ts",
  "storage.ts",
  "transcript.ts",
  "types.ts"
];

describe("package boundary", () => {
  it("keeps core source app-agnostic", () => {
    const offenders = sourceFiles.flatMap((file) => {
      const text = readFileSync(join(srcDir, file), "utf8");
      return forbiddenDependencyPattern.test(text) || forbiddenAppIdentifierPattern.test(text) ? [file] : [];
    });

    expect(offenders).toEqual([]);
  });
});
