import { childCommands, commandDisplayPath, pathToCommand } from "./commandTree.js";
import { sideEffectWarning } from "./sideEffectGate.js";
import type {
  SurfaceCommandNode,
  SurfaceContext,
  SurfaceNextAction,
  SurfaceReturn,
  SurfaceSection,
  SurfaceStateLine
} from "./types.js";

export type SurfaceBranchHelpOptions<TState = unknown> = {
  title?: string;
  body?: string;
  state?: SurfaceStateLine[] | ((ctx: SurfaceContext<TState>) => SurfaceStateLine[]);
  next?: SurfaceNextAction[] | ((ctx: SurfaceContext<TState>) => SurfaceNextAction[]);
  sections?: SurfaceSection[] | ((ctx: SurfaceContext<TState>) => SurfaceSection[]);
  chooseTitle?: string;
  includeHiddenChildren?: boolean;
  prefix?: string | null;
  warnings?: string[] | ((ctx: SurfaceContext<TState>) => string[]);
};

export function renderBranchHelp<TState>(
  node: SurfaceCommandNode<TState> | null,
  ctx: SurfaceContext<TState>,
  options: SurfaceBranchHelpOptions<TState> = {}
): SurfaceReturn {
  const prefix = options.prefix ?? (ctx.parse.kind === "command" || ctx.parse.kind === "unknown" ? ctx.parse.prefix : null);
  const sections = resolveOption(options.sections, ctx) ?? [];
  const children = node ? childCommands(node, [], options.includeHiddenChildren) : [];
  const chooseLines = children.map((child) => pathToCommand(commandDisplayPath(child), prefix));
  const chooseTitle = options.chooseTitle ?? "choose";
  const allSections = [...sections];

  if (chooseLines.length > 0) {
    allSections.push({
      title: chooseTitle,
      lines: chooseLines
    });
  }

  const next = resolveOption(options.next, ctx) ?? [];
  const warnings = [
    ...(resolveOption(options.warnings, ctx) ?? []),
    ...sideEffectWarnings(node, children, next, prefix)
  ];

  return {
    kind: "guidance",
    title: options.title ?? node?.title ?? "commands",
    body: options.body ?? node?.summary,
    state: resolveOption(options.state, ctx),
    sections: allSections,
    next,
    warnings
  };
}

function resolveOption<TState, TValue>(
  value: TValue | ((ctx: SurfaceContext<TState>) => TValue) | undefined,
  ctx: SurfaceContext<TState>
): TValue | undefined {
  return typeof value === "function" ? (value as (ctx: SurfaceContext<TState>) => TValue)(ctx) : value;
}

function sideEffectWarnings<TState>(
  node: SurfaceCommandNode<TState> | null,
  children: SurfaceCommandNode<TState>[],
  next: SurfaceNextAction[],
  prefix: string | null
): string[] {
  const warnings: string[] = [];

  if (node?.sideEffect) {
    warnings.push(sideEffectWarning(node.sideEffect));
  }

  for (const child of children) {
    if (child.sideEffect) {
      warnings.push(`${pathToCommand(commandDisplayPath(child), prefix)}: ${sideEffectWarning(child.sideEffect)}`);
    }
  }

  for (const action of next) {
    if (action.sideEffect) {
      warnings.push(`${action.command}: ${sideEffectWarning(action.sideEffect)}`);
    }
  }

  return warnings;
}
