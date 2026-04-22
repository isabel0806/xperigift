import { ink } from '../lib/tokens';

export default function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: ink, marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
