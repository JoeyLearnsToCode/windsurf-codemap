import React from 'react';

interface QueryBarProps {
  query: string;
  mode: 'fast' | 'smart';
  isProcessing: boolean;
  onQueryChange: (query: string) => void;
  onModeChange: (mode: 'fast' | 'smart') => void;
  onSubmit: () => void;
}

/**
 * Query input bar with mode toggle and submit button.
 */
export const QueryBar: React.FC<QueryBarProps> = ({
  query,
  mode,
  isProcessing,
  onQueryChange,
  onModeChange,
  onSubmit,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isProcessing && query.trim()) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="query-bar">
      <input
        type="text"
        className="query-input"
        placeholder="Enter a starting point for a new codemap (Ctrl+Shift+G)"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isProcessing}
      />
      <div className="query-controls">
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'fast' ? 'active' : ''}`}
            onClick={() => onModeChange('fast')}
            disabled={isProcessing}
            title="Fast mode: Quick exploration with fewer tool calls"
          >
            Fast
          </button>
          <button
            className={`mode-btn ${mode === 'smart' ? 'active' : ''}`}
            onClick={() => onModeChange('smart')}
            disabled={isProcessing}
            title="Smart mode: Deep exploration with more context"
          >
            Smart
          </button>
        </div>
        <button
          className="submit-btn"
          onClick={onSubmit}
          disabled={isProcessing || !query.trim()}
        >
          {isProcessing ? 'Generating...' : 'Generate'}
        </button>
      </div>
    </div>
  );
};
