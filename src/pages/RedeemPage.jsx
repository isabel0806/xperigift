import { useState } from 'react';
import Shell from '../components/Shell';
import Btn from '../components/Btn';
import { Stat } from '../components/TableWrap';
import { supabase } from '../lib/supabase';
import { fmt$, ink, inkMuted, hairline, hairlineStrong, emeraldSoft, emeraldDeep } from '../lib/tokens';

export default function RedeemPage({ clientId, toast, user }) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [gratuityPct, setGratuityPct] = useState(null);
  const [amount, setAmount] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  const lookup = async () => {
    if (!code.trim()) return;
    setLookingUp(true);
    const { data, error } = await supabase
      .from('sales')
      .select('*, products(gratuity_pct)')
      .eq('client_id', clientId)
      .ilike('card_code', code.trim())
      .single();
    setLookingUp(false);
    if (error || !data) {
      toast('Card not found — check the code and try again', 'error');
      setResult(null);
      setGratuityPct(null);
      return;
    }
    setResult(data);
    setGratuityPct(data.products?.gratuity_pct ?? null);
    setAmount('');
  };

  const redeem = async () => {
    const cents = Math.round(parseFloat(amount) * 100);
    const rem = result.amount_cents - result.redeemed_cents;
    if (!cents || cents <= 0) { toast('Enter an amount to redeem', 'error'); return; }
    if (cents > rem) { toast(`Amount exceeds remaining balance (${fmt$(rem)})`, 'error'); return; }
    setRedeeming(true);
    const newRedeemed = result.redeemed_cents + cents;
    const newStatus = newRedeemed >= result.amount_cents ? 'redeemed' : 'partially_redeemed';
    const { error } = await supabase
      .from('sales')
      .update({
        redeemed_cents: newRedeemed,
        status: newStatus,
        redeemed_by: user?.email ?? null,
        redeemed_at: new Date().toISOString(),
      })
      .eq('id', result.id);
    setRedeeming(false);
    if (error) { toast('Failed to record redemption', 'error'); return; }
    toast(`Redeemed ${fmt$(cents)} from card ${result.card_code}`);
    setResult(null);
    setGratuityPct(null);
    setCode('');
    setAmount('');
  };

  const remaining = result ? result.amount_cents - result.redeemed_cents : 0;
  const redeemAmount = parseFloat(amount) || 0;
  const gratuityAmount = (gratuityPct && redeemAmount > 0) ? (redeemAmount * gratuityPct) / 100 : null;

  return (
    <Shell title="Redeem" subtitle="Look up a gift card by code and record a redemption.">
      <div style={{ maxWidth: 480 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. XG-4821"
            onKeyDown={(e) => e.key === 'Enter' && lookup()}
            style={{ flex: 1, height: 44, border: `1px solid ${hairlineStrong}`, borderRadius: 'var(--r)', background: 'var(--paper)', padding: '0 12px', fontSize: 15, color: ink, outline: 'none', fontFamily: 'ui-monospace, monospace' }}
          />
          <Btn primary onClick={lookup} disabled={lookingUp}>{lookingUp ? 'Looking up…' : 'Look up'}</Btn>
        </div>

        {result && (
          <div style={{ marginTop: 24, border: `1px solid ${hairline}`, borderRadius: 'var(--r)', background: 'var(--paper)', padding: 24 }}>
            <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.14em', color: inkMuted }}>Card found</p>
            <p style={{ fontSize: 20, fontFamily: 'Fraunces, Georgia, serif', color: ink, marginTop: 8 }}>{result.card_code}</p>
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Stat label="Product" value={result.product_name} />
              <Stat label="Remaining" value={fmt$(remaining)} big emeraldColor />
              <Stat label="Buyer" value={result.buyer_name || '—'} />
              <Stat label="Status" value={result.status.replace(/_/g, ' ')} />
              {result.redeemed_by && <Stat label="Last redeemed by" value={result.redeemed_by} />}
              {gratuityPct != null && (
                <Stat label={`Gratuity (${gratuityPct}%)`} value={gratuityAmount != null ? fmt$(Math.round(gratuityAmount * 100)) : '—'} />
              )}
            </div>

            {remaining > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="number" step="0.01" min="0" placeholder="Amount ($)"
                    value={amount} onChange={(e) => setAmount(e.target.value)}
                    style={{ flex: 1, height: 40, border: `1px solid ${hairlineStrong}`, borderRadius: 'var(--r)', background: 'var(--paper)', padding: '0 12px', fontSize: 14, color: ink, outline: 'none' }}
                  />
                  <Btn primary onClick={redeem} disabled={redeeming}>{redeeming ? 'Redeeming…' : 'Redeem'}</Btn>
                </div>

                {/* Gratuity tip callout */}
                {gratuityPct != null && gratuityAmount != null && (
                  <div style={{ marginTop: 12, padding: '12px 16px', background: emeraldSoft, borderRadius: 'var(--r)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: emeraldDeep, fontWeight: 500 }}>
                      Tip ({gratuityPct}%)
                    </span>
                    <span style={{ fontSize: 18, fontWeight: 600, color: emeraldDeep }}>
                      {fmt$(Math.round(gratuityAmount * 100))}
                    </span>
                  </div>
                )}

                {user?.email && (
                  <p style={{ marginTop: 8, fontSize: 12, color: inkMuted }}>
                    Redemption will be recorded as: <strong>{user.email}</strong>
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}
