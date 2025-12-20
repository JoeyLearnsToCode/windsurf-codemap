/**
 * Mermaid post-processing: apply deterministic, rotating background fills to subgraphs.
 *
 * Rationale:
 * - We do NOT ask the model to output any colors.
 * - After model output, we append `style <subgraphId> fill:<placeholderHex>` lines.
 * - The webview later replaces these placeholder hex colors with VS Code theme colors.
 */

const SUBGRAPH_FILL_PLACEHOLDER_CYCLE = [
  // Keep in sync with webview's placeholder cycle (order matters for stable rotation)
  '#a5d8ff',
  '#ffd8a8',
  '#d0bfff',
  '#b2f2bb',
  '#fcc2d7',
  '#ffec99',
  '#99e9f2',
  '#eebefa',
] as const;

function normalizeLineEndings(input: string): string {
  return input.replace(/\r\n/g, '\n');
}

function extractSubgraphIds(diagram: string): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();

  const lines = normalizeLineEndings(diagram).split('\n');

  // Mermaid subgraph syntax we support:
  // - subgraph id [Label]
  // - subgraph id["Label"]
  // - subgraph id
  // We only take the first token after `subgraph` as the id.
  const re = /^\s*subgraph\s+([^\s\[]+)\s*(?:\[[^\]]*\]|\["[^"]*"\])?\s*$/i;

  for (const line of lines) {
    const m = line.match(re);
    if (!m) {
      continue;
    }
    const raw = (m[1] || '').trim();
    const id = raw.replace(/^"(.+)"$/, '$1').trim();
    if (!id) {
      continue;
    }
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    ids.push(id);
  }

  return ids;
}

/**
 * Strip fill and fill-opacity from style or classDef lines
 * @param line - The line to process
 * @param keyword - Either 'style' or 'classDef'
 */
function stripFillFromLine(line: string, keyword: 'style' | 'classDef'): string | null {
  const pattern = keyword === 'style'
    ? /^\s*style\s+([^\s]+)\s+(.+)\s*$/i
    : /^\s*classDef\s+([^\s]+)\s+(.+)\s*$/i;
  
  const m = line.match(pattern);
  if (!m) {
    return line;
  }

  const name = m[1];
  const styles = m[2];

  const parts = styles
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  const kept = parts.filter(
    (p) => !/^fill\s*:/i.test(p) && !/^fill-opacity\s*:/i.test(p)
  );

  if (kept.length === 0) {
    return null;
  }
  return `${keyword} ${name} ${kept.join(',')}`;
}

/**
 * Apply rotating fills to all subgraphs in the diagram and return the updated Mermaid code.
 *
 * - Removes existing `fill:` / `fill-opacity:` directives from `style ...` and `classDef ...` lines.
 * - Appends `style <subgraphId> fill:<placeholder>` for each subgraph id in appearance order.
 * - If there are no subgraphs, returns the sanitized original.
 */
export function colorizeMermaidDiagram(diagram: string): string {
  const normalized = normalizeLineEndings(diagram).trim();
  if (!normalized) {
    return normalized;
  }

  const subgraphIds = extractSubgraphIds(normalized);

  const sanitizedLines: string[] = [];
  for (const line of normalized.split('\n')) {
    // Try style first - if it's a style line, this will process it
    let processed = stripFillFromLine(line, 'style');
    // If it was a style line and all styles were removed, skip it
    if (processed === null) {
      // Check if it was actually a style line (not just a non-matching line)
      if (/^\s*style\s+/i.test(line)) {
        continue;
      }
      // Not a style line, so keep original and try classDef
      processed = line;
    }
    // Now try classDef on the processed line
    processed = stripFillFromLine(processed, 'classDef');
    // If it was a classDef line and all styles were removed, skip it
    if (processed === null) {
      // Check if it was actually a classDef line
      if (/^\s*classDef\s+/i.test(line)) {
        continue;
      }
      // Not a classDef line either, keep original
      processed = line;
    }
    sanitizedLines.push(processed);
  }

  const sanitized = sanitizedLines.join('\n').trim();
  if (subgraphIds.length === 0) {
    return sanitized;
  }

  const styleLines = subgraphIds.map((id, idx) => {
    const color =
      SUBGRAPH_FILL_PLACEHOLDER_CYCLE[idx % SUBGRAPH_FILL_PLACEHOLDER_CYCLE.length];
    return `style ${id} fill:${color}`;
  });

  // Append styles at the end (common Mermaid convention).
  return `${sanitized}\n\n${styleLines.join('\n')}`.trim();
}


