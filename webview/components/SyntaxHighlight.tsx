import React from 'react';

interface SyntaxHighlightProps {
  code: string;
  lang?: string;
}

/**
 * Simple syntax highlighting based on language type.
 * Supports JSON, JavaScript, TypeScript, Python, CSS, HTML.
 */
export const SyntaxHighlight: React.FC<SyntaxHighlightProps> = ({ code, lang }) => {
  const renderParts = () => {
    if (!code) {
      return <span className="syntax-default">—</span>;
    }

    // JSON highlighting
    if (lang === 'json') {
      const parts = code.split(/(".*?")/g).filter(Boolean);
      return parts.map((part, i) => {
        if (part.startsWith('"')) {
          // Keys end with ": 
          if (part.endsWith(':') || code.indexOf(part + ':') !== -1) {
            return <span key={i} className="syntax-key">{part}</span>;
          }
          return <span key={i} className="syntax-string">{part}</span>;
        }
        return <span key={i} className="syntax-default">{part}</span>;
      });
    }

    // JavaScript/TypeScript highlighting
    if (lang === 'javascript' || lang === 'typescript' || lang === 'js' || lang === 'ts' || lang === 'tsx' || lang === 'jsx') {
      const keywords = /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|try|catch|throw|new|this|typeof|instanceof|true|false|null|undefined)\b/g;
      const strings = /(['"`].*?['"`])/g;
      
      // Simple split by strings first, then highlight keywords
      const stringParts = code.split(strings);
      return stringParts.map((part, i) => {
        if (/^['"`]/.test(part)) {
          return <span key={i} className="syntax-string">{part}</span>;
        }
        // Highlight keywords
        const keywordParts = part.split(keywords);
        return keywordParts.map((kp, j) => {
          if (keywords.test(kp)) {
            keywords.lastIndex = 0; // Reset regex
            return <span key={`${i}-${j}`} className="syntax-keyword">{kp}</span>;
          }
          return <span key={`${i}-${j}`} className="syntax-default">{kp}</span>;
        });
      });
    }

    // Python highlighting
    if (lang === 'python' || lang === 'py') {
      const keywords = /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|True|False|None|and|or|not|in|is|lambda|yield|raise|pass|break|continue)\b/g;
      const strings = /(['"].*?['"])/g;
      
      const stringParts = code.split(strings);
      return stringParts.map((part, i) => {
        if (/^['"]/.test(part)) {
          return <span key={i} className="syntax-string">{part}</span>;
        }
        const keywordParts = part.split(keywords);
        return keywordParts.map((kp, j) => {
          if (keywords.test(kp)) {
            keywords.lastIndex = 0;
            return <span key={`${i}-${j}`} className="syntax-keyword">{kp}</span>;
          }
          return <span key={`${i}-${j}`} className="syntax-default">{kp}</span>;
        });
      });
    }

    // CSS highlighting
    if (lang === 'css') {
      // Simple: property names are keywords, values are strings
      const propertyMatch = code.match(/^([^:]+):\s*(.*)$/);
      if (propertyMatch) {
        return (
          <>
            <span className="syntax-keyword">{propertyMatch[1]}</span>
            <span className="syntax-default">: </span>
            <span className="syntax-string">{propertyMatch[2]}</span>
          </>
        );
      }
      return <span className="syntax-keyword">{code}</span>;
    }

    // HTML highlighting
    if (lang === 'html') {
      // Simple: tags are keywords, attributes are keys, values are strings
      const tagMatch = code.match(/^<(\/?[\w-]+)/);
      if (tagMatch) {
        return (
          <>
            <span className="syntax-keyword">&lt;{tagMatch[1]}</span>
            <span className="syntax-default">{code.slice(tagMatch[0].length)}</span>
          </>
        );
      }
      return <span className="syntax-default">{code}</span>;
    }

    // Default: no highlighting
    return <span className="syntax-default">{code}</span>;
  };

  return (
    <div className="syntax-code">
      {renderParts()}
    </div>
  );
};

/**
 * Guess language from file path extension.
 */
export function guessLanguage(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  const langMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'py': 'python',
    'json': 'json',
    'css': 'css',
    'scss': 'css',
    'html': 'html',
    'htm': 'html',
    'xml': 'html',
    'md': 'markdown',
    'yaml': 'yaml',
    'yml': 'yaml',
    'sh': 'bash',
    'bash': 'bash',
    'go': 'go',
    'rs': 'rust',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
  };
  return langMap[ext] || 'text';
}
