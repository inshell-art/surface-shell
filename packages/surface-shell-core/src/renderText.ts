import { formatNextActions } from "./nextActions.js";
import { formatStateLines } from "./state.js";
import type { SurfaceReturn } from "./types.js";

export function renderText(result: SurfaceReturn): string {
  const blocks: string[] = [];

  if (result.title) {
    blocks.push(result.title);
  }

  if (result.body) {
    blocks.push(result.body);
  }

  if (result.state && result.state.length > 0) {
    blocks.push(["state", ...formatStateLines(result.state)].join("\n"));
  }

  for (const section of result.sections ?? []) {
    const lines = section.lines.map((line) => `  ${line}`);
    blocks.push(section.title ? [section.title, ...lines].join("\n") : lines.join("\n"));
  }

  if (result.next && result.next.length > 0) {
    blocks.push(["next", ...formatNextActions(result.next)].join("\n"));
  }

  if (result.warnings && result.warnings.length > 0) {
    blocks.push(["warnings", ...result.warnings.map((warning) => `  ${warning}`)].join("\n"));
  }

  if (result.errors && result.errors.length > 0) {
    blocks.push(["errors", ...result.errors.map((error) => `  ${error}`)].join("\n"));
  }

  return blocks.join("\n\n");
}
