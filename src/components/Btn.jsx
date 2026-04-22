import Icon from './Icon';
import { ink, paper, hairlineStrong } from '../lib/tokens';

export default function Btn({ children, icon, primary, disabled, onClick, type = 'button', fullWidth }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        height: primary && fullWidth ? 44 : primary ? 40 : 36,
        padding: fullWidth ? '0' : '0 12px',
        width: fullWidth ? '100%' : undefined,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        borderRadius: 'var(--r)',
        border: primary ? 'none' : `1px solid ${hairlineStrong}`,
        background: primary ? ink : paper,
        color: primary ? paper : ink,
        fontSize: 13, fontWeight: primary ? 500 : 400,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'opacity 0.1s',
        whiteSpace: 'nowrap',
      }}
    >
      {icon && <Icon name={icon} size={13} />}
      {children}
    </button>
  );
}
