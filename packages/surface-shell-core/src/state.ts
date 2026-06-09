import type { SurfaceStateLine } from "./types.js";

export function createStateLine(
  label: string,
  value: string,
  status?: SurfaceStateLine["status"]
): SurfaceStateLine {
  return { label, value, status };
}

export function formatStateLines(lines: SurfaceStateLine[] = []): string[] {
  if (lines.length === 0) {
    return [];
  }

  const width = Math.max(...lines.map((line) => line.label.length));
  return lines.map((line) => `  ${line.label.padEnd(width + 2)}${line.value}`);
}
