import { useState, useEffect } from 'react';
import Shell from '../components/Shell';
import KpiCard from '../components/KpiCard';
import Icon from '../components/Icon';
import { supabase } from '../lib/supabase';
import { fmt$, fmtN, ink, inkMuted, hairline, paperSoft } from '../lib/tokens';

export default function OverviewPage({ clientId, clientName, pendingCount, setPage }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;
    async function load() {
      setLoading(true);
      const [salesRes, custRes] = await Promise.all([
        supabase.from('sales').select('amount_cents, redeemed_cents, sold_at').eq('client_id', clientId),
        supabase.from('customers').select('id', { count: 'exact', head: true }).eq('client_id', clientId),
      ]);
      const sales = salesRes.data || [];
      const since30 = Date.now() - 30 * 86400000;
      const last30 = sales.filter((r) => new Date(r.sold_at).getTime() >= since30);
      setStats({
        totalIssued: sales.reduce((s, r) => s + r.amount_cents, 0),
        totalRedeemed: sales.reduce((s, r) => s + r.redeemed_cents, 0),
        last30Issued: last30.reduce((s, r) => s + r.amount_cents, 0),
        last30Count: last30.length,
        customerCount: custRes.count || 0,
      });
      setLoading(false);
    }
    load();
  }, [clientId]);

  if (loading) return (
    <Shell title="Overview">
      <p style={{ color: inkMuted, fontSize: 14 }}>Loading…</p>
    </Shell>
  );

  return (
    <Shell title="Overview" subtitle={clientName ? `Snapshot for ${clientName}` : undefined}>
      {pendingCount > 0 && (
        <button
          onClick={() => setPage('emails')}
          style={{ marginBottom: 24, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: 'var(--r)', border: '1px solid var(--amber-border)', background: 'var(--amber)', cursor: 'pointer', textAlign: 'left' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'oklch(0.85 0.12 75)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber-text)' }}>
              <Icon name="mail" size={16} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--amber-text)' }}>
                You have {pendingCount} {pendingCount === 1 ? 'email' : 'emails'} to approve before sending
              </p>
              <p style={{ fontSize: 12, color: 'oklch(0.4 0.1 60)', marginTop: 2 }}>Review and approve drafts in your campaigns queue.</p>
            </div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--amber-text)', display: 'flex', alignItems: 'center', gap: 4 }}>
            Review <Icon name="arrow-right" size={14} />
          </span>
        </button>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <KpiCard label="Last 30 days" value={fmt$(stats.last30Issued)} hint={`${fmtN(stats.last30Count)} cards sold`} tone="emerald" icon="trending-up" />
        <KpiCard label="All-time revenue" value={fmt$(stats.totalIssued)} tone="ink" icon="wallet" />
        <KpiCard label="Outstanding" value={fmt$(stats.totalIssued - stats.totalRedeemed)} hint="Issued minus redeemed" tone="sky" />
        <KpiCard label="Customers" value={fmtN(stats.customerCount)} hint="In your CRM" icon="users" />
      </div>

      <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[
          { id: 'sales', title: 'Review sales', body: 'See gift cards sold, top products, and import new sales from CSV.', cta: 'Open sales' },
          { id: 'emails', title: 'Draft a campaign', body: 'Upload your HTML, schedule a send date, choose customers, and get it approved.', cta: 'Open emails' },
        ].map((card) => (
          <button
            key={card.id}
            onClick={() => setPage(card.id)}
            style={{ padding: 24, border: `1px solid ${hairline}`, borderRadius: 'var(--r)', background: 'var(--paper)', textAlign: 'left', cursor: 'pointer' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--hairline-strong)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--hairline)'}
          >
            <h2 style={{ fontSize: 20, color: ink }}>{card.title}</h2>
            <p style={{ marginTop: 8, fontSize: 14, color: inkMuted, lineHeight: 1.5 }}>{card.body}</p>
            <span style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500, color: 'var(--emerald-deep)' }}>
              {card.cta} <Icon name="arrow-right" size={13} />
            </span>
          </button>
        ))}
      </div>
    </Shell>
  );
}
