import React, { useEffect, useRef, useState } from 'react';

interface MermaidDiagramProps {
  code: string;
  id?: string;
}

// Mermaid module reference (loaded dynamically)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mermaidInstance: any = null;
let mermaidInitialized = false;

async function loadAndInitMermaid() {
  if (mermaidInitialized && mermaidInstance) {
    return mermaidInstance;
  }
  
  // Dynamic import for ESM module
  const mermaidModule = await import('mermaid');
  mermaidInstance = mermaidModule.default;
  
  mermaidInstance.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'strict',
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: 'basis',
    },
    themeVariables: {
      primaryColor: '#3c3c3c',
      primaryTextColor: '#cccccc',
      primaryBorderColor: '#555555',
      lineColor: '#888888',
      secondaryColor: '#2d2d2d',
      tertiaryColor: '#1e1e1e',
      background: '#1e1e1e',
      mainBkg: '#2d2d2d',
      nodeBorder: '#555555',
      clusterBkg: '#252526',
      clusterBorder: '#404040',
      titleColor: '#cccccc',
      edgeLabelBackground: '#1e1e1e',
    },
  });
  
  mermaidInitialized = true;
  return mermaidInstance;
}

/**
 * Component that renders a Mermaid diagram from code string.
 */
export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({
  code,
  id = 'mermaid-diagram',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code || !containerRef.current) {
      setLoading(false);
      return;
    }

    const renderDiagram = async () => {
      setLoading(true);
      setError(null);

      try {
        const mermaid = await loadAndInitMermaid();
        
        // Clear previous content
        containerRef.current!.innerHTML = '';
        
        // Generate unique ID for this render
        const renderId = `${id}-${Date.now()}`;
        
        // Render the diagram
        const { svg } = await mermaid.render(renderId, code);
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
      } finally {
        setLoading(false);
      }
    };

    renderDiagram();
  }, [code, id]);

  if (!code) {
    return (
      <div className="diagram-error">
        No diagram code provided
      </div>
    );
  }

  if (loading) {
    return (
      <div className="diagram-loading">
        Rendering diagram...
      </div>
    );
  }

  if (error) {
    return (
      <div className="diagram-error">
        <div>Failed to render diagram:</div>
        <pre style={{ fontSize: '11px', marginTop: '8px', whiteSpace: 'pre-wrap' }}>
          {error}
        </pre>
        <details style={{ marginTop: '12px', fontSize: '11px' }}>
          <summary>View diagram code</summary>
          <pre style={{ marginTop: '8px', whiteSpace: 'pre-wrap', textAlign: 'left' }}>
            {code}
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div className="diagram-wrapper" ref={containerRef} />
  );
};
