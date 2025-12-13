export const MermaidAccentPlaceholders = {
  accentPink: '#eebefa',
  accentRed: '#fcc2d7',
  accentPurple: '#d0bfff',
  accentGreen: '#b2f2bb',
  accentYellow: '#ffec99',
  accentOrange: '#ffd8a8',
  accentCyan: '#99e9f2',
  accentBlue: '#a5d8ff',
} as const;

export type MermaidAccentKey = keyof typeof MermaidAccentPlaceholders;

// Keep the mapping explicit and easy to scan (similar to windsurf):
// placeholder hex -> palette accent key
export const MermaidPlaceholderToAccentKey: Record<
  (typeof MermaidAccentPlaceholders)[MermaidAccentKey],
  MermaidAccentKey
> = {
  [MermaidAccentPlaceholders.accentPink]: 'accentPink',
  [MermaidAccentPlaceholders.accentRed]: 'accentRed',
  [MermaidAccentPlaceholders.accentPurple]: 'accentPurple',
  [MermaidAccentPlaceholders.accentGreen]: 'accentGreen',
  [MermaidAccentPlaceholders.accentYellow]: 'accentYellow',
  [MermaidAccentPlaceholders.accentOrange]: 'accentOrange',
  [MermaidAccentPlaceholders.accentCyan]: 'accentCyan',
  [MermaidAccentPlaceholders.accentBlue]: 'accentBlue',
};

// A stable cycle for trace background fills (the order matches common “rainbow” grouping)
export const MermaidTraceFillPlaceholderCycle = [
  MermaidAccentPlaceholders.accentBlue,
  MermaidAccentPlaceholders.accentOrange,
  MermaidAccentPlaceholders.accentPurple,
  MermaidAccentPlaceholders.accentGreen,
  MermaidAccentPlaceholders.accentRed,
  MermaidAccentPlaceholders.accentYellow,
  MermaidAccentPlaceholders.accentCyan,
  MermaidAccentPlaceholders.accentPink,
] as const;


