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

// Isolated client so signUp never affects the admin's active session
const anonClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

async function createAuthUser(email, password) {
  const { data, error } = await anonClient.auth.signUp({ email, password });
  return { data, error };
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  // New client form
  const [showNewClient, setShowNewClient] = useState(false);
  const [clientDraft, setClientDraft] = useState(BLANK_CLIENT);
  const [savingClient, setSavingClient] = useState(false);

  // Edit client form
  const [editingClient, setEditingClient] = useState(null);
  const [editDraft, setEditDraft] = useState(BLANK_CLIENT);
  const [savingEdit, setSavingEdit] = useState(false);

  // New user form (per client)
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

  // ── Create client ────────────────────────────────────────────
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
    setClients(p => [...p, data].sort((a, b) => a.name.localeCompare(b.name)));
    setShowNewClient(false);
    setClientDraft(BLANK_CLIENT);
    setExpanded(data.id);
  }

  // ── Update client ────────────────────────────────────────────
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
    setClients(p => p.map(c => c.id === editingClient ? { ...c, ...payload } : c));
    setEditingClient(null);
  }

  // ── Toggle active ────────────────────────────────────────────
  async function toggleActive(c) {
    await supabase.from('clients').update({ is_active: !c.is_active }).eq('id', c.id);
    setClients(p => p.map(x => x.id === c.id ? { ...x, is_active: !c.is_active } : x));
  }

  // ── Create user for client ───────────────────────────────────
  async function saveNewUser(clientId) {
    if (!userDraft.email.trim() || userDraft.password.length < 6) {
      setUserError('Email and password (min 6 chars) required.');
      return;
    }
    setSavingUser(true);
    setUserError('');

    const { data: authData, error: authError } = await createAuthUser(userDraft.email.trim(), userDraft.password);
    if (authError) {
      setSavingUser(false);
      setUserError(authError.message);
      return;
    }

    const userId = authData?.user?.id;
    if (!userId) {
      setSavingUser(false);
      setUserError('User created but ID not returned — check Supabase dashboard.');
      return;
    }

    // Upsert profile with client_id and client_role
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: userId, email: userDraft.email.trim(), client_id: clientId, client_role: userDraft.client_role, role: 'client' });

    setSavingUser(false);
    if (profileError) {
      setUserError(profileError.message);
      return;
    }

    setProfiles(p => {
      const existing = p.find(x => x.id === userId);
      if (existing) return p.map(x => x.id === userId ? { ...x, client_id: clientId, client_role: userDraft.client_role } : x);
      return [...p, { id: userId, email: userDraft.email.trim(), client_id: clientId, client_role: userDraft.client_role, role: 'client' }];
    });
    setAddingUserFor(null);
    setUserDraft(BLANK_USER);
  }

  // ── Toggle user role ─────────────────────────────────────────
  async function toggleUserRole(profile) {
    const next = profile.client_role === 'owner' ? 'staff' : 'owner';
    await supabase.from('profiles').update({ client_role: next }).eq('id', profile.id);
    setProfiles(p => p.map(x => x.id === profile.id ? { ...x, client_role: next } : x));
  }

  // ── Remove user from client ──────────────────────────────────
  async function removeUser(profile) {
    if (!confirm(`Remove ${profile.email} from this client?`)) return;
    await supabase.from('profiles').update({ client_id: null }).eq('id', profile.id);
    setProfiles(p => p.map(x => x.id === profile.id ? { ...x, client_id: null } : x));
  }

  const inputStyle = {
    width: '100%', height: 36, border: `1px solid ${hairlineStrong}`, borderRadius: 'var(--r)',
    padding: '0 10px', fontSize: 13, color: ink, outline: 'none', background: paper,
  };

  return (
    <Shell
      title="Clients"
      subtitle="Manage businesses and their user accounts."
      actions={<Btn icon="plus" primary onClick={() => { setShowNewClient(true); setEditingClient(null); }}>New client</Btn>}
    >
      {/* ── New client form ──────────────────────────────────── */}
      {showNewClient && (
        <div style={{ marginBottom: 24, border: `1px solid ${hairlineStrong}`, borderRadius: 'var(--r)', background: paperSoft, padding: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: ink, marginBottom: 16 }}>New client</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: inkMuted, marginBottom: 4 }}>Name *</label>
              <input value={clientDraft.name} onChange={e => setClientDraft(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: inkMuted, marginBottom: 4 }}>Industry</label>
              <input value={clientDraft.industry} onChange={e => setClientDraft(p => ({ ...p, industry: e.target.value }))} placeholder="e.g. Spa, Restaurant" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: inkMuted, marginBottom: 4 }}>Calendly / booking link</label>
              <input value={clientDraft.calendly_link} onChange={e => setClientDraft(p => ({ ...p, calendly_link: e.target.value }))} placeholder="https://calendly.com/…" style={inputStyle} />
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
            const clientUsers = profiles.filter(p => p.client_id === c.id);
            const isExpanded = expanded === c.id;
            const isEditing = editingClient === c.id;

            return (
              <div key={c.id} style={{ border: `1px solid ${hairline}`, borderRadius: 'var(--r)', background: paper, overflow: 'hidden' }}>
                {/* Client row */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', gap: 16 }}>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : c.id)}
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
                  <Btn onClick={() => { setEditingClient(isEditing ? null : c.id); setEditDraft({ name: c.name, industry: c.industry || '', calendly_link: c.calendly_link || '' }); }}>
                    Edit
                  </Btn>
                  <Btn onClick={() => toggleActive(c)}>{c.is_active ? 'Deactivate' : 'Activate'}</Btn>
                </div>

                {/* Edit client inline */}
                {isEditing && (
                  <div style={{ borderTop: `1px solid ${hairline}`, padding: '16px 20px', background: paperSoft }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: inkMuted, marginBottom: 4 }}>Name *</label>
                        <input value={editDraft.name} onChange={e => setEditDraft(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: inkMuted, marginBottom: 4 }}>Industry</label>
                        <input value={editDraft.industry} onChange={e => setEditDraft(p => ({ ...p, industry: e.target.value }))} style={inputStyle} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: inkMuted, marginBottom: 4 }}>Calendly / booking link</label>
                        <input value={editDraft.calendly_link} onChange={e => setEditDraft(p => ({ ...p, calendly_link: e.target.value }))} placeholder="https://calendly.com/…" style={inputStyle} />
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

                {/* Expanded: users */}
                {isExpanded && (
                  <div style={{ borderTop: `1px solid ${hairline}`, padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: inkMuted, fontWeight: 500 }}>Users</p>
                      <Btn icon="plus" onClick={() => { setAddingUserFor(addingUserFor === c.id ? null : c.id); setUserDraft(BLANK_USER); setUserError(''); }}>
                        Add user
                      </Btn>
                    </div>

                    {/* Add user form */}
                    {addingUserFor === c.id && (
                      <div style={{ marginBottom: 16, border: `1px solid ${hairlineStrong}`, borderRadius: 'var(--r)', background: paperSoft, padding: 16 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, marginBottom: 10, alignItems: 'end' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, color: inkMuted, marginBottom: 4 }}>Email *</label>
                            <input type="email" value={userDraft.email} onChange={e => setUserDraft(p => ({ ...p, email: e.target.value }))} style={inputStyle} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, color: inkMuted, marginBottom: 4 }}>Password * (min 6 chars)</label>
                            <input type="password" value={userDraft.password} onChange={e => setUserDraft(p => ({ ...p, password: e.target.value }))} style={inputStyle} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, color: inkMuted, marginBottom: 4 }}>Access level</label>
                            <select value={userDraft.client_role} onChange={e => setUserDraft(p => ({ ...p, client_role: e.target.value }))}
                              style={{ ...inputStyle, cursor: 'pointer' }}>
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
                        <p style={{ marginTop: 10, fontSize: 11, color: inkMuted }}>
                          The user will receive a confirmation email. They can change their password after first login.
                        </p>
                      </div>
                    )}

                    {/* Users table */}
                    {clientUsers.length > 0 ? (
                      <TableWrap>
                        <thead>
                          <THead cols={['Email', 'Access', 'Action']} />
                        </thead>
                        <tbody>
                          {clientUsers.map(u => (
                            <tr key={u.id} style={{ borderBottom: `1px solid ${hairline}` }}>
                              <TD bold>{u.email}</TD>
                              <TD>
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 5,
                                  fontSize: 12, fontWeight: 500, padding: '2px 8px', borderRadius: 4,
                                  background: u.client_role === 'owner' ? emeraldSoft : paperSoft,
                                  color: u.client_role === 'owner' ? emeraldDeep : inkSoft,
                                }}>
                                  {u.client_role === 'owner' ? 'Owner' : 'Staff'}
                                </span>
                              </TD>
                              <TD right>
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                  <Btn onClick={() => toggleUserRole(u)}>
                                    {u.client_role === 'owner' ? 'Make staff' : 'Make owner'}
                                  </Btn>
                                  <button
                                    onClick={() => removeUser(u)}
                                    style={{ fontSize: 12, color: 'oklch(0.5 0.18 25)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}
                                  >
                                    Remove
                                  </button>
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
