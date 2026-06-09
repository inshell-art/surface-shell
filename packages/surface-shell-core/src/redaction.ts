import type {
  SurfaceEvent,
  SurfaceNextAction,
  SurfaceRedactionPhase,
  SurfaceRedactionRule,
  SurfaceReturn,
  SurfaceSection,
  SurfaceStateLine
} from "./types.js";

export type SurfaceRedactionResult = {
  text: string;
  suppressHistory: boolean;
  suppressTranscript: boolean;
  matchedRuleIds: string[];
};

export function applyRedaction(
  text: string,
  rules: SurfaceRedactionRule[] = [],
  phase: SurfaceRedactionPhase = "output"
): SurfaceRedactionResult {
  let redacted = text;
  let suppressHistory = false;
  let suppressTranscript = false;
  const matchedRuleIds: string[] = [];

  for (const rule of rules) {
    if (!ruleApplies(rule, phase)) {
      continue;
    }

    const matcher = cloneRegExp(rule.pattern);
    if (!matcher.test(redacted)) {
      continue;
    }

    matchedRuleIds.push(rule.id);
    suppressHistory = suppressHistory || rule.suppressHistory === true;
    suppressTranscript = suppressTranscript || rule.suppressTranscript === true;
    redacted = redacted.replace(cloneRegExp(rule.pattern), rule.replacement ?? "<redacted>");
  }

  return {
    text: redacted,
    suppressHistory,
    suppressTranscript,
    matchedRuleIds
  };
}

export const applyRedactionRules = applyRedaction;

export function redactSurfaceReturn(
  result: SurfaceReturn,
  rules: SurfaceRedactionRule[] = [],
  phase: SurfaceRedactionPhase = "output"
): SurfaceReturn {
  return {
    ...result,
    title: redactMaybe(result.title, rules, phase),
    body: redactMaybe(result.body, rules, phase),
    sections: result.sections?.map((section) => redactSection(section, rules, phase)),
    state: result.state?.map((line) => redactStateLine(line, rules, phase)),
    next: result.next?.map((action) => redactNextAction(action, rules, phase)),
    warnings: result.warnings?.map((warning) => applyRedaction(warning, rules, phase).text),
    errors: result.errors?.map((error) => applyRedaction(error, rules, phase).text),
    events: result.events?.map((event) => redactEvent(event, rules))
  };
}

export function redactEvent(event: SurfaceEvent, rules: SurfaceRedactionRule[] = []): SurfaceEvent {
  if (event.type !== "sideEffect.declared") {
    return event;
  }

  return {
    ...event,
    sideEffect: {
      ...event.sideEffect,
      label: redactMaybe(event.sideEffect.label, rules, "event"),
      warning: redactMaybe(event.sideEffect.warning, rules, "event")
    }
  };
}

function redactSection(
  section: SurfaceSection,
  rules: SurfaceRedactionRule[],
  phase: SurfaceRedactionPhase
): SurfaceSection {
  return {
    title: redactMaybe(section.title, rules, phase),
    lines: section.lines.map((line) => applyRedaction(line, rules, phase).text)
  };
}

function redactStateLine(
  line: SurfaceStateLine,
  rules: SurfaceRedactionRule[],
  phase: SurfaceRedactionPhase
): SurfaceStateLine {
  return {
    ...line,
    label: applyRedaction(line.label, rules, phase).text,
    value: applyRedaction(line.value, rules, phase).text
  };
}

function redactNextAction(
  action: SurfaceNextAction,
  rules: SurfaceRedactionRule[],
  phase: SurfaceRedactionPhase
): SurfaceNextAction {
  return {
    ...action,
    command: applyRedaction(action.command, rules, phase).text,
    label: redactMaybe(action.label, rules, phase),
    reason: redactMaybe(action.reason, rules, phase)
  };
}

function redactMaybe(
  value: string | undefined,
  rules: SurfaceRedactionRule[],
  phase: SurfaceRedactionPhase
): string | undefined {
  return value === undefined ? undefined : applyRedaction(value, rules, phase).text;
}

function ruleApplies(rule: SurfaceRedactionRule, phase: SurfaceRedactionPhase): boolean {
  return !rule.phases || rule.phases.includes(phase);
}

function cloneRegExp(pattern: RegExp): RegExp {
  return new RegExp(pattern.source, pattern.flags);
}
