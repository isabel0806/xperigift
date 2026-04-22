import { useState } from 'react';
import LogoMark from '../components/LogoMark';
import Btn from '../components/Btn';
import Field from '../components/Field';
import LoadSpinner from '../components/LoadSpinner';
import { paper, paperSoft, ink, inkSoft, inkMuted, hairline, hairlineStrong } from '../lib/tokens';

const inputSt = (err) => ({
  width: '100%', height: 44,
  border: `1px solid ${err ? 'oklch(0.55 0.18 27)' : hairlineStrong}`,
  borderRadius: 'var(--r)', background: paper, padding: '0 12px',
  fontSize: 15, color: ink, outline: 'none',
});

export default function LoginPage({ onLogin, toast }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await onLogin(email.trim(), pw);
    } catch (error) {
      setErr(error.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: paper }}>
      <header style={{ borderBottom: `1px solid ${hairline}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <LogoMark />
          <span style={{ fontSize: 14, color: inkSoft }}>Client portal</span>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 20px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.16em', color: inkMuted }}>Client portal</p>
          <h1 style={{ marginTop: 12, fontSize: 36, fontWeight: 400, color: ink, lineHeight: 1.1 }}>Sign in</h1>
          <p style={{ marginTop: 12, fontSize: 15, color: inkSoft, lineHeight: 1.6 }}>
            Access your gift card revenue data, customers, and campaigns.
          </p>

          <form onSubmit={submit} style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Field label="Email">
              <input
                type="email" autoComplete="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@business.com"
                style={inputSt(!!err)}
              />
            </Field>
            <Field label="Password">
              <input
                type="password" autoComplete="current-password" required
                value={pw} onChange={(e) => setPw(e.target.value)}
                style={inputSt(!!err)}
              />
            </Field>
            {err && (
              <p style={{ padding: '10px 12px', background: 'oklch(0.97 0.03 27)', border: '1px solid oklch(0.85 0.08 27)', borderRadius: 'var(--r)', fontSize: 13, color: 'oklch(0.4 0.18 27)' }}>
                {err}
              </p>
            )}
            <Btn type="submit" primary fullWidth disabled={loading}>
              {loading ? <><LoadSpinner /> Signing in…</> : 'Sign in'}
            </Btn>
          </form>

          <p style={{ marginTop: 32, fontSize: 13, color: inkMuted }}>
            Accounts are issued by xperigift.{' '}
            <span style={{ textDecoration: 'underline', textUnderlineOffset: 4, cursor: 'pointer' }}>Need access?</span>
          </p>
        </div>
      </main>
    </div>
  );
}
