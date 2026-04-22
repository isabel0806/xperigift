import Icon from './Icon';
import LogoMark from './LogoMark';
import { paper, paperSoft, ink, inkSoft, inkMuted, hairline, hairlineStrong, emerald } from '../lib/tokens';

const NAV = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'sales', label: 'Sales', icon: 'bar-chart' },
  { id: 'redeem', label: 'Redeem', icon: 'scan' },
  { id: 'products', label: 'Products', icon: 'gift' },
  { id: 'customers', label: 'Customers', icon: 'users' },
  { id: 'emails', label: 'Emails', icon: 'mail' },
  { id: 'templates', label: 'Templates', icon: 'file-text' },
];

const NAV_ADMIN = [
  { id: 'admin-clients', label: 'Clients', icon: 'building' },
  { id: 'admin-bookings', label: 'Audit bookings', icon: 'settings' },
];

export default function DashLayout({ user, profile, clients, clientId, setClientId, page, setPage, onLogout, pendingCount, children }) {
  const isAdmin = profile?.role === 'admin';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: paperSoft }}>
      <aside style={{ width: 256, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${hairline}`, background: paper, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: `1px solid ${hairline}` }}>
          <LogoMark />
        </div>

        {clients.length > 0 && (
          <div style={{ borderBottom: `1px solid ${hairline}`, padding: 16 }}>
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: inkMuted, marginBottom: 8 }}>Workspace</p>
            {clients.length === 1 ? (
              <p style={{ fontSize: 14, color: ink, fontWeight: 500 }}>{clients[0].name}</p>
            ) : (
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                style={{ width: '100%', height: 36, border: `1px solid ${hairlineStrong}`, borderRadius: 'var(--r)', background: paper, padding: '0 8px', fontSize: 14, color: ink, cursor: 'pointer' }}
              >
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>
        )}

        <nav style={{ flex: 1, padding: 12 }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {NAV.map((item) => {
              const active = page === item.id;
              const badge = item.id === 'emails' && pendingCount > 0;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setPage(item.id)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 'var(--r)', fontSize: 14, fontWeight: active ? 500 : 400, color: active ? ink : inkSoft, background: active ? 'oklch(0.18 0.01 270 / 0.05)' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <Icon name={item.icon} size={16} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {badge && (
                      <span style={{ background: emerald, color: 'white', fontSize: 11, fontWeight: 600, borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {pendingCount}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {isAdmin && (
            <>
              <p style={{ margin: '24px 0 8px 12px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: inkMuted }}>Admin</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {NAV_ADMIN.map((item) => {
                  const active = page === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setPage(item.id)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 'var(--r)', fontSize: 14, color: active ? ink : inkSoft, background: active ? 'oklch(0.18 0.01 270 / 0.05)' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: active ? 500 : 400 }}
                      >
                        <Icon name={item.icon} size={16} />
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </nav>

        <div style={{ borderTop: `1px solid ${hairline}`, padding: 16 }}>
          <p style={{ fontSize: 12, color: inkMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
          <button onClick={onLogout} style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: inkSoft, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Icon name="log-out" size={14} /> Sign out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>{children}</main>
    </div>
  );
}
