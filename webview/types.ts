/**
 * Shared types for Webview <-> Extension communication
 */

export interface CodemapLocation {
  id: string;
  path: string;
  lineNumber: number;
  lineContent: string;
  title: string;
  description: string;
}

export interface CodemapTrace {
  id: string;
  title: string;
  description: string;
  locations: CodemapLocation[];
  traceTextDiagram?: string;
  traceGuide?: string;
}

export interface Codemap {
  title: string;
  description: string;
  traces: CodemapTrace[];
  savedAt?: string;
}

export interface AgentMessage {
  role: 'user' | 'assistant' | 'tool' | 'error';
  content: string;
}

export interface CodemapSuggestion {
  id: string;
  text: string;
  sub?: string;
}

export interface CodemapHistoryItem {
  id: string;
  codemap: Codemap;
  timestamp: number;
}

// Messages from Webview to Extension
export type WebviewToExtensionMessage =
  | { command: 'submit'; query: string; mode: 'fast' | 'smart' }
  | { command: 'openFile'; path: string; line: number }
  | { command: 'ready' }
  | { command: 'refreshHistory' }
  | { command: 'deleteHistory'; filename: string }
  | { command: 'loadHistory'; filename: string }
  | { command: 'refreshSuggestions' };

// Messages from Extension to Webview
export type ExtensionToWebviewMessage =
  | {
      type: 'update';
      codemap: Codemap | null;
      messages: AgentMessage[];
      isProcessing: boolean;
      mode: 'fast' | 'smart';
      suggestions: CodemapSuggestion[];
      history: CodemapHistoryItem[];
    }
  | { type: 'setQuery'; query: string }
  | { type: 'navigate'; page: 'home' | 'detail' };

// VSCode API type declaration for webview
export interface VsCodeApi {
  postMessage(message: WebviewToExtensionMessage): void;
  getState(): unknown;
  setState(state: unknown): void;
}

declare global {
  function acquireVsCodeApi(): VsCodeApi;
}