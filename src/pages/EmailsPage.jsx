import { useState, useEffect, useRef, useMemo } from 'react';
import Shell from '../components/Shell';
import Btn from '../components/Btn';
import Icon from '../components/Icon';
import { TableWrap, THead, TD } from '../components/TableWrap';
import { supabase } from '../lib/supabase';
import { fmt$, fmtDate, ink, inkSoft, inkMuted, hairline, hairlineStrong, paper, paperSoft, emeraldDeep } from '../lib/tokens';

/* ── EMAIL LIST ────────────────────────────────────────────── */
export default function EmailsPage({ clientId, toast }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    load();
    supabase.from('customers').select('id, tags').eq('client_id', clientId).then(({ data }) => setCustomers(data || []));
  }, [clientId]);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('email_campaigns').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
    setEmails(data || []);
    setLoading(false);
  }

  const allTags = useMemo(() => [...new Set(customers.flatMap((c) => c.tags || []))].sort(), [customers]);

  const approve = async (id) => {
    await supabase.from('email_campaigns').update({ status: 'approved' }).eq('id', id);
    setEmails((p) => p.map((e) => e.id === id ? { ...e, status: 'approved' } : e));
    toast('Email approved — queued for send');
    setSelected(null);
  };

  const reject = async (id) => {
    await supabase.from('email_campaigns').update({ status: 'rejected' }).eq('id', id);
    setEmails((p) => p.map((e) => e.id === id ? { ...e, status: 'rejected' } : e));
    toast('Email returned to Xperigift team', 'warning');
    setSelected(null);
  };

  const save = async (updated) => {
    const { error } = await supabase.from('email_campaigns').update(updated).eq('id', updated.id);
    if (error) { toast('Failed to save', 'error'); return; }
    setEmails((p) => p.map((e) => e.id === updated.id ? updated : e));
    toast('Changes saved');
  };

  const submitForReview = async (id) => {
    await supabase.from('email_campaigns').update({ status: 'pending_approval' }).eq('id', id);
    setEmails((p) => p.map((e) => e.id === id ? { ...e, status: 'pending_approval' } : e));
    toast('Campaign submitted for review');
    setSelected(null);
  };

  const handleCreate = async (fields) => {
    const { data, error } = await supabase
      .from('email_campaigns')
      .insert({ ...fields, client_id: clientId, status: 'draft' })
      .select()
      .single();
    if (error) { toast('Failed to create campaign', 'error'); return; }
    setEmails((p) => [data, ...p]);
    setShowNew(false);
    setSelected(data.id);
    toast('Campaign created');
  };

  if (showNew) {
    return (
      <NewCampaignForm
        allTags={allTags}
        customerCount={customers.length}
        onBack={() => setShowNew(false)}
        onCreate={handleCreate}
        toast={toast}
      />
    );
  }

  if (selected) {
    const email = emails.find((e) => e.id === selected);
    return (
      <EmailEditor
        email={email}
        allTags={allTags}
        customerCount={customers.length}
        onBack={() => setSelected(null)}
        onSave={save}
        onApprove={approve}
        onReject={reject}
        onSubmitForReview={submitForReview}
        toast={toast}
      />
    );
  }

  const pending = emails.filter((e) => e.status === 'pending_approval');
  const drafts = emails.filter((e) => e.status === 'draft');

  return (
    <Shell
      title="Emails"
      subtitle="Create and manage your email campaigns."
      actions={<Btn icon="plus" primary onClick={() => setShowNew(true)}>New campaign</Btn>}
    >
      {pending.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.14em', color: inkMuted, marginBottom: 12 }}>Awaiting your approval</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pending.map((e) => (
              <div key={e.id} style={{ border: '1px solid var(--amber-border)', borderRadius: 'var(--r)', background: 'var(--amber)', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <button onClick={() => setSelected(e.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
                    <p style={{ fontWeight: 500, color: ink, fontSize: 15, textDecoration: 'underline', textUnderlineOffset: 3, textDecorationColor: 'var(--hairline-strong)' }}>{e.subject}</p>
                  </button>
                  <p style={{ fontSize: 13, color: inkMuted, marginTop: 4 }}>
                    To: {e.segment_type === 'all' ? 'All contacts' : `Tagged: ${e.segment_tag}`} · Scheduled: {e.send_date ? fmtDate(e.send_date) : '—'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <Btn onClick={() => setSelected(e.id)} icon="eye">Review</Btn>
                  <Btn onClick={() => reject(e.id)}>Return</Btn>
                  <Btn primary onClick={() => approve(e.id)}>Approve</Btn>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {drafts.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.14em', color: inkMuted, marginBottom: 12 }}>Drafts</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {drafts.map((e) => (
              <div key={e.id} style={{ border: `1px solid ${hairline}`, borderRadius: 'var(--r)', background: paper, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <button onClick={() => setSelected(e.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 500, color: ink, fontSize: 14, textDecoration: 'underline', textUnderlineOffset: 3, textDecorationColor: 'var(--hairline-strong)' }}>{e.subject || '(No subject)'}</p>
                  <p style={{ fontSize: 12, color: inkMuted, marginTop: 3 }}>Draft · Created {fmtDate(e.created_at)}</p>
                </button>
                <Btn onClick={() => setSelected(e.id)} icon="edit">Edit</Btn>
              </div>
            ))}
          </div>
        </div>
      )}

      <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.14em', color: inkMuted, marginBottom: 12 }}>All campaigns</p>

      {loading ? (
        <p style={{ color: inkMuted, fontSize: 14 }}>Loading…</p>
      ) : (
        <TableWrap>
          <thead><THead cols={['Subject', 'Segment', 'Send date', 'Status']} /></thead>
          <tbody>
            {emails.map((e) => {
              const col = { draft: inkMuted, pending_approval: 'oklch(0.42 0.12 70)', approved: emeraldDeep, sent: inkMuted, rejected: 'oklch(0.45 0.18 27)' }[e.status] || inkMuted;
              return (
                <tr key={e.id} style={{ borderBottom: `1px solid ${hairline}` }}>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => setSelected(e.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 14, fontWeight: 500, color: ink, textAlign: 'left', textDecoration: 'underline', textUnderlineOffset: 3, textDecorationColor: 'var(--hairline-strong)' }}>
                      {e.subject || '(No subject)'}
                    </button>
                  </td>
                  <TD muted>{e.segment_type === 'all' ? 'All contacts' : `Tagged: ${e.segment_tag}`}</TD>
                  <TD muted>{e.send_date ? fmtDate(e.send_date) : '—'}</TD>
                  <TD><span style={{ fontSize: 12, fontWeight: 500, color: col, textTransform: 'capitalize' }}>{e.status?.replace(/_/g, ' ')}</span></TD>
                </tr>
              );
            })}
            {emails.length === 0 && (
              <tr><td colSpan={4} style={{ padding: '32px 16px', textAlign: 'center', color: inkMuted, fontSize: 14 }}>No campaigns yet.</td></tr>
            )}
          </tbody>
        </TableWrap>
      )}
    </Shell>
  );
}

/* ── NEW CAMPAIGN FORM ─────────────────────────────────────── */
function NewCampaignForm({ allTags, customerCount, onBack, onCreate, toast }) {
  const [fields, setFields] = useState({
    subject: '',
    sender_name: '',
    sender_email: '',
    send_date: '',
    segment_type: 'all',
    segment_tag: '',
    html_content: '',
  });
  const [saving, setSaving] = useState(false);

  const update = (patch) => setFields((p) => ({ ...p, ...patch }));

  const handleCreate = async () => {
    if (!fields.subject.trim()) { toast('Subject is required', 'error'); return; }
    setSaving(true);
    await onCreate(fields);
    setSaving(false);
  };

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{ borderBottom: `1px solid ${hairline}`, background: paper, padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: inkSoft, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
          <Icon name="arrow-left" size={15} /> Back
        </button>
        <div style={{ width: 1, height: 20, background: hairline, flexShrink: 0 }} />
        <input
          value={fields.subject}
          onChange={(e) => update({ subject: e.target.value })}
          placeholder="Email subject…"
          autoFocus
          style={{ flex: 1, fontSize: 15, fontWeight: 500, color: ink, border: 'none', outline: 'none', background: 'transparent', minWidth: 0 }}
        />
        <Btn primary onClick={handleCreate} disabled={saving}>
          {saving ? 'Creating…' : 'Create draft'}
        </Btn>
      </div>

      {/* Meta row */}
      <div style={{ borderBottom: `1px solid ${hairline}`, background: paperSoft, padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 24, flexShrink: 0, flexWrap: 'wrap' }}>
        <MetaField label="From name">
          <input value={fields.sender_name} onChange={(e) => update({ sender_name: e.target.value })} placeholder="Your Business"
            style={{ fontSize: 13, color: ink, border: 'none', borderBottom: `1px solid ${hairlineStrong}`, outline: 'none', background: 'transparent', padding: '1px 0', minWidth: 150 }} />
        </MetaField>
        <MetaField label="From email">
          <input type="email" value={fields.sender_email} onChange={(e) => update({ sender_email: e.target.value })} placeholder="hello@business.com"
            style={{ fontSize: 13, color: ink, border: 'none', borderBottom: `1px solid ${hairlineStrong}`, outline: 'none', background: 'transparent', padding: '1px 0', minWidth: 180 }} />
        </MetaField>
        <MetaField label="Send date">
          <input type="date" value={fields.send_date} onChange={(e) => update({ send_date: e.target.value })}
            style={{ fontSize: 13, color: ink, border: 'none', borderBottom: `1px solid ${hairlineStrong}`, outline: 'none', background: 'transparent', padding: '1px 0' }} />
        </MetaField>
        <MetaField label="Send to">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <select value={fields.segment_type} onChange={(e) => update({ segment_type: e.target.value, segment_tag: '' })}
              style={{ fontSize: 13, color: ink, border: 'none', borderBottom: `1px solid ${hairlineStrong}`, outline: 'none', background: 'transparent', cursor: 'pointer' }}>
              <option value="all">All contacts ({customerCount})</option>
              <option value="tag">By tag</option>
            </select>
            {fields.segment_type === 'tag' && (
              <select value={fields.segment_tag} onChange={(e) => update({ segment_tag: e.target.value })}
                style={{ fontSize: 13, color: ink, border: 'none', borderBottom: `1px solid ${hairlineStrong}`, outline: 'none', background: 'transparent', cursor: 'pointer' }}>
                <option value="">Pick a tag…</option>
                {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            )}
          </div>
        </MetaField>
      </div>

      {/* HTML editor */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <textarea
          value={fields.html_content}
          onChange={(e) => update({ html_content: e.target.value })}
          placeholder="Paste your email HTML here… (you can also leave this blank and add it later)"
          spellCheck={false}
          style={{ flex: 1, padding: 20, fontSize: 13, lineHeight: 1.7, color: ink, background: paper, border: 'none', outline: 'none', resize: 'none', fontFamily: 'ui-monospace, Consolas, monospace' }}
        />
      </div>
    </div>
  );
}

/* ── EMAIL EDITOR ──────────────────────────────────────────── */
function EmailEditor({ email, allTags, customerCount, onBack, onSave, onApprove, onReject, onSubmitForReview, toast }) {
  const [draft, setDraft] = useState({ ...email });
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testSending, setTestSending] = useState(false);

  const update = (patch) => setDraft((p) => ({ ...p, ...patch }));
  const canEdit = draft.status !== 'sent';

  const segmentLabel = draft.segment_type === 'all'
    ? `All contacts (${customerCount})`
    : `Tagged: ${draft.segment_tag || '—'}`;

  const handleSave = async () => {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
  };

  const handleSendTest = async () => {
    if (!testEmail.trim()) return;
    setTestSending(true);
    await handleSave();

    const from = (draft.sender_name && draft.sender_email)
      ? `${draft.sender_name} <${draft.sender_email}>`
      : 'Xperigift <onboarding@resend.dev>';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [testEmail.trim().toLowerCase()],
        subject: `[TEST] ${draft.subject || 'Email preview'}`,
        html: draft.html_content || '<p>No content yet.</p>',
      }),
    });

    setTestSending(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast(`Failed to send: ${err.message || 'Check your Resend API key'}`, 'error');
      return;
    }

    setTestOpen(false);
    const addr = testEmail.trim().toLowerCase();
    setTestEmail('');
    toast(`Test email sent to ${addr} ✓`);
  };

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{ borderBottom: `1px solid ${hairline}`, background: paper, padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: inkSoft, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
          <Icon name="arrow-left" size={15} /> Back
        </button>
        <div style={{ width: 1, height: 20, background: hairline, flexShrink: 0 }} />
        {canEdit ? (
          <input value={draft.subject} onChange={(e) => update({ subject: e.target.value })}
            style={{ flex: 1, fontSize: 15, fontWeight: 500, color: ink, border: 'none', outline: 'none', background: 'transparent', minWidth: 0 }}
            placeholder="Email subject…" />
        ) : (
          <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{draft.subject}</span>
        )}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center', position: 'relative' }}>
          {canEdit && <Btn onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Btn>}

          {/* Send test button + popover */}
          {canEdit && (
            <div style={{ position: 'relative' }}>
              <Btn icon="send" onClick={() => setTestOpen((v) => !v)}>Send test</Btn>
              {testOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: paper, border: `1px solid ${hairlineStrong}`, borderRadius: 'var(--r)', padding: 16, width: 280, boxShadow: '0 4px 20px oklch(0 0 0 / 0.12)', zIndex: 100 }}>
                  <p style={{ fontSize: 12, color: inkMuted, marginBottom: 8 }}>Send test to:</p>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendTest()}
                    placeholder="test@email.com"
                    autoFocus
                    style={{ width: '100%', height: 36, padding: '0 10px', border: `1px solid ${hairlineStrong}`, borderRadius: 'var(--r)', fontSize: 13, color: ink, background: paper, outline: 'none', boxSizing: 'border-box' }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <Btn onClick={() => { setTestOpen(false); setTestEmail(''); }} style={{ flex: 1 }}>Cancel</Btn>
                    <Btn primary onClick={handleSendTest} disabled={testSending || !testEmail.trim()} style={{ flex: 1 }}>
                      {testSending ? 'Sending…' : 'Send'}
                    </Btn>
                  </div>
                </div>
              )}
            </div>
          )}

          {draft.status === 'draft' && (
            <Btn primary onClick={async () => { await handleSave(); onSubmitForReview(draft.id); }}>
              Submit for review
            </Btn>
          )}
          {draft.status === 'pending_approval' && (
            <>
              <Btn onClick={() => onReject(draft.id)}>Return</Btn>
              <Btn primary onClick={async () => { await handleSave(); onApprove(draft.id); }}>Approve & send</Btn>
            </>
          )}
        </div>
      </div>

      {/* Meta row */}
      <div style={{ borderBottom: `1px solid ${hairline}`, background: paperSoft, padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 24, flexShrink: 0, flexWrap: 'wrap' }}>
        <MetaField label="From name">
          {canEdit
            ? <input value={draft.sender_name || ''} onChange={(e) => update({ sender_name: e.target.value })} style={{ fontSize: 13, color: ink, border: 'none', borderBottom: `1px solid ${hairlineStrong}`, outline: 'none', background: 'transparent', padding: '1px 0', minWidth: 150 }} />
            : <span style={{ fontSize: 13, color: ink }}>{draft.sender_name}</span>}
        </MetaField>
        <MetaField label="From email">
          {canEdit
            ? <input value={draft.sender_email || ''} onChange={(e) => update({ sender_email: e.target.value })} style={{ fontSize: 13, color: ink, border: 'none', borderBottom: `1px solid ${hairlineStrong}`, outline: 'none', background: 'transparent', padding: '1px 0', minWidth: 180 }} />
            : <span style={{ fontSize: 13, color: ink }}>{draft.sender_email}</span>}
        </MetaField>
        <MetaField label="Send date">
          {canEdit
            ? <input type="date" value={draft.send_date || ''} onChange={(e) => update({ send_date: e.target.value })} style={{ fontSize: 13, color: ink, border: 'none', borderBottom: `1px solid ${hairlineStrong}`, outline: 'none', background: 'transparent', padding: '1px 0' }} />
            : <span style={{ fontSize: 13, color: ink }}>{draft.send_date ? fmtDate(draft.send_date) : '—'}</span>}
        </MetaField>
        <MetaField label="Send to">
          {canEdit ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <select value={draft.segment_type} onChange={(e) => update({ segment_type: e.target.value, segment_tag: null })}
                style={{ fontSize: 13, color: ink, border: 'none', borderBottom: `1px solid ${hairlineStrong}`, outline: 'none', background: 'transparent', cursor: 'pointer' }}>
                <option value="all">All contacts</option>
                <option value="tag">By tag</option>
              </select>
              {draft.segment_type === 'tag' && (
                <select value={draft.segment_tag || ''} onChange={(e) => update({ segment_tag: e.target.value })}
                  style={{ fontSize: 13, color: ink, border: 'none', borderBottom: `1px solid ${hairlineStrong}`, outline: 'none', background: 'transparent', cursor: 'pointer' }}>
                  <option value="">Pick a tag…</option>
                  {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              )}
            </div>
          ) : <span style={{ fontSize: 13, color: ink }}>{segmentLabel}</span>}
        </MetaField>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 2, padding: '2px', border: `1px solid ${hairlineStrong}`, borderRadius: 'var(--r)', background: paper, flexShrink: 0 }}>
          {[{ id: false, icon: 'code', label: 'HTML' }, { id: true, icon: 'eye', label: 'Preview' }].map((m) => (
            <button key={m.label} onClick={() => setPreviewMode(m.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: '2px', fontSize: 12, border: 'none', cursor: 'pointer', background: previewMode === m.id ? ink : 'transparent', color: previewMode === m.id ? paper : inkSoft, fontWeight: previewMode === m.id ? 500 : 400 }}>
              <Icon name={m.icon} size={12} />{m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Editor / Preview */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {!previewMode && (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', borderRight: `1px solid ${hairline}` }}>
            <textarea
              value={draft.html_content || ''} onChange={(e) => update({ html_content: e.target.value })}
              readOnly={!canEdit} spellCheck={false}
              style={{ flex: 1, padding: 20, fontSize: 13, lineHeight: 1.7, color: ink, background: canEdit ? paper : paperSoft, border: 'none', outline: 'none', resize: 'none', fontFamily: 'ui-monospace, Consolas, monospace', overflowY: 'auto' }}
            />
          </div>
        )}
        <div style={{ flex: 1, overflow: 'auto', background: paperSoft, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 20px', borderBottom: `1px solid ${hairline}`, background: paper, fontSize: 12, color: inkMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="eye" size={12} /> Email preview
          </div>
          <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
            <div
              style={{ maxWidth: 620, margin: '0 auto', background: 'white', boxShadow: '0 2px 16px oklch(0 0 0 / 0.08)', borderRadius: 4, overflow: 'hidden' }}
              dangerouslySetInnerHTML={{ __html: draft.html_content || '<p style="padding:24px;color:#888">No content yet.</p>' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaField({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: inkMuted }}>{label}</p>
      {children}
    </div>
  );
}
