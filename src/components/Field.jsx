import { ink, inkMuted } from '../lib/tokens';

export default function Field({ label, hint, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: ink, marginBottom: 6 }}>
        {label}
        {hint && <span style={{ fontSize: 11, fontWeight: 400, color: inkMuted, marginLeft: 6 }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}
