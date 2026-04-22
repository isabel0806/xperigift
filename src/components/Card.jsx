import { hairline, paper } from '../lib/tokens';

export default function Card({ children, style = {} }) {
  return (
    <div style={{ border: `1px solid ${hairline}`, borderRadius: 'var(--r)', background: paper, padding: 24, ...style }}>
      {children}
    </div>
  );
}
