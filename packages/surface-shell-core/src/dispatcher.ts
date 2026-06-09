import { findLongestCommandMatch } from "./commandTree.js";
import { getCommandCompletions } from "./completion.js";
import {
  commandBlockedEvent,
  commandFinishedEvent,
  commandStartedEvent,
  inputReceivedEvent,
  sideEffectDeclaredEvent
} from "./events.js";
import { addHistoryEntry, createSurfaceHistory } from "./history.js";
import { createInFlightLock } from "./inFlight.js";
import { normalizeInput } from "./normalizeInput.js";
import { parseInput } from "./parseInput.js";
import { applyRedaction, redactEvent, redactSurfaceReturn } from "./redaction.js";
import { renderText } from "./renderText.js";
import { addTranscriptEntry, createSurfaceTranscript } from "./transcript.js";
import type {
  SurfaceContext,
  SurfaceEvent,
  SurfaceHistoryEntry,
  SurfaceParseResult,
  SurfaceReturn,
  SurfaceShell,
  SurfaceShellConfig,
  SurfaceTranscriptEntry
} from "./types.js";
import { renderBranchHelp } from "./branchHelp.js";

const DEFAULT_IN_FLIGHT_BEHAVIOR = "blocked-return";

export function createSurfaceShell<TState>(config: SurfaceShellConfig<TState>): SurfaceShell<TState> {
  const inFlight = createInFlightLock();
  let history = createSurfaceHistory(config.historyLimit);
  let transcript = createSurfaceTranscript(config.transcriptLimit);

  const parse = (input: string) =>
    parseInput(input, {
      mode: config.mode,
      commandPrefix: config.commandPrefix,
      root: config.root,
      caseInsensitiveCommands: config.caseInsensitiveCommands
    });

  const createContext = (
    rawInput: string,
    normalizedInput: string,
    parseResult: SurfaceParseResult,
    now: Date,
    emittedEvents: SurfaceEvent[]
  ): SurfaceContext<TState> => ({
    shellId: config.shellId,
    state: config.getState(),
    rawInput,
    normalizedInput,
    parse: parseResult,
    now,
    storage: config.storage,
    emit(event) {
      emittedEvents.push(redactEvent(event, config.redactionRules));
    },
    redact(text, phase = "output") {
      return applyRedaction(text, config.redactionRules, phase).text;
    }
  });

  const persistCollections = async () => {
    if (!config.storage) {
      return;
    }

    await config.storage.setItem(storageKey(config.shellId, "history"), JSON.stringify(history));
    await config.storage.setItem(storageKey(config.shellId, "transcript"), JSON.stringify(transcript));
  };

  const finalize = async (
    result: SurfaceReturn,
    parseResult: SurfaceParseResult,
    rawInput: string,
    normalizedInput: string,
    emittedEvents: SurfaceEvent[],
    at: Date
  ): Promise<SurfaceReturn> => {
    const events = [...emittedEvents, ...(result.events ?? []).map((event) => redactEvent(event, config.redactionRules))];
    const resultWithEvents = redactSurfaceReturn({ ...result, events }, config.redactionRules, "output");
    const historyRedaction = applyRedaction(normalizedInput, config.redactionRules, "history");
    const transcriptRedaction = applyRedaction(normalizedInput, config.redactionRules, "transcript");
    const suppressHistory = resultWithEvents.suppressHistory || historyRedaction.suppressHistory;
    const suppressTranscript = resultWithEvents.suppressTranscript || transcriptRedaction.suppressTranscript;

    if ((parseResult.kind === "command" || parseResult.kind === "unknown") && !suppressHistory) {
      history = addHistoryEntry(
        history,
        {
          input: historyRedaction.text,
          rawInput,
          kind: parseResult.kind,
          at: at.toISOString()
        },
        config.historyLimit
      );
    }

    if (parseResult.kind !== "blank" && !suppressTranscript) {
      transcript = addTranscriptEntry(
        transcript,
        {
          input: transcriptRedaction.text,
          output: renderText(resultWithEvents),
          inputKind: parseResult.kind,
          at: at.toISOString()
        },
        config.transcriptLimit
      );
    }

    await persistCollections();
    return resultWithEvents;
  };

  return {
    parse,
    async dispatch(input: string) {
      const now = new Date();
      const normalized = normalizeInput(input);
      const parseResult = parse(input);
      const emittedEvents: SurfaceEvent[] = [inputReceivedEvent(config.shellId, parseResult, now)];
      const ctx = createContext(input, normalized, parseResult, now, emittedEvents);

      if (parseResult.kind === "blank") {
        return finalize(
          {
            kind: "empty",
            suppressHistory: true,
            suppressTranscript: true
          },
          parseResult,
          input,
          normalized,
          emittedEvents,
          now
        );
      }

      if (!inFlight.tryAcquire()) {
        emittedEvents.push(commandBlockedEvent(config.shellId, "command already in flight", now));
        const behavior = config.inFlightBehavior ?? DEFAULT_IN_FLIGHT_BEHAVIOR;
        const blockedResult: SurfaceReturn =
          behavior === "ignore"
            ? { kind: "empty", suppressHistory: true, suppressTranscript: true }
            : {
                kind: "blocked",
                title: "command in flight",
                body: "A command is already running.",
                suppressHistory: true,
                suppressTranscript: true
              };

        return finalize(blockedResult, parseResult, input, normalized, emittedEvents, now);
      }

      try {
        if (parseResult.kind === "question") {
          if (config.handleQuestion) {
            return await finalize(
              await config.handleQuestion(ctx, parseResult.question),
              parseResult,
              input,
              normalized,
              emittedEvents,
              now
            );
          }

          return await finalize(
            {
              kind: "return",
              title: "question",
              body: parseResult.question
            },
            parseResult,
            input,
            normalized,
            emittedEvents,
            now
          );
        }

        if (parseResult.kind === "unknown") {
          return await finalize(
            unknownCommandReturn(parseResult, config.commandPrefix),
            parseResult,
            input,
            normalized,
            emittedEvents,
            now
          );
        }

        const match = findLongestCommandMatch(config.root, parseResult.commandText, {
          caseInsensitiveCommands: config.caseInsensitiveCommands
        });

        if (!match) {
          return await finalize(
            unknownCommandReturn(parseResult, config.commandPrefix),
            parseResult,
            input,
            normalized,
            emittedEvents,
            now
          );
        }

        emittedEvents.push(commandStartedEvent(config.shellId, match.commandPath, now));

        if (match.node.sideEffect) {
          emittedEvents.push(sideEffectDeclaredEvent(config.shellId, match.commandPath, match.node.sideEffect, now));
        }

        let result: SurfaceReturn;

        if (match.node.run) {
          result = await match.node.run(ctx, match.remainder);
        } else if (match.remainder.length > 0) {
          result = unknownRemainderReturn(parseResult, match.remainder, config.commandPrefix);
        } else if (match.node.renderHelp) {
          result = match.node.renderHelp(ctx);
        } else if (match.node.children && match.node.children.length > 0) {
          result = renderBranchHelp(match.node, ctx);
        } else {
          result = {
            kind: "guidance",
            title: match.node.title,
            body: "No handler is registered for this command.",
            next: [{ command: prefixedCommand("help", config.commandPrefix) }]
          };
        }

        emittedEvents.push(commandFinishedEvent(config.shellId, match.commandPath, new Date()));
        return await finalize(result, parseResult, input, normalized, emittedEvents, now);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return await finalize(
          {
            kind: "error",
            title: "command failed",
            errors: [message],
            next: [{ command: prefixedCommand("help", config.commandPrefix) }]
          },
          parseResult,
          input,
          normalized,
          emittedEvents,
          now
        );
      } finally {
        inFlight.release();
      }
    },
    getCompletions(input: string) {
      const emittedEvents: SurfaceEvent[] = [];
      const normalized = normalizeInput(input);
      const parseResult = parse(input);
      const ctx = createContext(input, normalized, parseResult, new Date(), emittedEvents);
      const dynamic = config.getDynamicCompletions?.(ctx, input);
      return getCommandCompletions(input, { config, dynamic });
    },
    renderReturn(result: SurfaceReturn) {
      return renderText(result);
    },
    getPrompt() {
      const emittedEvents: SurfaceEvent[] = [];
      const blankParse: SurfaceParseResult = { kind: "blank", raw: "", normalized: "" };
      return config.getPrompt(createContext("", "", blankParse, new Date(), emittedEvents));
    },
    getHistory() {
      return [...history];
    },
    clearHistory() {
      history = [];
    },
    getTranscript() {
      return [...transcript];
    },
    clearTranscript() {
      transcript = [];
    }
  };
}

function unknownCommandReturn(
  parseResult: Extract<SurfaceParseResult, { kind: "command" | "unknown" }>,
  prefix: string | null
): SurfaceReturn {
  const command = parseResult.commandPath[0] ? `${parseResult.prefix ?? ""}${parseResult.commandPath[0]}` : "command";
  return {
    kind: "guidance",
    title: "unknown command",
    body: `unknown command: ${command}`,
    next: [{ command: prefixedCommand("help", prefix), label: "show commands" }]
  };
}

function prefixedCommand(command: string, prefix: string | null): string {
  return prefix ? `${prefix}${command}` : command;
}

function unknownRemainderReturn(
  parseResult: Extract<SurfaceParseResult, { kind: "command" }>,
  remainder: string,
  prefix: string | null
): SurfaceReturn {
  const commandHead = `${parseResult.prefix ?? ""}${parseResult.commandPath.join(" ")}`;
  const command = `${commandHead} ${remainder}`.trim();
  return {
    kind: "guidance",
    title: "unknown command",
    body: `unknown command: ${command}`,
    next: [{ command: prefixedCommand("help", prefix), label: "show commands" }]
  };
}

function storageKey(shellId: string, collection: "history" | "transcript"): string {
  return `surface:${shellId}:${collection}`;
}
