export const paper = 'var(--paper)';
export const paperSoft = 'var(--paper-soft)';
export const ink = 'var(--ink)';
export const inkSoft = 'var(--ink-soft)';
export const inkMuted = 'var(--ink-muted)';
export const emerald = 'var(--emerald)';
export const emeraldDeep = 'var(--emerald-deep)';
export const emeraldSoft = 'var(--emerald-soft)';
export const hairline = 'var(--hairline)';
export const hairlineStrong = 'var(--hairline-strong)';
export const R = 'var(--r)';

export const fmt$ = (c) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(c / 100);

export const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const fmtN = (n) => new Intl.NumberFormat('en-US').format(n);

export const TAG_COLORS = [
  'oklch(0.42 0.09 165)',
  'oklch(0.55 0.14 240)',
  'oklch(0.62 0.16 55)',
  'oklch(0.5 0.16 320)',
  'oklch(0.55 0.14 200)',
  'oklch(0.45 0.1 285)',
];

export const tagColor = (tag, allTags) => {
  const i = allTags.indexOf(tag);
  return TAG_COLORS[i % TAG_COLORS.length] || TAG_COLORS[0];
};
