import { ink, emerald } from '../lib/tokens';

export default function LogoMark() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', color: ink, lineHeight: 1 }}>
        xperigift
      </span>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: emerald }} />
    </div>
  );
}
