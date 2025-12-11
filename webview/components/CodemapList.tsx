import React, { useState, useMemo } from 'react';
import { Search, Trash2, RefreshCw } from 'lucide-react';
import type { Codemap, CodemapHistoryItem } from '../types';

interface CodemapListProps {
  currentCodemap: Codemap | null;
  history: CodemapHistoryItem[];
  isProcessing: boolean;
  onLoadHistory: (id: string) => void;
  onDeleteHistory: (id: string) => void;
  onRefresh: () => void;
}

/**
 * List of saved codemaps with search and actions.
 */
export const CodemapList: React.FC<CodemapListProps> = ({
  currentCodemap,
  history,
  isProcessing,
  onLoadHistory,
  onDeleteHistory,
  onRefresh,
}) => {
  const [searchText, setSearchText] = useState('');

  const filteredHistory = useMemo(() => {
    if (!searchText.trim()) {
      return history;
    }
    const lower = searchText.toLowerCase();
    return history.filter(
      (item) =>
        item.codemap.title.toLowerCase().includes(lower) ||
        item.codemap.description.toLowerCase().includes(lower)
    );
  }, [history, searchText]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const isCurrentCodemap = (item: CodemapHistoryItem) => {
    return currentCodemap && currentCodemap.title === item.codemap.title;
  };

  return (
    <div className="codemap-list-section">
      <div className="list-header">
        <span className="section-title">Your Codemaps</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button className="icon-btn" onClick={onRefresh} title="Refresh list">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="codemap-item" style={{ opacity: 0.7 }}>
          <div className="codemap-item-header">
            <span className="codemap-item-title">
              Generating...
              <span className="processing-badge">In Progress</span>
            </span>
          </div>
          <div className="codemap-item-desc">
            AI is analyzing your codebase and creating a new codemap.
          </div>
        </div>
      )}

      {/* History items */}
      {filteredHistory.length === 0 && !isProcessing ? (
        <div className="empty-state" style={{ padding: '20px' }}>
          <div className="empty-state-text">
            {searchText
              ? 'No codemaps match your search'
              : 'No saved codemaps yet. Generate one above!'}
          </div>
        </div>
      ) : (
        filteredHistory.map((item) => (
          <div
            key={item.id}
            className={`codemap-item ${isCurrentCodemap(item) ? 'active' : ''}`}
            onClick={() => onLoadHistory(item.id)}
          >
            <div className="codemap-item-header">
              <span className="codemap-item-title">{item.codemap.title}</span>
              <div className="codemap-item-actions">
                <button
                  className="icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteHistory(item.id);
                  }}
                  title="Delete codemap"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="codemap-item-desc">
              {item.codemap.description.length > 100
                ? `${item.codemap.description.slice(0, 100)}...`
                : item.codemap.description}
            </div>
            <div className="codemap-item-time">{formatTime(item.timestamp)}</div>
          </div>
        ))
      )}
    </div>
  );
};
