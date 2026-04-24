import { useState, useEffect, useMemo } from 'react';
import Shell from '../components/Shell';
import Icon from '../components/Icon';
import { supabase } from '../lib/supabase';
import { fmt$, fmtN, fmtDate, ink, inkSoft, inkMuted, hairline, hairlineStrong, paper, paperSoft, emeraldDeep, emeraldSoft } from '../lib/tokens';

const KPI = ({ label, value, hint, icon, tone = 'default' }) => {
  const tones = {
    default: { bg: paper, border: `1px solid ${hairline}`, lc: inkMuted, vc: ink, hc: inkMuted },
    emerald: { bg: emeraldSoft, border: '1px solid oklch(0.42 0.09 165 / 0.3)', lc: emeraldDeep, vc: emeraldDeep, hc: emeraldDeep },
    dark:    { bg: ink, border: `1px solid ${ink}`, lc: 'oklch(1 0 0 / 0.55)', vc: 'oklch(0.985 0.005 85)', hc: 'oklch(1 0 0 / 0.5)' },
    amber:   { bg: 'var(--amber)', border: '1px solid var(--amber-border)', lc: 'var(--amber-text)', vc: 'var(--amber-text)', hc: 'var(--amber-text)' },
    sky:     { bg: 'var(--sky)', border: '1px solid var(--sky-border)', lc: 'var(--sky-text)', vc: 'var(--sky-text)', hc: 'var(--sky-text)' },
  };
  const c = tones[tone];
  return (
    <div style={{ borderRadius: 'var(--r)', padding: '20px 24px', border: c.border, background: c.bg }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: c.lc }}>{label}</p>
        {icon && <Icon name={icon} size={15} style={{ color: c.lc }} />}
      </div>
      <p style={{ marginTop: 12, fontFamily: 'Fraunces, Georgia, serif', fontSize: 30, lineHeight: 1, color: c.vc }}>{value}</p>
      {hint && <p style={{ marginTop: 8, fontSize: 12, color: c.hc }}>{hint}</p>}
    </div>
  );
};

function MonthlyChart({ sales }) {
  const months = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleString('en-US', { month: 'short' }),
        year: d.getFullYear(),
        month: d.getMonth(),
      };
    });
  }, []);

  const data = useMemo(() => {
    return months.map((m) => {
      const total = sales
        .filter((s) => {
          const d = new Date(s.sold_at);
          return d.getFullYear() === m.year && d.getMonth() === m.month;
        })
        .reduce((sum, s) => sum + s.amount_cents, 0);
      return { ...m, total };
    });
  }, [sales, months]);

  const max = Math.max(...data.map((d) => d.total), 1);
  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  return (
    <div style={{ border: `1px solid ${hairline}`, borderRadius: 'var(--r)', background: paper, padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: ink }}>Monthly revenue</p>
        <p style={{ fontSize: 12, color: inkMuted }}>Last 6 months · all clients</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 120 }}>
        {data.map((m) => {
          const pct = max > 0 ? (m.total / max) * 100 : 0;
          const isCurrent = m.key === currentMonth;
          return (
            <div key={m.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 10, color: m.total > 0 ? ink : inkMuted, fontWeight: m.total > 0 ? 500 : 400 }}>
                {m.total > 0 ? fmt$(m.total) : '—'}
              </span>
              <div style={{ width: '100%', height: `${Math.max(pct, 4)}%`, borderRadius: '3px 3px 0 0', background: isCurrent ? ink : (m.total > 0 ? 'oklch(0.42 0.09 165)' : hairline), transition: 'height 0.3s ease' }} />
              <span style={{ fontSize: 11, color: isCurrent ? ink : inkMuted, fontWeight: isCurrent ? 600 : 400 }}>{m.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusDot({ active }) {
  return (
    <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: active ? 'oklch(0.42 0.09 165)' : hairlineStrong, flexShrink: 0 }} />
  );
}

export default function AdminDashboardPage({ setPage, setClientId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [
      { data: clients },
      { data: sales },
      { data: customers },
      { data: emails },
      { data: bookings },
    ] = await Promise.all([
      supabase.from('clients').select('*').order('name'),
      supabase.from('sales').select('amount_cents, redeemed_cents, sold_at, client_id, product_id').order('sold_at', { ascending: false }),
      supabase.from('customers').select('id, client_id'),
      supabase.from('email_campaigns').select('id, client_id, subject, status, send_date, created_at').order('created_at', { ascending: false }).limit(50),
      supabase.from('audit_bookings').select('id, name, email, created_at').order('created_at', { ascending: false }).limit(5),
    ]);

    setData({ clients: clients || [], sales: sales || [], customers: customers || [], emails: emails || [], bookings: bookings || [] });
    setLoading(false);
  }

  const stats = useMemo(() => {
    if (!data) return null;
    const { clients, sales, customers, emails } = data;
    const since30 = Date.now() - 30 * 86400000;

    const totalRevenue = sales.reduce((s, r) => s + r.amount_cents, 0);
    const revenue30 = sales.filter((s) => new Date(s.sold_at).getTime() >= since30).reduce((s, r) => s + r.amount_cents, 0);
    const activeClients = clients.filter((c) => c.is_active).length;
    const totalCustomers = customers.length;
    const pendingEmails = emails.filter((e) => e.status === 'pending_approval').length;

    const perClient = clients.map((c) => {
      const cSales = sales.filter((s) => s.client_id === c.id);
      const cSales30 = cSales.filter((s) => new Date(s.sold_at).getTime() >= since30);
      const cCustomers = customers.filter((cu) => cu.client_id === c.id).length;
      const cPending = emails.filter((e) => e.client_id === c.id && e.status === 'pending_approval').length;
      const cAllTime = cSales.reduce((s, r) => s + r.amount_cents, 0);
      const cLast30 = cSales30.reduce((s, r) => s + r.amount_cents, 0);
      const lastSale = cSales[0]?.sold_at || null;
      return { ...c, allTime: cAllTime, last30: cLast30, customers: cCustomers, pending: cPending, lastSale };
    }).sort((a, b) => b.last30 - a.last30);

    const pendingEmailList = emails.filter((e) => e.status === 'pending_approval').slice(0, 5);
    const recentSales = sales.slice(0, 5);

    return { totalRevenue, revenue30, activeClients, totalCustomers, pendingEmails, perClient, pendingEmailList, recentSales };
  }, [data]);

  if (loading || !stats) {
    return (
      <Shell title="Dashboard">
        <p style={{ color: inkMuted, fontSize: 14 }}>Loading…</p>
      </Shell>
    );
  }

  const clientById = Object.fromEntries((data.clients || []).map((c) => [c.id, c]));

  return (
    <Shell title="Dashboard" subtitle="Full picture across all clients.">

      {/* ── KPIs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 28 }}>
        <KPI label="Active clients" value={stats.activeClients} hint={`of ${data.clients.length} total`} icon="building" />
        <KPI label="All-time revenue" value={fmt$(stats.totalRevenue)} icon="wallet" tone="dark" />
        <KPI label="Last 30 days" value={fmt$(stats.revenue30)} hint="across all clients" icon="trending-up" tone="emerald" />
        <KPI label="Total customers" value={fmtN(stats.totalCustomers)} hint="in all CRMs" icon="users" tone="sky" />
        <KPI
          label="Emails pending"
          value={stats.pendingEmails}
          hint={stats.pendingEmails > 0 ? 'Need your approval' : 'All clear'}
          icon="mail"
          tone={stats.pendingEmails > 0 ? 'amber' : 'default'}
        />
      </div>

      {/* ── Chart + Activity ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, marginBottom: 28 }}>
        <MonthlyChart sales={data.sales} />

        {/* Activity feed */}
        <div style={{ border: `1px solid ${hairline}`, borderRadius: 'var(--r)', background: paper, padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: ink, marginBottom: 16 }}>Recent activity</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Pending emails */}
            {stats.pendingEmailList.map((e) => (
              <div key={e.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: `1px solid ${hairline}` }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <Icon name="mail" size={13} style={{ color: 'var(--amber-text)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.subject}</p>
                  <p style={{ fontSize: 11, color: inkMuted, marginTop: 2 }}>
                    {clientById[e.client_id]?.name || '—'} · awaiting approval
                  </p>
                </div>
              </div>
            ))}
            {/* Recent sales */}
            {stats.recentSales.map((s) => (
              <div key={s.sold_at + s.client_id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: `1px solid ${hairline}` }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: emeraldSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <Icon name="gift" size={13} style={{ color: emeraldDeep }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: ink }}>{fmt$(s.amount_cents)} gift card sold</p>
                  <p style={{ fontSize: 11, color: inkMuted, marginTop: 2 }}>
                    {clientById[s.client_id]?.name || '—'} · {fmtDate(s.sold_at)}
                  </p>
                </div>
              </div>
            ))}
            {stats.pendingEmailList.length === 0 && stats.recentSales.length === 0 && (
              <p style={{ fontSize: 13, color: inkMuted, fontStyle: 'italic' }}>No recent activity.</p>
            )}
          </div>
          {/* Recent bookings */}
          {data.bookings.length > 0 && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${hairline}` }}>
              <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: inkMuted, marginBottom: 10 }}>New audit bookings</p>
              {data.bookings.map((b) => (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: `1px solid ${hairline}` }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: paperSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="calendar" size={13} style={{ color: inkSoft }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</p>
                    <p style={{ fontSize: 11, color: inkMuted }}>{b.email} · {fmtDate(b.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Client performance table ── */}
      <div style={{ border: `1px solid ${hairline}`, borderRadius: 'var(--r)', background: paper, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: ink }}>Client performance</p>
          <p style={{ fontSize: 12, color: inkMuted }}>Sorted by last 30 days revenue</p>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${hairline}`, background: paperSoft }}>
              {['Client', 'Status', 'Last 30 days', 'All-time', 'Customers', 'Pending emails', 'Last sale', ''].map((h) => (
                <th key={h} style={{ padding: '10px 20px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: inkMuted, fontWeight: 500, textAlign: h === '' ? 'right' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.perClient.map((c) => (
              <tr key={c.id} style={{ borderBottom: `1px solid ${hairline}` }}
                onMouseEnter={(e) => e.currentTarget.style.background = paperSoft}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '14px 20px' }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: ink }}>{c.name}</p>
                  {c.industry && <p style={{ fontSize: 12, color: inkMuted, marginTop: 2 }}>{c.industry}</p>}
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: c.is_active ? emeraldDeep : inkMuted }}>
                    <StatusDot active={c.is_active} />
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: c.last30 > 0 ? ink : inkMuted }}>{c.last30 > 0 ? fmt$(c.last30) : '—'}</p>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <p style={{ fontSize: 14, color: c.allTime > 0 ? ink : inkMuted }}>{c.allTime > 0 ? fmt$(c.allTime) : '—'}</p>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <p style={{ fontSize: 14, color: c.customers > 0 ? ink : inkMuted }}>{c.customers > 0 ? fmtN(c.customers) : '—'}</p>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  {c.pending > 0 ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--amber-text)', background: 'var(--amber)', border: '1px solid var(--amber-border)', borderRadius: 4, padding: '2px 8px' }}>
                      <Icon name="mail" size={11} /> {c.pending}
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, color: inkMuted }}>—</span>
                  )}
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <p style={{ fontSize: 12, color: inkMuted }}>{c.lastSale ? fmtDate(c.lastSale) : 'No sales yet'}</p>
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  {setClientId && (
                    <button
                      onClick={() => { setClientId(c.id); setPage('overview'); }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: emeraldDeep, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0 }}
                    >
                      View <Icon name="arrow-right" size={12} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {stats.perClient.length === 0 && (
              <tr><td colSpan={8} style={{ padding: '32px 20px', textAlign: 'center', color: inkMuted, fontSize: 14 }}>No clients yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
