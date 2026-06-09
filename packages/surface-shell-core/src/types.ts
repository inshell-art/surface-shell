export type SurfaceShellMode = "command-first" | "question-first";

export type SurfaceParseResult =
  | {
      kind: "blank";
      raw: string;
      normalized: string;
    }
  | {
      kind: "command";
      raw: string;
      normalized: string;
      commandText: string;
      commandPath: string[];
      remainder: string;
      prefix: string | null;
    }
  | {
      kind: "question";
      raw: string;
      normalized: string;
      question: string;
    }
  | {
      kind: "unknown";
      raw: string;
      normalized: string;
      commandText: string;
      commandPath: string[];
      remainder: string;
      prefix: string | null;
    };

export type SurfaceShellConfig<TState = unknown> = {
  shellId: string;
  displayName: string;
  mode: SurfaceShellMode;
  commandPrefix: string | null;
  getPrompt: (ctx: SurfaceContext<TState>) => string;
  caseInsensitiveCommands?: boolean;
  argumentMode?: "raw-remainder";
  historyLimit: number;
  transcriptLimit: number;
  inFlightBehavior?: "ignore" | "blocked-return";
  root: SurfaceCommandNode<TState>[];
  redactionRules?: SurfaceRedactionRule[];
  storage?: SurfaceStorageAdapter;
  getState: () => TState;
  handleQuestion?: SurfaceQuestionHandler<TState>;
  getDynamicCompletions?: (ctx: SurfaceContext<TState>, input: string) => SurfaceCompletion[];
};

export type SurfaceCommandNode<TState = unknown> = {
  id: string;
  path: string[];
  title: string;
  summary?: string;
  aliases?: string[];
  children?: SurfaceCommandNode<TState>[];
  renderHelp?: SurfaceHelpRenderer<TState>;
  run?: SurfaceCommandHandler<TState>;
  sideEffect?: SurfaceSideEffectGate;
  hidden?: boolean;
  canonicalPath?: string[];
};

export type SurfaceContext<TState = unknown> = {
  shellId: string;
  state: TState;
  rawInput: string;
  normalizedInput: string;
  parse: SurfaceParseResult;
  now: Date;
  storage?: SurfaceStorageAdapter;
  emit: (event: SurfaceEvent) => void;
  redact: (text: string, phase?: SurfaceRedactionPhase) => string;
};

export type SurfaceCommandHandler<TState = unknown> = (
  ctx: SurfaceContext<TState>,
  remainder: string
) => SurfaceReturn | Promise<SurfaceReturn>;

export type SurfaceHelpRenderer<TState = unknown> = (ctx: SurfaceContext<TState>) => SurfaceReturn;

export type SurfaceQuestionHandler<TState = unknown> = (
  ctx: SurfaceContext<TState>,
  question: string
) => SurfaceReturn | Promise<SurfaceReturn>;

export type SurfaceReturnKind = "return" | "guidance" | "error" | "blocked" | "empty";

export type SurfaceReturn = {
  kind: SurfaceReturnKind;
  title?: string;
  body?: string;
  sections?: SurfaceSection[];
  state?: SurfaceStateLine[];
  next?: SurfaceNextAction[];
  warnings?: string[];
  errors?: string[];
  events?: SurfaceEvent[];
  suppressHistory?: boolean;
  suppressTranscript?: boolean;
};

export type SurfaceSection = {
  title?: string;
  lines: string[];
};

export type SurfaceStateLine = {
  label: string;
  value: string;
  status?: "ok" | "missing" | "warning" | "error" | "muted";
};

export type SurfaceNextAction = {
  command: string;
  label?: string;
  reason?: string;
  sideEffect?: SurfaceSideEffectGate;
  preferred?: boolean;
};

export type SurfaceSideEffectKind =
  | "none"
  | "read"
  | "network"
  | "external-model"
  | "wallet"
  | "contract"
  | "contract-read"
  | "contract-write"
  | "write"
  | "admin";

export type SurfaceSideEffectGate = {
  kind: SurfaceSideEffectKind;
  label?: string;
  requiresExplicitCommand: boolean;
  requiresConfirmation?: boolean;
  warning?: string;
};

export type SurfaceRedactionPhase = "echo" | "history" | "transcript" | "output" | "event";

export type SurfaceRedactionRule = {
  id: string;
  description?: string;
  pattern: RegExp;
  replacement?: string;
  suppressHistory?: boolean;
  suppressTranscript?: boolean;
  phases?: SurfaceRedactionPhase[];
};

export type SurfaceStorageAdapter = {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
};

export type SurfaceEvent =
  | {
      type: "input.received";
      shellId: string;
      inputKind: "command" | "question" | "blank" | "unknown";
      at: string;
    }
  | {
      type: "command.started";
      shellId: string;
      path: string[];
      at: string;
    }
  | {
      type: "command.finished";
      shellId: string;
      path: string[];
      at: string;
    }
  | {
      type: "command.blocked";
      shellId: string;
      reason: string;
      at: string;
    }
  | {
      type: "sideEffect.declared";
      shellId: string;
      path: string[];
      sideEffect: SurfaceSideEffectGate;
      at: string;
    };

export type SurfaceCompletion = {
  value: string;
  label?: string;
  kind: "command" | "alias" | "next-action";
  canonical?: string;
  hidden?: boolean;
};

export type SurfaceCommandMatch<TState = unknown> = {
  node: SurfaceCommandNode<TState>;
  commandPath: string[];
  inputPath: string[];
  consumedWords: number;
  remainder: string;
};

export type SurfaceHistoryEntry = {
  input: string;
  rawInput: string;
  kind: Exclude<SurfaceParseResult["kind"], "blank" | "question">;
  at: string;
};

export type SurfaceTranscriptEntry = {
  input: string;
  output: string;
  inputKind: SurfaceParseResult["kind"];
  at: string;
};

export type SurfaceShell<TState = unknown> = {
  parse(input: string): SurfaceParseResult;
  dispatch(input: string): Promise<SurfaceReturn>;
  getCompletions(input: string): SurfaceCompletion[];
  renderReturn(result: SurfaceReturn): string;
  getPrompt(): string;
  getHistory(): SurfaceHistoryEntry[];
  clearHistory(): void;
  getTranscript(): SurfaceTranscriptEntry[];
  clearTranscript(): void;
};
