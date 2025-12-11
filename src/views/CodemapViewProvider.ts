/**
 * Codemap Webview View Provider - Sidebar integrated webview
 */

import * as vscode from 'vscode';
import type { Codemap } from '../types';
import { generateFastCodemap, generateSmartCodemap, isConfigured, generateSuggestions } from '../agent';
import { saveCodemap, listCodemaps, deleteCodemap, loadCodemap, getStoragePath } from '../storage/codemapStorage';
import * as logger from '../logger';

export class CodemapViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'codemap.mainView';

  private _view?: vscode.WebviewView;
  private _codemap: Codemap | null = null;
  private _messages: Array<{ role: string; content: string }> = [];
  private _isProcessing = false;
  private _mode: 'fast' | 'smart' = 'smart';
  private _suggestions: Array<{ id: string; text: string; sub?: string }> = [];
  private _recentFiles: string[] = [];
  private _refreshTimer: NodeJS.Timeout | null = null;

  constructor(private readonly _extensionUri: vscode.Uri) {
    // Track recent file access
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor?.document.uri.scheme === 'file') {
        this.addRecentFile(editor.document.uri.fsPath);
      }
    });
    
    // Track file saves
    vscode.workspace.onDidSaveTextDocument((doc) => {
      if (doc.uri.scheme === 'file') {
        this.addRecentFile(doc.uri.fsPath);
      }
    });
  }

  private addRecentFile(filePath: string) {
    // Remove if exists, add to front
    this._recentFiles = this._recentFiles.filter(f => f !== filePath);
    this._recentFiles.unshift(filePath);
    
    // Keep only last 20 files
    if (this._recentFiles.length > 20) {
      this._recentFiles = this._recentFiles.slice(0, 20);
    }
    
    // Debounced refresh
    this.scheduleRefresh();
  }
  
  private scheduleRefresh() {
    if (this._refreshTimer) {
      clearTimeout(this._refreshTimer);
    }
    
    // Refresh suggestions every 30 seconds of activity
    this._refreshTimer = setTimeout(() => {
      this.refreshSuggestions();
    }, 30000);
  }
  
  private async refreshSuggestions(): Promise<void> {
    if (!isConfigured() || this._recentFiles.length < 3) {
      return;
    }
    
    try {
      const suggestions = await generateSuggestions(this._recentFiles.slice(0, 10));
      this._suggestions = suggestions.map(s => ({
        id: `sg-${Date.now()}-${Math.random()}`,
        text: s.text,
        sub: `Based on recent activity`
      }));
      this._updateWebview();
    } catch (error) {
      console.error('Failed to refresh suggestions:', error);
    }
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, 'dist')],
    };

    webviewView.webview.html = this._getHtmlContent(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'ready':
          this._updateWebview();
          // Initial load of suggestions
          this.refreshSuggestions();
          break;
        case 'submit':
          await this._handleSubmit(message.query, message.mode);
          break;
        case 'openFile':
          this._openFile(message.path, message.line);
          break;
        case 'refreshHistory':
          this._updateWebview();
          break;
        case 'deleteHistory':
          this._deleteHistory(message.filename);
          break;
        case 'loadHistory':
          this._loadHistory(message.filename);
          break;
        case 'refreshSuggestions':
          await this.refreshSuggestions();
          break;
        case 'navigate':
          this._updateWebview();
          break;
      }
    });
  }

  public showHome() {
    if (this._view) {
      this._view.show?.(true);
      this._view.webview.postMessage({
        type: 'navigate',
        page: 'home',
      });
    }
  }

  public showWithQuery(query: string, mode: 'fast' | 'smart' = 'smart') {
    if (this._view) {
      this._view.show?.(true);
      this._view.webview.postMessage({
        type: 'setQuery',
        query,
      });
      this._mode = mode;
    }
  }

  public loadCodemap(codemap: Codemap) {
    this._codemap = codemap;
    this._messages = [
      { role: 'assistant', content: `Loaded saved codemap: ${codemap.title}` }
    ];
    this._updateWebview();
  }

  private async _handleSubmit(query: string, mode: 'fast' | 'smart') {
    logger.separator('WEBVIEW SUBMIT');
    logger.info(`Submit received - query: "${query}", mode: ${mode}`);
    
    if (this._isProcessing) {
      logger.warn('Already processing a request, ignoring submit');
      vscode.window.showWarningMessage('Already processing a request');
      return;
    }

    if (!isConfigured()) {
      logger.error('OpenAI API key not configured');
      vscode.window.showErrorMessage('Please set your OpenAI API key first');
      return;
    }

    logger.info('Starting codemap generation...');
    this._isProcessing = true;
    this._mode = mode;
    this._messages = [];
    this._codemap = null;
    this._updateWebview();

    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    logger.info(`Workspace root: ${workspaceRoot}`);

    const callbacks = {
      onMessage: (role: string, content: string) => {
        logger.debug(`[Callback] onMessage - role: ${role}, content length: ${content.length}`);
        this._messages.push({ role, content });
        this._updateWebview();
      },
      onToolCall: (tool: string, args: string, result: string) => {
        logger.debug(`[Callback] onToolCall - tool: ${tool}`);
        this._messages.push({
          role: 'tool',
          content: `[${tool}]\n${args}\n---\n${result.slice(0, 300)}${result.length > 300 ? '...' : ''}`,
        });
        this._updateWebview();
      },
      onCodemapUpdate: (codemap: Codemap) => {
        logger.info(`[Callback] onCodemapUpdate - title: ${codemap.title}, traces: ${codemap.traces.length}`);
        this._codemap = codemap;
        this._updateWebview();
      },
      onPhaseChange: (phase: string, stageNumber: number) => {
        logger.info(`[Callback] onPhaseChange - phase: ${phase}, stage: ${stageNumber}`);
      },
      onTraceProcessing: (traceId: string, stage: number, status: 'start' | 'complete') => {
        logger.debug(`[Callback] onTraceProcessing - trace: ${traceId}, stage: ${stage}, status: ${status}`);
      },
    };

    try {
      logger.info(`Calling generate${mode === 'fast' ? 'Fast' : 'Smart'}Codemap...`);
      if (mode === 'fast') {
        await generateFastCodemap(query, workspaceRoot, callbacks);
      } else {
        await generateSmartCodemap(query, workspaceRoot, callbacks);
      }
      logger.info('Codemap generation function returned');

      // Save codemap to storage if generation succeeded
      if (this._codemap) {
        logger.info('Saving codemap to storage...');
        const savedPath = saveCodemap(this._codemap);
        logger.info(`Codemap saved to: ${savedPath}`);
        this._messages.push({
          role: 'assistant',
          content: `Codemap saved to: ${savedPath}`,
        });
        this._updateWebview();
      } else {
        logger.warn('No codemap was generated (this._codemap is null)');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      logger.error(`Codemap generation failed: ${errorMsg}`);
      if (errorStack) {
        logger.error(`Stack trace: ${errorStack}`);
      }
      vscode.window.showErrorMessage(`Codemap generation failed: ${errorMsg}`);
    } finally {
      logger.info('Submit handler complete, resetting isProcessing to false');
      this._isProcessing = false;
      this._updateWebview();
      logger.separator('WEBVIEW SUBMIT END');
    }
  }

  private _openFile(filePath: string, line: number) {
    const uri = vscode.Uri.file(filePath);
    vscode.window.showTextDocument(uri, {
      selection: new vscode.Range(line - 1, 0, line - 1, 0),
      preview: false,
    });
  }

  private _deleteHistory(filename: string) {
    if (deleteCodemap(filename)) {
      vscode.window.showInformationMessage('Codemap deleted');
      this._updateWebview();
    }
  }

  private _loadHistory(filename: string) {
    const codemap = loadCodemap(filename);
    if (codemap) {
      this._codemap = codemap;
      this._messages = [
        { role: 'assistant', content: `Loaded saved codemap: ${codemap.title}` }
      ];
      this._updateWebview();
    } else {
      vscode.window.showErrorMessage(`Failed to load codemap: ${filename}`);
    }
  }

  private _getHistory() {
    const codemaps = listCodemaps();
    return codemaps.map(({ filename, codemap }) => ({
      id: filename,
      codemap,
      timestamp: new Date(codemap.savedAt || Date.now()).getTime()
    }));
  }

  private _updateWebview() {
    if (this._view) {
      this._view.webview.postMessage({
        type: 'update',
        codemap: this._codemap,
        messages: this._messages,
        isProcessing: this._isProcessing,
        mode: this._mode,
        suggestions: this._suggestions,
        history: this._getHistory()
      });
    }
  }

  private _getHtmlContent(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview', 'main.js')
    );

    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview', 'main.css')
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline' https://cdn.jsdelivr.net; script-src 'nonce-${nonce}' https://cdn.jsdelivr.net; font-src https://fonts.gstatic.com; connect-src https://cdn.jsdelivr.net;">
  <link rel="stylesheet" href="${styleUri}">
  <title>Codemap</title>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}