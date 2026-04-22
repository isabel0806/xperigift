import { useState, useEffect } from 'react';
import Shell from '../components/Shell';
import { TableWrap, THead, TD } from '../components/TableWrap';
import { supabase } from '../lib/supabase';
import { inkMuted, emeraldDeep } from '../lib/tokens';

export default function AdminClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('clients').select('*').order('name');
      setClients(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <Shell title="Clients" subtitle="All businesses using xperigift.">
      {loading ? (
        <p style={{ color: inkMuted, fontSize: 14 }}>Loading…</p>
      ) : (
        <TableWrap>
          <thead><THead cols={['Name', 'Industry', 'Status']} /></thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--hairline)' }}>
                <TD bold>{c.name}</TD>
                <TD muted>{c.industry || '—'}</TD>
                <TD>
                  <span style={{ fontSize: 12, fontWeight: 500, color: c.is_active ? emeraldDeep : inkMuted }}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </TD>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr><td colSpan={3} style={{ padding: '32px 16px', textAlign: 'center', color: inkMuted, fontSize: 14 }}>No clients.</td></tr>
            )}
          </tbody>
        </TableWrap>
      )}
    </Shell>
  );
}
