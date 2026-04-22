import { useEffect } from 'react';
import { emeraldDeep } from '../lib/tokens';

export default function Toast({ msg, kind, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, []);

  const bg =
    kind === 'error' ? 'oklch(0.45 0.18 27)' :
    kind === 'warning' ? 'oklch(0.38 0.12 60)' :
    emeraldDeep;

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: bg, color: 'white', padding: '12px 18px',
      borderRadius: 'var(--r)', fontSize: 14, maxWidth: 320,
      lineHeight: 1.5, boxShadow: '0 4px 16px oklch(0 0 0 / 0.15)',
    }}>
      {msg}
    </div>
  );
}
