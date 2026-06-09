import { findLongestCommandMatch, normalizeCommandSegment, tokenizeCommandText } from "./commandTree.js";
import { normalizeInput } from "./normalizeInput.js";
import type { SurfaceCommandNode, SurfaceParseResult, SurfaceShellMode } from "./types.js";

export type SurfaceParseInputOptions<TState = unknown> = {
  mode: SurfaceShellMode;
  commandPrefix: string | null;
  root: SurfaceCommandNode<TState>[];
  caseInsensitiveCommands?: boolean;
};

export function parseInput<TState>(input: string, options: SurfaceParseInputOptions<TState>): SurfaceParseResult {
  const normalized = normalizeInput(input);

  if (normalized.length === 0) {
    return {
      kind: "blank",
      raw: input,
      normalized
    };
  }

  if (options.mode === "question-first") {
    const prefix = options.commandPrefix ?? "/";
    if (!normalized.startsWith(prefix)) {
      return {
        kind: "question",
        raw: input,
        normalized,
        question: normalized
      };
    }

    const commandText = normalized.slice(prefix.length).trimStart();
    return parseCommandText(input, normalized, commandText, prefix, options);
  }

  return parseCommandText(input, normalized, normalized, null, options);
}

function parseCommandText<TState>(
  raw: string,
  normalized: string,
  commandText: string,
  prefix: string | null,
  options: SurfaceParseInputOptions<TState>
): SurfaceParseResult {
  const match = findLongestCommandMatch(options.root, commandText, {
    caseInsensitiveCommands: options.caseInsensitiveCommands
  });

  if (match) {
    return {
      kind: "command",
      raw,
      normalized,
      commandText,
      commandPath: match.commandPath,
      remainder: match.remainder,
      prefix
    };
  }

  const tokens = tokenizeCommandText(commandText);
  const head = tokens[0];
  const commandPath = head
    ? [normalizeCommandSegment(head.value, { caseInsensitiveCommands: options.caseInsensitiveCommands })]
    : [];
  const remainder = head ? commandText.slice(head.end).trimStart() : "";

  return {
    kind: "unknown",
    raw,
    normalized,
    commandText,
    commandPath,
    remainder,
    prefix
  };
}
