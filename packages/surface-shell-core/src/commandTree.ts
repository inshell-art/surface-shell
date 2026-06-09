import type { SurfaceCommandMatch, SurfaceCommandNode } from "./types.js";

export type CommandTreeLookupOptions = {
  caseInsensitiveCommands?: boolean;
};

export type CommandToken = {
  value: string;
  start: number;
  end: number;
};

export function tokenizeCommandText(commandText: string): CommandToken[] {
  const tokens: CommandToken[] = [];
  const matcher = /\S+/g;
  let match: RegExpExecArray | null;

  while ((match = matcher.exec(commandText)) !== null) {
    tokens.push({
      value: match[0],
      start: match.index,
      end: match.index + match[0].length
    });
  }

  return tokens;
}

export function commandDisplayPath<TState>(node: SurfaceCommandNode<TState>): string[] {
  return node.canonicalPath ?? node.path;
}

export function commandSegment<TState>(node: SurfaceCommandNode<TState>): string {
  return node.path[node.path.length - 1] ?? node.id;
}

export function pathToCommand(path: string[], prefix: string | null = null): string {
  const command = path.join(" ");
  return prefix ? `${prefix}${command}` : command;
}

export function normalizeCommandSegment(segment: string, options: CommandTreeLookupOptions = {}): string {
  return options.caseInsensitiveCommands === false ? segment : segment.toLowerCase();
}

export function segmentMatches<TState>(
  node: SurfaceCommandNode<TState>,
  inputSegment: string,
  options: CommandTreeLookupOptions = {}
): boolean {
  const expected = normalizeCommandSegment(commandSegment(node), options);
  const input = normalizeCommandSegment(inputSegment, options);

  if (expected === input) {
    return true;
  }

  return (node.aliases ?? []).some((alias) => normalizeCommandSegment(alias, options) === input);
}

export function childCommands<TState>(
  node: SurfaceCommandNode<TState> | null,
  root: SurfaceCommandNode<TState>[],
  includeHidden = false
): SurfaceCommandNode<TState>[] {
  const children = node ? node.children ?? [] : root;
  return includeHidden ? children : children.filter((child) => !child.hidden);
}

export function findCommandNodeByPath<TState>(
  root: SurfaceCommandNode<TState>[],
  path: string[],
  options: CommandTreeLookupOptions = {}
): SurfaceCommandNode<TState> | null {
  let level = root;
  let node: SurfaceCommandNode<TState> | null = null;

  for (const segment of path) {
    const next = level.find((candidate) => segmentMatches(candidate, segment, options));
    if (!next) {
      return null;
    }
    node = next;
    level = next.children ?? [];
  }

  return node;
}

export function findLongestCommandMatch<TState>(
  root: SurfaceCommandNode<TState>[],
  commandText: string,
  options: CommandTreeLookupOptions = {}
): SurfaceCommandMatch<TState> | null {
  const tokens = tokenizeCommandText(commandText);
  if (tokens.length === 0) {
    return null;
  }

  let level = root;
  let node: SurfaceCommandNode<TState> | null = null;
  let consumedWords = 0;
  const inputPath: string[] = [];

  for (const token of tokens) {
    const next = level.find((candidate) => segmentMatches(candidate, token.value, options));
    if (!next) {
      break;
    }

    node = next;
    consumedWords += 1;
    inputPath.push(token.value);
    level = next.children ?? [];
  }

  if (!node) {
    return null;
  }

  const lastToken = tokens[consumedWords - 1];
  const remainder = commandText.slice(lastToken.end).trimStart();

  return {
    node,
    commandPath: commandDisplayPath(node),
    inputPath,
    consumedWords,
    remainder
  };
}

export function createCommandRegistry<TState>(
  root: SurfaceCommandNode<TState>[],
  options: CommandTreeLookupOptions = {}
) {
  return {
    root,
    findByPath(path: string[]) {
      return findCommandNodeByPath(root, path, options);
    },
    findLongest(commandText: string) {
      return findLongestCommandMatch(root, commandText, options);
    },
    children(node: SurfaceCommandNode<TState> | null, includeHidden = false) {
      return childCommands(node, root, includeHidden);
    }
  };
}
