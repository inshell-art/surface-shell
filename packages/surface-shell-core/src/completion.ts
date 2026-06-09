import {
  childCommands,
  commandDisplayPath,
  findCommandNodeByPath,
  pathToCommand,
  tokenizeCommandText
} from "./commandTree.js";
import { normalizeInput } from "./normalizeInput.js";
import type { SurfaceCommandNode, SurfaceCompletion, SurfaceShellConfig } from "./types.js";

export type SurfaceCompletionOptions<TState = unknown> = {
  includeAliases?: boolean;
  includeHidden?: boolean;
  dynamic?: SurfaceCompletion[];
  config: Pick<
    SurfaceShellConfig<TState>,
    "mode" | "commandPrefix" | "root" | "caseInsensitiveCommands"
  >;
};

export function getCommandCompletions<TState>(
  input: string,
  options: SurfaceCompletionOptions<TState>
): SurfaceCompletion[] {
  const normalized = normalizeInput(input);
  const prefix = options.config.mode === "question-first" ? options.config.commandPrefix ?? "/" : null;

  if (prefix && normalized.length > 0 && !normalized.startsWith(prefix)) {
    return [];
  }

  const commandText = prefix && normalized.startsWith(prefix) ? normalized.slice(prefix.length).trimStart() : normalized;
  const endsWithSpace = /\s$/.test(input);
  const tokens = tokenizeCommandText(commandText).map((token) => token.value);
  const parentPath = endsWithSpace ? tokens : tokens.slice(0, -1);
  const partial = endsWithSpace ? "" : tokens[tokens.length - 1] ?? "";
  const parent = parentPath.length
    ? findCommandNodeByPath(options.config.root, parentPath, {
        caseInsensitiveCommands: options.config.caseInsensitiveCommands
      })
    : null;

  if (parentPath.length > 0 && !parent) {
    return options.dynamic ?? [];
  }

  const children = childCommands(parent, options.config.root, options.includeHidden);
  const staticCompletions = childCompletions(children, parent, partial, prefix, options);

  return [...staticCompletions, ...(options.dynamic ?? [])];
}

function childCompletions<TState>(
  children: SurfaceCommandNode<TState>[],
  parent: SurfaceCommandNode<TState> | null,
  partial: string,
  prefix: string | null,
  options: SurfaceCompletionOptions<TState>
): SurfaceCompletion[] {
  const normalizedPartial = normalizeForMatch(partial, options);
  const completions: SurfaceCompletion[] = [];
  const parentPath = parent ? commandDisplayPath(parent) : [];

  for (const child of children) {
    const childSegment = commandDisplayPath(child).at(-1) ?? child.id;
    if (normalizedPartial.length === 0 || normalizeForMatch(childSegment, options).startsWith(normalizedPartial)) {
      const value = pathToCommand(commandDisplayPath(child), prefix);
      completions.push({
        value,
        label: child.title,
        kind: "command",
        hidden: child.hidden
      });
    }

    if (options.includeAliases) {
      for (const alias of child.aliases ?? []) {
        if (normalizedPartial.length > 0 && !normalizeForMatch(alias, options).startsWith(normalizedPartial)) {
          continue;
        }

        completions.push({
          value: pathToCommand([...parentPath, alias], prefix),
          label: child.title,
          kind: "alias",
          canonical: pathToCommand(commandDisplayPath(child), prefix),
          hidden: child.hidden
        });
      }
    }
  }

  return completions;
}

function normalizeForMatch<TState>(value: string, options: SurfaceCompletionOptions<TState>): string {
  return options.config.caseInsensitiveCommands === false ? value : value.toLowerCase();
}
