import type { SurfaceHistoryEntry } from "./types.js";

export function createSurfaceHistory(limit: number): SurfaceHistoryEntry[] {
  return capHistory([], limit);
}

export function addHistoryEntry(
  history: SurfaceHistoryEntry[],
  entry: SurfaceHistoryEntry,
  limit: number
): SurfaceHistoryEntry[] {
  return capHistory([...history, entry], limit);
}

export function capHistory(history: SurfaceHistoryEntry[], limit: number): SurfaceHistoryEntry[] {
  return history.slice(Math.max(0, history.length - Math.max(0, limit)));
}
