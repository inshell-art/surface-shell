import type { SurfaceSideEffectGate } from "./types.js";

export function describeSideEffect(gate: SurfaceSideEffectGate): string {
  const label = gate.label ? `${gate.kind}: ${gate.label}` : gate.kind;
  const confirmation = gate.requiresConfirmation ? " requires confirmation" : "";
  const explicit = gate.requiresExplicitCommand ? " explicit command required" : "";
  return `${label}${explicit}${confirmation}`.trim();
}

export function sideEffectWarning(gate: SurfaceSideEffectGate): string {
  return gate.warning ?? describeSideEffect(gate);
}
