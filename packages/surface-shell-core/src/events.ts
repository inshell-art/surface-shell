import type { SurfaceEvent, SurfaceParseResult, SurfaceSideEffectGate } from "./types.js";

export function inputReceivedEvent(shellId: string, parse: SurfaceParseResult, at: Date): SurfaceEvent {
  return {
    type: "input.received",
    shellId,
    inputKind: parse.kind,
    at: at.toISOString()
  };
}

export function commandStartedEvent(shellId: string, path: string[], at: Date): SurfaceEvent {
  return {
    type: "command.started",
    shellId,
    path,
    at: at.toISOString()
  };
}

export function commandFinishedEvent(shellId: string, path: string[], at: Date): SurfaceEvent {
  return {
    type: "command.finished",
    shellId,
    path,
    at: at.toISOString()
  };
}

export function commandBlockedEvent(shellId: string, reason: string, at: Date): SurfaceEvent {
  return {
    type: "command.blocked",
    shellId,
    reason,
    at: at.toISOString()
  };
}

export function sideEffectDeclaredEvent(
  shellId: string,
  path: string[],
  sideEffect: SurfaceSideEffectGate,
  at: Date
): SurfaceEvent {
  return {
    type: "sideEffect.declared",
    shellId,
    path,
    sideEffect,
    at: at.toISOString()
  };
}
