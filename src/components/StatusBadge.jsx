import { paperSoft, inkSoft } from '../lib/tokens';

export default function StatusBadge({ s }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 8px',
      borderRadius: 'var(--r)', background: paperSoft, fontSize: 12,
      color: inkSoft, textTransform: 'capitalize',
    }}>
      {s?.replace(/_/g, ' ')}
    </span>
  );
}
