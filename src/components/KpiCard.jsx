import Icon from './Icon';
import { ink, inkMuted, paper, paperSoft, hairline, emeraldDeep, emeraldSoft } from '../lib/tokens';

const TONES = {
  default: { border: `1px solid ${hairline}`, background: paper, lc: inkMuted, vc: ink, hc: inkMuted },
  emerald: { border: `1px solid oklch(0.42 0.09 165 / 0.3)`, background: emeraldSoft, lc: emeraldDeep, vc: emeraldDeep, hc: emeraldDeep },
  ink: { border: `1px solid ${ink}`, background: ink, lc: 'oklch(1 0 0 / 0.7)', vc: paper, hc: 'oklch(1 0 0 / 0.6)' },
  sky: { border: '1px solid var(--sky-border)', background: 'var(--sky)', lc: 'var(--sky-text)', vc: 'var(--sky-text)', hc: 'var(--sky-text)' },
};

export default function KpiCard({ label, value, hint, tone = 'default', icon }) {
  const c = TONES[tone] || TONES.default;
  return (
    <div style={{ borderRadius: 'var(--r)', padding: 20, border: c.border, background: c.background }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.14em', color: c.lc }}>{label}</p>
        {icon && <span style={{ color: c.vc }}><Icon name={icon} size={16} /></span>}
      </div>
      <p style={{ marginTop: 12, fontFamily: 'Fraunces, Georgia, serif', fontSize: 28, lineHeight: 1, color: c.vc }}>{value}</p>
      {hint && <p style={{ marginTop: 8, fontSize: 12, color: c.hc }}>{hint}</p>}
    </div>
  );
}
