import { hairline, hairlineStrong, paper, paperSoft, ink, inkSoft, inkMuted } from '../lib/tokens';

export function TableWrap({ children, style = {} }) {
  return (
    <div style={{ border: `1px solid ${hairline}`, borderRadius: 'var(--r)', background: paper, overflow: 'hidden', ...style }}>
      <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>{children}</table>
    </div>
  );
}

export function THead({ cols }) {
  return (
    <tr style={{ borderBottom: `1px solid ${hairline}`, background: paperSoft }}>
      {cols.map((h) => (
        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: inkMuted, fontWeight: 500 }}>
          {h}
        </th>
      ))}
    </tr>
  );
}

export function TD({ children, muted, bold, right }) {
  return (
    <td style={{ padding: '12px 16px', color: muted ? inkSoft : ink, fontWeight: bold ? 500 : 400, textAlign: right ? 'right' : 'left' }}>
      {children}
    </td>
  );
}

export function Stat({ label, value, big, emeraldColor }) {
  return (
    <div>
      <p style={{ fontSize: 12, color: inkMuted }}>{label}</p>
      <p style={{ marginTop: 2, fontSize: big ? 22 : 14, fontFamily: big ? 'Fraunces, Georgia, serif' : undefined, color: emeraldColor ? 'var(--emerald-deep)' : big ? ink : inkSoft, fontWeight: big ? 400 : 500 }}>
        {value}
      </p>
    </div>
  );
}
