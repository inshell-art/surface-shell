import { describe, expect, it } from "vitest";
import {
  applyRedaction,
  createSurfaceShell,
  type SurfaceCommandNode,
  type SurfaceRedactionRule
} from "../src/index.js";

const thoughtRule: SurfaceRedactionRule = {
  id: "thought-direct-key",
  pattern: /^(key|config key|config direct key)\s+\S+/i,
  replacement: "$1 <redacted>",
  suppressHistory: true
};

const askRules: SurfaceRedactionRule[] = [
  {
    id: "ask-api-key",
    pattern: /^\/config\s+api\s+key\s+\S+/i,
    replacement: "/config api key <redacted>",
    suppressHistory: true,
    suppressTranscript: true
  },
  {
    id: "ask-api-inline-key",
    pattern: /^\/config\s+api\b.*\bkey=\S+/i,
    replacement: "/config api <redacted>",
    suppressHistory: true
  }
];

describe("redaction", () => {
  it("masks secret command echoes", () => {
    expect(applyRedaction("config direct key sk-test", [thoughtRule], "echo").text).toBe(
      "config direct key <redacted>"
    );
  });

  it("suppresses secret commands from history", async () => {
    const shell = createSurfaceShell({
      shellId: "thought",
      displayName: "THOUGHT",
      mode: "command-first",
      commandPrefix: null,
      historyLimit: 10,
      transcriptLimit: 10,
      redactionRules: [thoughtRule],
      getState: () => ({}),
      getPrompt: () => "thought> ",
      root: keyRoot()
    });

    await shell.dispatch("config direct key sk-test");
    expect(shell.getHistory()).toEqual([]);
  });

  it("masks ask key commands and can suppress transcript", async () => {
    const shell = createSurfaceShell({
      shellId: "ask",
      displayName: "Ask",
      mode: "question-first",
      commandPrefix: "/",
      historyLimit: 10,
      transcriptLimit: 10,
      redactionRules: askRules,
      getState: () => ({}),
      getPrompt: () => "> ",
      root: keyRoot()
    });

    expect(applyRedaction("/config api key sk-test", askRules, "echo").text).toBe("/config api key <redacted>");
    expect(applyRedaction("/config api endpoint https://x.test?key=sk-test", askRules, "echo").text).toBe(
      "/config api <redacted>"
    );

    await shell.dispatch("/config api key sk-test");
    expect(shell.getHistory()).toEqual([]);
    expect(shell.getTranscript()).toEqual([]);
  });

  it("does not mask non-secret prompt text", () => {
    expect(applyRedaction("prompt hello", [thoughtRule], "echo").text).toBe("prompt hello");
  });
});

function keyRoot(): SurfaceCommandNode[] {
  return [
    {
      id: "config",
      path: ["config"],
      title: "config",
      children: [
        {
          id: "direct",
          path: ["config", "direct"],
          title: "direct",
          children: [
            {
              id: "key",
              path: ["config", "direct", "key"],
              title: "key",
              run: () => ({ kind: "return", body: "key stored" })
            }
          ]
        },
        {
          id: "api",
          path: ["config", "api"],
          title: "api",
          children: [
            {
              id: "key",
              path: ["config", "api", "key"],
              title: "key",
              run: () => ({ kind: "return", body: "key stored" })
            },
            {
              id: "endpoint",
              path: ["config", "api", "endpoint"],
              title: "endpoint",
              run: () => ({ kind: "return", body: "endpoint stored" })
            }
          ]
        }
      ]
    }
  ];
}
