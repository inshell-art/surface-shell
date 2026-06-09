import { describe, expect, it } from "vitest";
import { renderText } from "../src/index.js";

describe("renderText", () => {
  it("renders stable plain text", () => {
    expect(
      renderText({
        kind: "guidance",
        title: "config",
        body: "state before syntax",
        state: [
          { label: "provider", value: "openai" },
          { label: "key", value: "set" }
        ],
        sections: [{ title: "choose", lines: ["config direct", "config local"] }],
        next: [{ command: "run" }],
        warnings: ["external model configured"]
      })
    ).toBe(
      [
        "config",
        "state before syntax",
        "state\n  provider  openai\n  key       set",
        "choose\n  config direct\n  config local",
        "next\n  run",
        "warnings\n  external model configured"
      ].join("\n\n")
    );
  });
});
