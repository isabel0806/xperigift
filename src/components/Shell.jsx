import { ink, inkMuted } from '../lib/tokens';

export default function Shell({ title, subtitle, actions, children }) {
  return (
    <div className="fade-up" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 400, color: ink }}>{title}</h1>
          {subtitle && <p style={{ marginTop: 4, fontSize: 14, color: inkMuted }}>{subtitle}</p>}
        </div>
        {actions && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{actions}</div>}
      </div>
      {children}
    </div>
  );
}
