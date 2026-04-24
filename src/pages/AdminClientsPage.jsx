import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Shell from '../components/Shell';
import Btn from '../components/Btn';
import Icon from '../components/Icon';
import { TableWrap, THead, TD } from '../components/TableWrap';
import { supabase } from '../lib/supabase';
import { ink, inkSoft, inkMuted, hairline, hairlineStrong, paper, paperSoft, emeraldDeep, emeraldSoft } from '../lib/tokens';

const BLANK_CLIENT = { name: '', industry: '', calendly_link: '' };
const BLANK_USER = { email: '', password: '', client_role: 'owner' };

const anonClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

async function createAuthUser(email, password) {
  const { data, error } = await anonClient.auth.signUp({ email, password });
  return { data, error };
}

const inputStyle = {
  width: '100%', height: 36, border: `1px solid ${hairlineStrong}`, borderRadius: 'var(--r)',
  padding: '0 10px', fontSize: 13, color: ink, outline: 'none', background: paper,
};

/* ─────────────────────────────────────────────────── */
/* ProfileTab                                          */
/* ─────────────────────────────────────────────────── */
function ProfileTab({ clientId, toast }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [saving, setSaving] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [newDate, setNewDate] = useState({ label: '', date: '' });
  const [newCompetitor, setNewCompetitor] = useState('');

  useEffect(() => { loadProfile(); }, [clientId]);

  async function loadProfile() {
    setLoading(true);
    const { data } = await supabase.from('client_profiles').select('*').eq('client_id', clientId).maybeSingle();
    setProfile(data || { gift_cards: [], bundles: [], important_dates: [], competitors: [], target_audience: '', tone: '', notes: '' });
    setUrlInput(data?.website_url || '');
    setLoading(false);
  }

  async function scrapeProfile() {
    if (!urlInput.trim()) return;
    setScraping(true);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-profile', {
        body: { clientId, websiteUrl: urlInput.trim() },
      });
      if (error || data?.error) throw new Error(error?.message || data?.error);
      setProfile(data);
      toast('Profile analyzed and saved');
    } catch (e) {
      toast(e.message, 'error');
    }
    setScraping(false);
  }

  async function saveProfile() {
    setSaving(true);
    const payload = { ...profile, client_id: clientId, website_url: urlInput.trim(), updated_at: new Date().toISOString() };
    const { error } = await supabase.from('client_profiles').upsert(payload, { onConflict: 'client_id' });
    setSaving(false);
    if (error) { toast('Failed to save', 'error'); return; }
    toast('Profile saved');
  }

  const update = (patch) => setProfile((p) => ({ ...p, ...patch }));

  const addDate = () => {
    if (!newDate.label || !newDate.date) return;
    update({ important_dates: [...(profile.important_dates || []), { ...newDate }] });
    setNewDate({ label: '', date: '' });
  };

  const removeDate = (i) => update({ important_dates: profile.important_dates.filter((_, idx) => idx !== i) });

  const addCompetitor = () => {
    if (!newCompetitor.trim()) return;
    update({ competitors: [...(profile.competitors || []), newCompetitor.trim()] });
    setNewCompetitor('');
  };

  const removeCompetitor = (i) => update({ competitors: profile.competitors.filter((_, idx) => idx !== i) });

  if (loading) return <p style={{ fontSize: 14, color: inkMuted, padding: '20px 0' }}>Loading…</p>;

  const taStyle = { ...inputStyle, height: 'auto', padding: '8px 10px', resize: 'vertical', lineHeight: 1.5 };
  const labelStyle = { display: 'block', fontSize: 12, color: inkMuted, marginBottom: 4 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Website URL + scrape */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Website URL</label>
          <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://…" style={inputStyle} />
        </div>
        <Btn primary onClick={scrapeProfile} disabled={scraping || !urlInput.trim()}>
          {scraping ? 'Analyzing…' : profile?.scraped_at ? 'Re-analyze' : 'Scrape & Analyze'}
        </Btn>
      </div>
      {profile?.scraped_at && (
        <p style={{ fontSize: 11, color: inkMuted, marginTop: -12 }}>Last analyzed: {new Date(profile.scraped_at).toLocaleString()}</p>
      )}

      {/* Auto-detected fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Gift cards (one per line)</label>
          <textarea
            rows={4} style={taStyle}
            value={(profile.gift_cards || []).join('\n')}
            onChange={(e) => update({ gift_cards: e.target.value.split('\n').filter(Boolean) })}
          />
        </div>
        <div>
          <label style={labelStyle}>Bundles & packages (one per line)</label>
          <textarea
            rows={4} style={taStyle}
            value={(profile.bundles || []).join('\n')}
            onChange={(e) => update({ bundles: e.target.value.split('\n').filter(Boolean) })}
          />
        </div>
        <div>
          <label style={labelStyle}>Target audience</label>
          <textarea rows={2} style={taStyle} value={profile.target_audience || ''} onChange={(e) => update({ target_audience: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Tone of voice</label>
          <textarea rows={2} style={taStyle} value={profile.tone || ''} onChange={(e) => update({ tone: e.target.value })} />
        </div>
      </div>

      {/* Important dates */}
      <div>
        <label style={labelStyle}>Important dates</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
          {(profile.important_dates || []).map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <span style={{ flex: 1, color: ink }}>{d.label}</span>
              <span style={{ color: inkMuted }}>{d.date}</span>
              <button onClick={() => removeDate(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: inkMuted, fontSize: 16, lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="Label (e.g. Mother's Day)" value={newDate.label} onChange={(e) => setNewDate((p) => ({ ...p, label: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
          <input type="date" value={newDate.date} onChange={(e) => setNewDate((p) => ({ ...p, date: e.target.value }))} style={{ ...inputStyle, width: 150 }} />
          <Btn onClick={addDate} disabled={!newDate.label || !newDate.date}>Add</Btn>
        </div>
      </div>

      {/* Competitors */}
      <div>
        <label style={labelStyle}>Competitors</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {(profile.competitors || []).map((c, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, background: paperSoft, border: `1px solid ${hairline}`, borderRadius: 4, padding: '3px 8px', color: ink }}>
              {c}
              <button onClick={() => removeCompetitor(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: inkMuted, fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="Name or URL" value={newCompetitor} onChange={(e) => setNewCompetitor(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCompetitor()} style={{ ...inputStyle, flex: 1 }} />
          <Btn onClick={addCompetitor} disabled={!newCompetitor.trim()}>Add</Btn>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label style={labelStyle}>Notes (anything Claude should know)</label>
        <textarea rows={3} style={taStyle} value={profile.notes || ''} onChange={(e) => update({ notes: e.target.value })} placeholder="e.g. They focus on corporate gifting, avoid holiday clichés…" />
      </div>

      <div>
        <Btn primary onClick={saveProfile} disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</Btn>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────── */
/* GenerateTab                                         */
/* ─────────────────────────────────────────────────── */
function GenerateTab({ clientId, clientName, toast }) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [emailCount, setEmailCount] = useState(3);
  const [goal, setGoal] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  async function generate() {
    if (!dateFrom || !dateTo) { toast('Set a date range first', 'warning'); return; }
    setGenerating(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('generate-emails', {
        body: { clientId, dateFrom, dateTo, emailCount: Number(emailCount), goal },
      });
      if (error || data?.error) throw new Error(error?.message || data?.error);
      setResult(data.count);
      toast(`${data.count} email${data.count !== 1 ? 's' : ''} generated — check the Emails section`);
    } catch (e) {
      toast(e.message, 'error');
    }
    setGenerating(false);
  }

  const labelStyle = { display: 'block', fontSize: 12, color: inkMuted, marginBottom: 4 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560 }}>
      <p style={{ fontSize: 13, color: inkMuted }}>
        Generate email campaigns for <strong style={{ color: ink }}>{clientName}</strong> using their profile and Claude AI. Generated emails go to <strong style={{ color: ink }}>Emails → Awaiting approval</strong>.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>From date</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>To date</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={inputStyle} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Number of emails</label>
        <select value={emailCount} onChange={(e) => setEmailCount(e.target.value)} style={{ ...inputStyle, width: 120, cursor: 'pointer' }}>
          {[1,2,3,4,5,6,8,10].map((n) => <option key={n} value={n}>{n} email{n !== 1 ? 's' : ''}</option>)}
        </select>
      </div>

      <div>
        <label style={labelStyle}>Campaign goal / theme (optional)</label>
        <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Mother's Day promotion, end-of-year bundle push…" style={inputStyle} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Btn primary onClick={generate} disabled={generating || !dateFrom || !dateTo}>
          {generating ? 'Generating…' : 'Generate emails'}
        </Btn>
        {result !== null && (
          <p style={{ fontSize: 13, color: emeraldDeep, fontWeight: 500 }}>
            ✓ {result} email{result !== 1 ? 's' : ''} added to the queue
          </p>
        )}
      </div>

      <p style={{ fontSize: 11, color: inkMuted }}>
        Requires Anthropic API key to be set in Supabase secrets and edge functions deployed.
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────── */
/* Main page                                           */
/* ─────────────────────────────────────────────────── */
export default function AdminClientsPage({ toast = () => {} }) {
  const [clients, setClients] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [activeTab, setActiveTab] = useState({});

  const [showNewClient, setShowNewClient] = useState(false);
  const [clientDraft, setClientDraft] = useState(BLANK_CLIENT);
  const [savingClient, setSavingClient] = useState(false);

  const [editingClient, setEditingClient] = useState(null);
  const [editDraft, setEditDraft] = useState(BLANK_CLIENT);
  const [savingEdit, setSavingEdit] = useState(false);

  const [addingUserFor, setAddingUserFor] = useState(null);
  const [userDraft, setUserDraft] = useState(BLANK_USER);
  const [savingUser, setSavingUser] = useState(false);
  const [userError, setUserError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [{ data: c }, { data: p }] = await Promise.all([
      supabase.from('clients').select('*').order('name'),
      supabase.from('profiles').select('*').order('email'),
    ]);
    setClients(c || []);
    setProfiles(p || []);
    setLoading(false);
  }

  async function saveNewClient() {
    if (!clientDraft.name.trim()) return;
    setSavingClient(true);
    const payload = {
      name: clientDraft.name.trim(),
      industry: clientDraft.industry.trim() || null,
      calendly_link: clientDraft.calendly_link.trim() || null,
    };
    const { data, error } = await supabase.from('clients').insert(payload).select().single();
    setSavingClient(false);
    if (error) return;
    setClients((p) => [...p, data].sort((a, b) => a.name.localeCompare(b.name)));
    setShowNewClient(false);
    setClientDraft(BLANK_CLIENT);
    setExpanded(data.id);
    setActiveTab((t) => ({ ...t, [data.id]: 'users' }));
  }

  async function saveEdit() {
    if (!editDraft.name.trim()) return;
    setSavingEdit(true);
    const payload = {
      name: editDraft.name.trim(),
      industry: editDraft.industry.trim() || null,
      calendly_link: editDraft.calendly_link.trim() || null,
    };
    const { error } = await supabase.from('clients').update(payload).eq('id', editingClient);
    setSavingEdit(false);
    if (error) return;
    setClients((p) => p.map((c) => c.id === editingClient ? { ...c, ...payload } : c));
    setEditingClient(null);
  }

  async function toggleActive(c) {
    await supabase.from('clients').update({ is_active: !c.is_active }).eq('id', c.id);
    setClients((p) => p.map((x) => x.id === c.id ? { ...x, is_active: !c.is_active } : x));
  }

  async function saveNewUser(clientId) {
    if (!userDraft.email.trim() || userDraft.password.length < 6) {
      setUserError('Email and password (min 6 chars) required.');
      return;
    }
    setSavingUser(true);
    setUserError('');
    const { data: authData, error: authError } = await createAuthUser(userDraft.email.trim(), userDraft.password);
    if (authError) { setSavingUser(false); setUserError(authError.message); return; }
    const userId = authData?.user?.id;
    if (!userId) { setSavingUser(false); setUserError('User created but ID not returned.'); return; }
    const { error: profileError } = await supabase.from('profiles')
      .upsert({ id: userId, email: userDraft.email.trim(), client_id: clientId, client_role: userDraft.client_role, role: 'client' });
    setSavingUser(false);
    if (profileError) { setUserError(profileError.message); return; }
    setProfiles((p) => {
      const existing = p.find((x) => x.id === userId);
      if (existing) return p.map((x) => x.id === userId ? { ...x, client_id: clientId, client_role: userDraft.client_role } : x);
      return [...p, { id: userId, email: userDraft.email.trim(), client_id: clientId, client_role: userDraft.client_role, role: 'client' }];
    });
    setAddingUserFor(null);
    setUserDraft(BLANK_USER);
  }

  async function toggleUserRole(profile) {
    const next = profile.client_role === 'owner' ? 'staff' : 'owner';
    await supabase.from('profiles').update({ client_role: next }).eq('id', profile.id);
    setProfiles((p) => p.map((x) => x.id === profile.id ? { ...x, client_role: next } : x));
  }

  async function removeUser(profile) {
    if (!confirm(`Remove ${profile.email} from this client?`)) return;
    await supabase.from('profiles').update({ client_id: null }).eq('id', profile.id);
    setProfiles((p) => p.map((x) => x.id === profile.id ? { ...x, client_id: null } : x));
  }

  const getTab = (id) => activeTab[id] || 'users';
  const setTab = (id, tab) => setActiveTab((t) => ({ ...t, [id]: tab }));

  const tabBtn = (id, tab, label) => (
    <button
      onClick={() => setTab(id, tab)}
      style={{
        padding: '8px 16px', fontSize: 13, border: 'none', cursor: 'pointer', background: 'none',
        color: getTab(id) === tab ? ink : inkMuted,
        fontWeight: getTab(id) === tab ? 600 : 400,
        borderBottom: getTab(id) === tab ? `2px solid ${ink}` : '2px solid transparent',
      }}
    >
      {label}
    </button>
  );

  return (
    <Shell
      title="Clients"
      subtitle="Manage businesses and their user accounts."
      actions={<Btn icon="plus" primary onClick={() => { setShowNewClient(true); setEditingClient(null); }}>New client</Btn>}
    >
      {showNewClient && (
        <div style={{ marginBottom: 24, border: `1px solid ${hairlineStrong}`, borderRadius: 'var(--r)', background: paperSoft, padding: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: ink, marginBottom: 16 }}>New client</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: inkMuted, marginBottom: 4 }}>Name *</label>
              <input value={clientDraft.name} onChange={(e) => setClientDraft((p) => ({ ...p, name: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: inkMuted, marginBottom: 4 }}>Industry</label>
              <input value={clientDraft.industry} onChange={(e) => setClientDraft((p) => ({ ...p, industry: e.target.value }))} placeholder="e.g. Spa, Restaurant" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: inkMuted, marginBottom: 4 }}>Calendly / booking link</label>
              <input value={clientDraft.calendly_link} onChange={(e) => setClientDraft((p) => ({ ...p, calendly_link: e.target.value }))} placeholder="https://calendly.com/…" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn onClick={() => { setShowNewClient(false); setClientDraft(BLANK_CLIENT); }}>Cancel</Btn>
            <Btn primary onClick={saveNewClient} disabled={savingClient || !clientDraft.name.trim()}>
              {savingClient ? 'Saving…' : 'Create client'}
            </Btn>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: inkMuted, fontSize: 14 }}>Loading…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {clients.map((c) => {
            const clientUsers = profiles.filter((p) => p.client_id === c.id);
            const isExpanded = expanded === c.id;
            const isEditing = editingClient === c.id;
            const tab = getTab(c.id);

            return (
              <div key={c.id} style={{ border: `1px solid ${hairline}`, borderRadius: 'var(--r)', background: paper, overflow: 'hidden' }}>
                {/* Client row */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', gap: 16 }}>
                  <button
                    onClick={() => { setExpanded(isExpanded ? null : c.id); if (!isExpanded && !activeTab[c.id]) setTab(c.id, 'users'); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: inkSoft, padding: 0, display: 'flex', alignItems: 'center' }}
                  >
                    <Icon name={isExpanded ? 'chevron-down' : 'chevron-right'} size={16} />
                  </button>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 500, color: ink }}>{c.name}</p>
                    <p style={{ fontSize: 12, color: inkMuted }}>
                      {c.industry || '—'} · {clientUsers.length} user{clientUsers.length !== 1 ? 's' : ''}
                      {c.calendly_link && (
                        <> · <a href={c.calendly_link} target="_blank" rel="noopener noreferrer" style={{ color: emeraldDeep, textDecoration: 'none' }}>Calendly</a></>
                      )}
                    </p>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: c.is_active ? emeraldDeep : inkMuted }}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <Btn onClick={() => { setEditingClient(isEditing ? null : c.id); setEditDraft({ name: c.name, industry: c.industry || '', calendly_link: c.calendly_link || '' }); }}>Edit</Btn>
                  <Btn onClick={() => toggleActive(c)}>{c.is_active ? 'Deactivate' : 'Activate'}</Btn>
                </div>

                {/* Edit inline */}
                {isEditing && (
                  <div style={{ borderTop: `1px solid ${hairline}`, padding: '16px 20px', background: paperSoft }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: inkMuted, marginBottom: 4 }}>Name *</label>
                        <input value={editDraft.name} onChange={(e) => setEditDraft((p) => ({ ...p, name: e.target.value }))} style={inputStyle} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: inkMuted, marginBottom: 4 }}>Industry</label>
                        <input value={editDraft.industry} onChange={(e) => setEditDraft((p) => ({ ...p, industry: e.target.value }))} style={inputStyle} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: inkMuted, marginBottom: 4 }}>Calendly / booking link</label>
                        <input value={editDraft.calendly_link} onChange={(e) => setEditDraft((p) => ({ ...p, calendly_link: e.target.value }))} placeholder="https://calendly.com/…" style={inputStyle} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Btn onClick={() => setEditingClient(null)}>Cancel</Btn>
                      <Btn primary onClick={saveEdit} disabled={savingEdit || !editDraft.name.trim()}>
                        {savingEdit ? 'Saving…' : 'Save changes'}
                      </Btn>
                    </div>
                  </div>
                )}

                {/* Expanded: tabs */}
                {isExpanded && (
                  <div style={{ borderTop: `1px solid ${hairline}` }}>
                    {/* Tab bar */}
                    <div style={{ display: 'flex', borderBottom: `1px solid ${hairline}`, paddingLeft: 8, background: paperSoft }}>
                      {tabBtn(c.id, 'users', 'Users')}
                      {tabBtn(c.id, 'profile', 'Profile')}
                      {tabBtn(c.id, 'generate', 'Generate emails')}
                    </div>

                    <div style={{ padding: '20px 24px' }}>
                      {/* ── Users tab ── */}
                      {tab === 'users' && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: inkMuted, fontWeight: 500 }}>Users</p>
                            <Btn icon="plus" onClick={() => { setAddingUserFor(addingUserFor === c.id ? null : c.id); setUserDraft(BLANK_USER); setUserError(''); }}>
                              Add user
                            </Btn>
                          </div>
                          {addingUserFor === c.id && (
                            <div style={{ marginBottom: 16, border: `1px solid ${hairlineStrong}`, borderRadius: 'var(--r)', background: paperSoft, padding: 16 }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, marginBottom: 10, alignItems: 'end' }}>
                                <div>
                                  <label style={{ display: 'block', fontSize: 12, color: inkMuted, marginBottom: 4 }}>Email *</label>
                                  <input type="email" value={userDraft.email} onChange={(e) => setUserDraft((p) => ({ ...p, email: e.target.value }))} style={inputStyle} />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: 12, color: inkMuted, marginBottom: 4 }}>Password * (min 6 chars)</label>
                                  <input type="password" value={userDraft.password} onChange={(e) => setUserDraft((p) => ({ ...p, password: e.target.value }))} style={inputStyle} />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: 12, color: inkMuted, marginBottom: 4 }}>Access level</label>
                                  <select value={userDraft.client_role} onChange={(e) => setUserDraft((p) => ({ ...p, client_role: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                                    <option value="owner">Owner — full access</option>
                                    <option value="staff">Staff — redeem only</option>
                                  </select>
                                </div>
                              </div>
                              {userError && <p style={{ fontSize: 12, color: 'oklch(0.5 0.18 25)', marginBottom: 8 }}>{userError}</p>}
                              <div style={{ display: 'flex', gap: 8 }}>
                                <Btn onClick={() => { setAddingUserFor(null); setUserError(''); }}>Cancel</Btn>
                                <Btn primary onClick={() => saveNewUser(c.id)} disabled={savingUser}>
                                  {savingUser ? 'Creating…' : 'Create user'}
                                </Btn>
                              </div>
                            </div>
                          )}
                          {clientUsers.length > 0 ? (
                            <TableWrap>
                              <thead><THead cols={['Email', 'Access', 'Action']} /></thead>
                              <tbody>
                                {clientUsers.map((u) => (
                                  <tr key={u.id} style={{ borderBottom: `1px solid ${hairline}` }}>
                                    <TD bold>{u.email}</TD>
                                    <TD>
                                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: u.client_role === 'owner' ? emeraldSoft : paperSoft, color: u.client_role === 'owner' ? emeraldDeep : inkSoft }}>
                                        {u.client_role === 'owner' ? 'Owner' : 'Staff'}
                                      </span>
                                    </TD>
                                    <TD right>
                                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                        <Btn onClick={() => toggleUserRole(u)}>{u.client_role === 'owner' ? 'Make staff' : 'Make owner'}</Btn>
                                        <button onClick={() => removeUser(u)} style={{ fontSize: 12, color: 'oklch(0.5 0.18 25)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}>Remove</button>
                                      </div>
                                    </TD>
                                  </tr>
                                ))}
                              </tbody>
                            </TableWrap>
                          ) : (
                            <p style={{ fontSize: 13, color: inkMuted, fontStyle: 'italic' }}>No users yet — add one above.</p>
                          )}
                        </div>
                      )}

                      {/* ── Profile tab ── */}
                      {tab === 'profile' && <ProfileTab clientId={c.id} toast={toast} />}

                      {/* ── Generate tab ── */}
                      {tab === 'generate' && <GenerateTab clientId={c.id} clientName={c.name} toast={toast} />}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {clients.length === 0 && (
            <p style={{ fontSize: 14, color: inkMuted, textAlign: 'center', padding: 40 }}>No clients yet.</p>
          )}
        </div>
      )}
    </Shell>
  );
}
