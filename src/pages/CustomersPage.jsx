import { useState, useEffect, useRef, useMemo } from 'react';
import Shell from '../components/Shell';
import KpiCard from '../components/KpiCard';
import Icon from '../components/Icon';
import { TableWrap, THead, TD } from '../components/TableWrap';
import { supabase } from '../lib/supabase';
import { fmt$, fmtDate, fmtN, tagColor, ink, inkSoft, inkMuted, hairline, hairlineStrong, paper, paperSoft } from '../lib/tokens';

export default function CustomersPage({ clientId, toast }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingTagFor, setAddingTagFor] = useState(null);
  const [newTagInput, setNewTagInput] = useState('');
  const tagInputRef = useRef();

  useEffect(() => { if (addingTagFor && tagInputRef.current) tagInputRef.current.focus(); }, [addingTagFor]);

  useEffect(() => {
    if (!clientId) return;
    load();
  }, [clientId]);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('customers').select('*').eq('client_id', clientId).order('last_visit', { ascending: false, nullsFirst: false });
    setCustomers(data || []);
    setLoading(false);
  }

  const allTags = useMemo(() => [...new Set(customers.flatMap((c) => c.tags || []))].sort(), [customers]);

  const avgSpend = customers.length ? Math.round(customers.reduce((s, c) => s + c.total_spent, 0) / customers.length) : 0;
  const repeats = customers.filter((c) => c.visits > 1).length;

  const addTag = async (cid, tag) => {
    if (!tag.trim()) return;
    const customer = customers.find((c) => c.id === cid);
    if (!customer || customer.tags?.includes(tag)) return;
    const newTags = [...(customer.tags || []), tag];
    const { error } = await supabase.from('customers').update({ tags: newTags }).eq('id', cid);
    if (error) { toast('Failed to add tag', 'error'); return; }
    setCustomers((prev) => prev.map((c) => c.id === cid ? { ...c, tags: newTags } : c));
    setNewTagInput('');
    setAddingTagFor(null);
    toast(`Tag "${tag}" added`);
  };

  const removeTag = async (cid, tag) => {
    const customer = customers.find((c) => c.id === cid);
    if (!customer) return;
    const newTags = (customer.tags || []).filter((t) => t !== tag);
    const { error } = await supabase.from('customers').update({ tags: newTags }).eq('id', cid);
    if (error) { toast('Failed to remove tag', 'error'); return; }
    setCustomers((prev) => prev.map((c) => c.id === cid ? { ...c, tags: newTags } : c));
  };

  return (
    <Shell title="Customers" subtitle="Gift card buyers — manage tags to target email campaigns.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Total" value={fmtN(customers.length)} tone="ink" icon="users" />
        <KpiCard label="Avg spend" value={fmt$(avgSpend)} tone="emerald" icon="dollar-sign" />
        <KpiCard label="Repeat buyers" value={fmtN(repeats)} hint={customers.length ? `${Math.round(repeats / customers.length * 100)}% of base` : '—'} icon="trending-up" />
      </div>

      {allTags.length > 0 && (
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: inkMuted, textTransform: 'uppercase', letterSpacing: '0.12em', marginRight: 4 }}>Tags in use:</span>
          {allTags.map((tag) => (
            <span key={tag} style={{ fontSize: 12, padding: '3px 10px', borderRadius: 9999, background: tagColor(tag, allTags) + '22', color: tagColor(tag, allTags), border: `1px solid ${tagColor(tag, allTags)}44`, fontWeight: 500 }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {loading ? (
        <p style={{ color: inkMuted, fontSize: 14 }}>Loading…</p>
      ) : (
        <TableWrap>
          <thead><THead cols={['Name', 'Email', 'Total spent', 'Visits', 'Last visit', 'Tags']} /></thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} style={{ borderBottom: `1px solid ${hairline}` }}>
                <TD bold>{c.name}</TD>
                <TD muted>{c.email}</TD>
                <TD>{fmt$(c.total_spent)}</TD>
                <TD muted>{c.visits}</TD>
                <TD muted>{c.last_visit ? fmtDate(c.last_visit) : '—'}</TD>
                <td style={{ padding: '8px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {(c.tags || []).map((tag) => (
                      <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '2px 8px 2px 10px', borderRadius: 9999, background: tagColor(tag, allTags) + '22', color: tagColor(tag, allTags), border: `1px solid ${tagColor(tag, allTags)}44`, fontWeight: 500 }}>
                        {tag}
                        <button onClick={() => removeTag(c.id, tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: tagColor(tag, allTags), padding: 0, opacity: 0.7 }}>
                          <Icon name="x" size={10} />
                        </button>
                      </span>
                    ))}
                    {addingTagFor === c.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <input
                          ref={tagInputRef} value={newTagInput} onChange={(e) => setNewTagInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') addTag(c.id, newTagInput); if (e.key === 'Escape') { setAddingTagFor(null); setNewTagInput(''); } }}
                          placeholder="New tag…"
                          style={{ height: 24, width: 90, border: `1px solid ${hairlineStrong}`, borderRadius: 9999, padding: '0 8px', fontSize: 11, outline: 'none', background: paper, color: ink }}
                        />
                        {allTags.filter((t) => !(c.tags || []).includes(t) && (!newTagInput || t.toLowerCase().includes(newTagInput.toLowerCase()))).slice(0, 4).map((t) => (
                          <button key={t} onClick={() => addTag(c.id, t)} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 9999, background: paperSoft, border: `1px solid ${hairlineStrong}`, color: inkSoft, cursor: 'pointer' }}>{t}</button>
                        ))}
                        <button onClick={() => { setAddingTagFor(null); setNewTagInput(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: inkMuted, padding: 0 }}>
                          <Icon name="x" size={12} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setAddingTagFor(c.id)} style={{ height: 22, width: 22, borderRadius: '50%', border: `1px dashed ${hairlineStrong}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: inkMuted }}>
                        <Icon name="plus" size={11} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '32px 16px', textAlign: 'center', color: inkMuted, fontSize: 14 }}>No customers yet.</td></tr>
            )}
          </tbody>
        </TableWrap>
      )}
    </Shell>
  );
}
