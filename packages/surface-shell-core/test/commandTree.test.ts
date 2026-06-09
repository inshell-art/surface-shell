import { describe, expect, it } from "vitest";
import {
  childCommands,
  findCommandNodeByPath,
  findLongestCommandMatch,
  type SurfaceCommandNode
} from "../src/index.js";

const root: SurfaceCommandNode[] = [
  {
    id: "config",
    path: ["config"],
    title: "config",
    aliases: ["cfg"],
    children: [
      {
        id: "direct",
        path: ["config", "direct"],
        title: "direct",
        children: [{ id: "model", path: ["config", "direct", "model"], title: "model" }]
      }
    ]
  },
  {
    id: "models",
    path: ["models"],
    title: "models",
    hidden: true,
    canonicalPath: ["config", "direct", "model"]
  }
];

describe("commandTree", () => {
  it("finds top-level commands", () => {
    expect(findCommandNodeByPath(root, ["config"])?.id).toBe("config");
  });

  it("finds nested commands", () => {
    expect(findCommandNodeByPath(root, ["config", "direct", "model"])?.id).toBe("model");
  });

  it("prefers canonical paths when aliases match", () => {
    const result = findLongestCommandMatch(root, "cfg direct");
    expect(result?.commandPath).toEqual(["config", "direct"]);
    expect(result?.inputPath).toEqual(["cfg", "direct"]);
  });

  it("resolves hidden legacy alias nodes to canonical paths", () => {
    const result = findLongestCommandMatch(root, "models");
    expect(result?.commandPath).toEqual(["config", "direct", "model"]);
  });

  it("hides hidden nodes from default children", () => {
    expect(childCommands(null, root).map((node) => node.id)).toEqual(["config"]);
    expect(childCommands(null, root, true).map((node) => node.id)).toEqual(["config", "models"]);
  });
});
