import type { SurfaceNextAction } from "./types.js";

export function createNextAction(command: string, options: Omit<SurfaceNextAction, "command"> = {}): SurfaceNextAction {
  return { command, ...options };
}

export function formatNextActions(actions: SurfaceNextAction[] = []): string[] {
  return actions.map((action) => {
    const label = action.label ? `  ${action.label}` : "";
    const sideEffect = action.sideEffect ? `  [${action.sideEffect.kind}]` : "";
    const reason = action.reason ? `  ${action.reason}` : "";
    return `  ${action.command}${label}${sideEffect}${reason}`;
  });
}
