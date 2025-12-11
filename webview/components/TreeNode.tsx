import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { SyntaxHighlight } from './SyntaxHighlight';
import type { CodemapLocation } from '../types';

/**
 * Tree node types for rendering the codemap tree.
 */
export interface TreeNodeData {
  id: string;
  type: 'trace' | 'location' | 'group';
  step?: string;
  title: string;
  description?: string;
  label?: string;
  file?: string;
  code?: string;
  lang?: string;
  children?: TreeNodeData[];
  // Original location data for click handling
  sourceLocation?: CodemapLocation;
}

interface TreeNodeProps {
  node: TreeNodeData;
  level?: number;
  isLastChild?: boolean;
  onLocationClick?: (location: CodemapLocation) => void;
}

/**
 * Recursive tree node component supporting trace, location, and group nodes.
 * Layout and tree guide lines follow the reference design.
 */
export const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  level = 0,
  isLastChild = false,
  onLocationClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Indentation: 20px per level + base padding
  const paddingLeft = level * 20 + 24;
  const hasChildren = node.children && node.children.length > 0;

  // Guide line position: 19px + level * 20px
  const guideLineLeft = level * 20 + 19;

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Trace node (top-level with step number)
  if (node.type === 'trace') {
    return (
      <div className="tree-trace">
        <div className="tree-trace-header" onClick={toggleExpand}>
          <div className="tree-chevron">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
          <div className="tree-trace-content">
            <div className="tree-trace-title-row">
              <span className="tree-step-badge">{node.step}</span>
              <span className="tree-trace-title">{node.title}</span>
            </div>
            {isExpanded && node.description && (
              <div className="tree-trace-desc">
                {node.description.length > 120
                  ? `${node.description.slice(0, 120)}...`
                  : node.description}
                {node.description.length > 120 && (
                  <span className="tree-see-more">See more</span>
                )}
              </div>
            )}
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div className="tree-children">
            {/* Root level guide line */}
            <div
              className="tree-guide-line"
              style={{ left: '19px' }}
            />
            {node.children!.map((child, idx) => (
              <TreeNode
                key={child.id}
                node={child}
                level={0}
                isLastChild={idx === node.children!.length - 1}
                onLocationClick={onLocationClick}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Location node (code snippet with file reference)
  if (node.type === 'location') {
    const handleClick = () => {
      if (node.sourceLocation && onLocationClick) {
        onLocationClick(node.sourceLocation);
      }
    };

    return (
      <div className="tree-location">
        {/* Vertical guide line extending through this node */}
        <div
          className="tree-guide-line tree-guide-line-location"
          style={{ left: `${guideLineLeft}px` }}
        />

        <div
          className="tree-location-inner"
          style={{ marginLeft: `${paddingLeft}px` }}
          onClick={handleClick}
        >
          <div className="tree-location-header">
            <div className="tree-location-title-row">
              {node.step && (
                <span className="tree-location-step">{node.step}</span>
              )}
              <span className="tree-location-title">{node.title}</span>
            </div>
            {node.file && (
              <span className="tree-location-file" title={node.file}>
                {node.file}
              </span>
            )}
          </div>
          {node.code && (
            <div className="tree-location-code">
              <SyntaxHighlight code={node.code} lang={node.lang} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Group node (folder/logical grouping)
  return (
    <div className="tree-node">
      {/* Guide line for parent level (only if not last child) */}
      {!isLastChild && (
        <div
          className="tree-guide-line tree-guide-line-full"
          style={{ left: `${guideLineLeft}px` }}
        />
      )}

      <div
        className="tree-node-row"
        style={{ paddingLeft: `${level * 20 + 4}px` }}
        onClick={toggleExpand}
      >
        <div className="tree-node-chevron">
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )
          ) : (
            <span style={{ width: 14 }} />
          )}
        </div>
        <span className="tree-node-label">{node.label || node.title}</span>
      </div>

      {isExpanded && hasChildren && (
        <div className="tree-children">
          {/* Guide line for current level's children */}
          <div
            className="tree-guide-line tree-guide-line-full"
            style={{ left: `${guideLineLeft + 20}px` }}
          />
          {node.children!.map((child, idx) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              isLastChild={idx === node.children!.length - 1}
              onLocationClick={onLocationClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};
