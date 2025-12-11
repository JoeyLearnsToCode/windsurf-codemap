import React, { useEffect, useState, useCallback } from 'react';
import { GitFork, LayoutDashboard, Info } from 'lucide-react';
import { QueryBar } from './QueryBar';
import { SuggestionSection } from './SuggestionSection';
import { CodemapList } from './CodemapList';
import { CodemapTreeView } from './CodemapTreeView';
import { CodemapDiagramView } from './CodemapDiagramView';
import type {
  Codemap,
  CodemapSuggestion,
  CodemapHistoryItem,
  CodemapLocation,
  WebviewToExtensionMessage,
  ExtensionToWebviewMessage,
  VsCodeApi,
} from '../types';

// Acquire VS Code API once
const vscode: VsCodeApi = (window as any).acquireVsCodeApi
  ? (window as any).acquireVsCodeApi()
  : {
      postMessage: (msg: WebviewToExtensionMessage) => console.log('postMessage:', msg),
      getState: () => null,
      setState: () => {},
    };

interface AppState {
  query: string;
  mode: 'fast' | 'smart';
  isProcessing: boolean;
  codemap: Codemap | null;
  suggestions: CodemapSuggestion[];
  history: CodemapHistoryItem[];
  activeView: 'tree' | 'diagram';
  page: 'home' | 'detail';
}

/**
 * Main application component for Codemap webview.
 */
export const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    // Try to restore state from VS Code
    const saved = vscode.getState() as Partial<AppState> | null;
    return {
      query: saved?.query || '',
      mode: saved?.mode || 'smart',
      isProcessing: false,
      codemap: null,
      suggestions: [],
      history: [],
      activeView: saved?.activeView || 'tree',
      page: saved?.page || 'home',
    };
  });

  // Persist state changes
  useEffect(() => {
    vscode.setState({
      query: state.query,
      mode: state.mode,
      activeView: state.activeView,
      page: state.page,
    });
  }, [state.query, state.mode, state.activeView, state.page]);

  // Handle messages from extension
  useEffect(() => {
    const handleMessage = (event: MessageEvent<ExtensionToWebviewMessage>) => {
      const message = event.data;
      
      switch (message.type) {
        case 'update':
          setState((prev) => {
            const hasCodemap = !!message.codemap;
            const shouldReturnHome =
              !message.codemap &&
              !message.isProcessing &&
              prev.page === 'detail';

            return {
              ...prev,
              codemap: message.codemap,
              isProcessing: message.isProcessing,
              mode: message.mode,
              suggestions: message.suggestions,
              history: message.history,
              // Note: We ignore message.messages as per requirement
              page: hasCodemap ? 'detail' : shouldReturnHome ? 'home' : prev.page,
            };
          });
          break;
          
        case 'setQuery':
          setState((prev) => ({
            ...prev,
            query: message.query,
          }));
          break;

        case 'navigate':
          setState((prev) => ({
            ...prev,
            page: message.page,
          }));
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Signal that webview is ready
    vscode.postMessage({ command: 'ready' });
    
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Handlers
  const handleQueryChange = useCallback((query: string) => {
    setState((prev) => ({ ...prev, query }));
  }, []);

  const handleModeChange = useCallback((mode: 'fast' | 'smart') => {
    setState((prev) => ({ ...prev, mode }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (state.query.trim() && !state.isProcessing) {
      vscode.postMessage({
        command: 'submit',
        query: state.query.trim(),
        mode: state.mode,
      });
    }
  }, [state.query, state.mode, state.isProcessing]);

  const handleSuggestionClick = useCallback((suggestion: CodemapSuggestion) => {
    // Only fill query, don't auto-submit
    setState((prev) => ({ ...prev, query: suggestion.text }));
  }, []);

  const handleRefreshSuggestions = useCallback(() => {
    vscode.postMessage({ command: 'refreshSuggestions' });
  }, []);

  const handleLoadHistory = useCallback((id: string) => {
    vscode.postMessage({ command: 'loadHistory', filename: id });
  }, []);

  const handleDeleteHistory = useCallback((id: string) => {
    vscode.postMessage({ command: 'deleteHistory', filename: id });
  }, []);

  const handleRefreshHistory = useCallback(() => {
    vscode.postMessage({ command: 'refreshHistory' });
  }, []);

  const handleLocationClick = useCallback((location: CodemapLocation) => {
    vscode.postMessage({
      command: 'openFile',
      path: location.path,
      line: location.lineNumber,
    });
  }, []);

  const handleViewChange = useCallback((view: 'tree' | 'diagram') => {
    setState((prev) => ({ ...prev, activeView: view }));
  }, []);

  // Home page: query + suggestions + codemap list
  if (state.page === 'home') {
    return (
      <div className="app-container">
        <QueryBar
          query={state.query}
          mode={state.mode}
          isProcessing={state.isProcessing}
          onQueryChange={handleQueryChange}
          onModeChange={handleModeChange}
          onSubmit={handleSubmit}
        />

        <SuggestionSection
          suggestions={state.suggestions}
          onSuggestionClick={handleSuggestionClick}
          onRefresh={handleRefreshSuggestions}
        />

        <CodemapList
          currentCodemap={state.codemap}
          history={state.history}
          isProcessing={state.isProcessing}
          onLoadHistory={handleLoadHistory}
          onDeleteHistory={handleDeleteHistory}
          onRefresh={handleRefreshHistory}
        />
      </div>
    );
  }

  // Detail page: tree/diagram views (back in VS Code view title bar)
  return (
    <div className="app-container">
      {/* Floating header with title, meta and description (like reference screenshot) */}
      <div className="detail-header">
        <div className="view-header detail-header-main">
          <div className="detail-title-block">
            <div className="detail-title">{state.codemap?.title || 'Codemap'}</div>
            {state.codemap?.savedAt && (
              <div className="detail-meta">
                <span className="detail-meta-icon">
                  <Info size={12} />
                </span>
                <span>
                  Created {new Date(state.codemap.savedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div className="view-tabs">
            <button
              className={`view-tab ${state.activeView === 'tree' ? 'active' : ''}`}
              onClick={() => handleViewChange('tree')}
            >
              <GitFork size={14} />
              Tree View
            </button>
            <button
              className={`view-tab ${state.activeView === 'diagram' ? 'active' : ''}`}
              onClick={() => handleViewChange('diagram')}
            >
              <LayoutDashboard size={14} />
              Diagram
            </button>
          </div>
        </div>

        {state.codemap && (
          <div className="detail-description">
            {state.codemap.description}
          </div>
        )}
      </div>

      <div className="scroll-container custom-scrollbar">
        {state.activeView === 'tree' ? (
          <CodemapTreeView
            codemap={state.codemap}
            onLocationClick={handleLocationClick}
          />
        ) : (
          <CodemapDiagramView codemap={state.codemap} />
        )}
      </div>
    </div>
  );
};
