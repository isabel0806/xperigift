import { useState, useEffect } from 'react';
import Shell from '../components/Shell';
import Btn from '../components/Btn';
import KpiCard from '../components/KpiCard';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { TableWrap, THead, TD } from '../components/TableWrap';
import { supabase } from '../lib/supabase';
import { fmt$, fmtDate, fmtN, ink, inkMuted, inkSoft, hairline, paperSoft, emerald, hairlineStrong } from '../lib/tokens';

const PAL = ['oklch(0.42 0.09 165)', 'oklch(0.55 0.14 240)', 'oklch(0.62 0.16 55)', 'oklch(0.5 0.16 320)', 'oklch(0.55 0.14 200)'];

export default function SalesPage({ clientId, toast }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!clientId) return;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('client_id', clientId)
        .order('sold_at', { ascending: false });
      if (!error) setSales(data || []);
      setLoading(false);
    }
    load();
  }, [clientId]);

  const filtered = filterStatus === 'all' ? sales : sales.filter((r) => r.status === filterStatus);

  const kpis = {
    count: sales.length,
    total: sales.reduce((s, r) => s + r.amount_cents, 0),
    avg: sales.length ? Math.round(sales.reduce((s, r) => s + r.amount_cents, 0) / sales.length) : 0,
    redeemed: sales.reduce((s, r) => s + r.redeemed_cents, 0),
  };

  const breakdown = Object.entries(
    sales.reduce((acc, r) => {
      const k = r.product_name || 'Other';
      if (!acc[k]) acc[k] = { count: 0, amount: 0 };
      acc[k].count++;
      acc[k].amount += r.amount_cents;
      return acc;
    }, {})
  ).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.amount - a.amount);

  const maxB = breakdown[0]?.amount || 1;

  const exportCSV = () => {
    const rows = [['Sold', 'Card Code', 'Product', 'Amount', 'Redeemed', 'Status', 'Buyer']];
    sales.forEach((r) => rows.push([
      fmtDate(r.sold_at), r.card_code, r.product_name,
      (r.amount_cents / 100).toFixed(2), (r.redeemed_cents / 100).toFixed(2),
      r.status, r.buyer_name || '',
    ]));
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'sales.csv';
    a.click();
    toast('Exported sales.csv');
  };

  return (
    <Shell
      title="Sales"
      subtitle="Gift cards sold, revenue, and breakdown by service or bundle."
      actions={
        <>
          <Btn icon="download" onClick={exportCSV}>Export</Btn>
          <Btn icon="plus" primary onClick={() => toast('New sale — coming soon')}>New sale</Btn>
        </>
      }
    >
      {loading ? (
        <p style={{ color: inkMuted, fontSize: 14 }}>Loading…</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <KpiCard label="Cards sold" value={fmtN(kpis.count)} tone="ink" icon="shopping-bag" />
            <KpiCard label="Revenue" value={fmt$(kpis.total)} tone="emerald" icon="dollar-sign" />
            <KpiCard label="Avg ticket" value={fmt$(kpis.avg)} icon="trending-up" />
            <KpiCard label="Redeemed" value={fmt$(kpis.redeemed)} hint={kpis.total ? `${Math.round(kpis.redeemed / kpis.total * 100)}% of issued` : '—'} tone="sky" />
          </div>

          {breakdown.length > 0 && (
            <Card style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, color: ink }}>Top products</h2>
                <span style={{ fontSize: 12, color: inkMuted }}>By revenue</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {breakdown.map((p, i) => (
                  <div key={p.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: ink }}>{p.name}</span>
                      <span style={{ color: inkSoft }}>{fmt$(p.amount)} · {p.count} cards</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 9999, background: paperSoft, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(p.amount / maxB) * 100}%`, background: PAL[i % PAL.length], borderRadius: 9999 }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: inkMuted }}>Status</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ height: 36, border: `1px solid ${hairlineStrong}`, borderRadius: 'var(--r)', background: 'var(--paper)', padding: '0 8px', fontSize: 13, color: ink }}
            >
              {['all', 'sold', 'partially_redeemed', 'redeemed', 'refunded', 'expired'].map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <span style={{ marginLeft: 'auto', fontSize: 13, color: inkMuted }}>{filtered.length} rows</span>
          </div>

          <TableWrap style={{ marginTop: 8 }}>
            <thead><THead cols={['Sold', 'Card', 'Product', 'Amount', 'Redeemed', 'Status', 'Buyer', 'Action']} /></thead>
            <tbody>
              {filtered.map((r) => {
                const canRedeem = (r.amount_cents - r.redeemed_cents) > 0 && r.status !== 'refunded' && r.status !== 'expired';
                return (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${hairline}` }}>
                    <TD muted>{fmtDate(r.sold_at)}</TD>
                    <TD muted style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>{r.card_code}</TD>
                    <TD>{r.product_name}</TD>
                    <TD bold>{fmt$(r.amount_cents)}</TD>
                    <TD muted>{fmt$(r.redeemed_cents)}</TD>
                    <TD><StatusBadge s={r.status} /></TD>
                    <TD muted>{r.buyer_name || '—'}</TD>
                    <TD right>
                      <Btn icon="scan" disabled={!canRedeem} onClick={() => toast(`Remaining: ${fmt$(r.amount_cents - r.redeemed_cents)} — use Redeem page`)}>
                        Redeem
                      </Btn>
                    </TD>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ padding: '32px 16px', textAlign: 'center', color: inkMuted, fontSize: 14 }}>No sales found.</td></tr>
              )}
            </tbody>
          </TableWrap>
        </>
      )}
    </Shell>
  );
}
