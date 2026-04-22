import { useState, useEffect } from 'react';
import Shell from '../components/Shell';
import Card from '../components/Card';
import Icon from '../components/Icon';
import { supabase } from '../lib/supabase';
import { fmtDate, ink, inkMuted, paperSoft, hairlineStrong } from '../lib/tokens';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('email_templates').select('*').order('updated_at', { ascending: false });
      setTemplates(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <Shell title="Templates" subtitle="Reusable email templates managed by the Xperigift team.">
      {loading ? (
        <p style={{ color: inkMuted, fontSize: 14 }}>Loading…</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {templates.map((tp) => (
            <Card key={tp.id}>
              <div style={{ height: 72, background: paperSoft, borderRadius: 'var(--r)', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="mail" size={24} color="var(--hairline-strong)" />
              </div>
              <h3 style={{ fontSize: 17, color: ink }}>{tp.name}</h3>
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                {(tp.tags || []).map((tag) => (
                  <span key={tag} style={{ fontSize: 11, padding: '2px 8px', background: paperSoft, borderRadius: 9999, color: inkMuted }}>{tag}</span>
                ))}
              </div>
              <p style={{ fontSize: 12, color: inkMuted, marginTop: 10 }}>
                Updated {tp.updated_at ? fmtDate(tp.updated_at) : '—'}
              </p>
            </Card>
          ))}
          {templates.length === 0 && (
            <p style={{ color: inkMuted, fontSize: 14 }}>No templates yet.</p>
          )}
        </div>
      )}
    </Shell>
  );
}
