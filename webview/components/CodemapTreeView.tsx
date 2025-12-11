import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { TraceDiagramView } from './TraceDiagramView';
import type { Codemap, CodemapLocation, CodemapTrace } from '../types';

interface CodemapTreeViewProps {
  codemap: Codemap | null;
  onLocationClick: (location: CodemapLocation) => void;
}

/**
 * Props for TraceSection
 */
interface TraceSectionProps {
  trace: CodemapTrace;
  traceIndex: number;
  allLocations: Map<string, CodemapLocation>;
  onLocationClick: (location: CodemapLocation) => void;
  onFileClick: (filePath: string, lineNumber?: number) => void;
}

/**
 * A single trace section with collapsible header
 * The diagram inside is always fully expanded (no node-level folding)
 */
const TraceSection: React.FC<TraceSectionProps> = ({
  trace,
  traceIndex,
  allLocations,
  onLocationClick,
  onFileClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="trace-section">
      {/* Trace header - clickable to expand/collapse */}
      <div className="trace-section-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="trace-section-chevron">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
        <div className="trace-section-content">
          <div className="trace-section-title-row">
            <span className="trace-section-step">{traceIndex + 1}</span>
            <span className="trace-section-title">{trace.title}</span>
          </div>
          {isExpanded && trace.description && (
            <div className="trace-section-desc">
              {trace.description.length > 120
                ? `${trace.description.slice(0, 120)}...`
                : trace.description}
            </div>
          )}
        </div>
      </div>
      
      {/* Diagram body - static tree, no folding */}
      {isExpanded && (
        <div className="trace-section-body">
          <TraceDiagramView
            trace={trace}
            allLocations={allLocations}
            onLocationClick={onLocationClick}
            onFileClick={onFileClick}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Main tree view for displaying Codemap structure.
 * Each trace can be collapsed, but the diagram inside is always fully expanded.
 */
export const CodemapTreeView: React.FC<CodemapTreeViewProps> = ({
  codemap,
  onLocationClick,
}) => {
  // Build a map of all locations across all traces for cross-trace references
  const allLocations = useMemo(() => {
    const map = new Map<string, CodemapLocation>();
    if (codemap) {
      for (const trace of codemap.traces) {
        for (const loc of trace.locations) {
          map.set(loc.id, loc);
        }
      }
    }
    return map;
  }, [codemap]);

  // Handler for file clicks from diagram
  const handleFileClick = (filePath: string, lineNumber?: number) => {
    const syntheticLocation: CodemapLocation = {
      id: `file-${filePath}-${lineNumber || 0}`,
      path: filePath,
      lineNumber: lineNumber || 1,
      lineContent: '',
      title: filePath.split(/[/\\]/).pop() || filePath,
      description: '',
    };
    onLocationClick(syntheticLocation);
  };

  if (!codemap) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🗺️</div>
        <div className="empty-state-text">
          No codemap selected. Go back to the Codemaps list to open or generate one.
        </div>
      </div>
    );
  }

  return (
    <div className="tree-container">
      {codemap.traces.map((trace, idx) => (
        <TraceSection
          key={trace.id}
          trace={trace}
          traceIndex={idx}
          allLocations={allLocations}
          onLocationClick={onLocationClick}
          onFileClick={handleFileClick}
        />
      ))}
    </div>
  );
};
