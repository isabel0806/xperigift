import { useState, useEffect } from 'react';
import Shell from '../components/Shell';
import Btn from '../components/Btn';
import Icon from '../components/Icon';
import { TableWrap, THead, TD } from '../components/TableWrap';
import { supabase } from '../lib/supabase';
import { fmtDate, ink, inkSoft, inkMuted, hairline, hairlineStrong, paper, paperSoft, emerald, emeraldDeep, emeraldSoft } from '../lib/tokens';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function isoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [today] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [editingLink, setEditingLink] = useState(null);
  const [linkInput, setLinkInput] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [newBooking, setNewBooking] = useState({ contact_name: '', business_name: '', booked_date: '', meeting_link: '', status: 'pending' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('audit_bookings').select('*').order('booked_date');
    setBookings(data || []);
    setLoading(false);
  }

  // ── Calendar helpers ─────────────────────────────────────────
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = isoDate(today);

  const byDate = bookings.reduce((acc, b) => {
    if (!b.booked_date) return acc;
    const key = b.booked_date.slice(0, 10);
    if (!acc[key]) acc[key] = [];
    acc[key].push(b);
    return acc;
  }, {});

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  // ── Selected day bookings ────────────────────────────────────
  const selectedBookings = selectedDay ? (byDate[selectedDay] || []) : [];

  // ── Save meeting link ────────────────────────────────────────
  async function saveLink(id) {
    await supabase.from('audit_bookings').update({ meeting_link: linkInput }).eq('id', id);
    setBookings(p => p.map(b => b.id === id ? { ...b, meeting_link: linkInput } : b));
    setEditingLink(null);
  }

  // ── Update status ────────────────────────────────────────────
  async function toggleStatus(b) {
    const next = b.status === 'confirmed' ? 'pending' : 'confirmed';
    await supabase.from('audit_bookings').update({ status: next }).eq('id', b.id);
    setBookings(p => p.map(x => x.id === b.id ? { ...x, status: next } : x));
  }

  // ── Add new booking ──────────────────────────────────────────
  async function addBooking() {
    if (!newBooking.contact_name || !newBooking.booked_date) return;
    setSaving(true);
    const { data, error } = await supabase.from('audit_bookings').insert([newBooking]).select().single();
    setSaving(false);
    if (error) return;
    setBookings(p => [...p, data].sort((a, b) => (a.booked_date || '') > (b.booked_date || '') ? 1 : -1));
    setShowNewForm(false);
    setNewBooking({ contact_name: '', business_name: '', booked_date: '', meeting_link: '', status: 'pending' });
  }

  // ── Calendar grid cells ──────────────────────────────────────
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <Shell
      title="Audit bookings"
      subtitle="Manage prospect meetings and onboarding requests."
      actions={<Btn icon="plus" primary onClick={() => setShowNewForm(true)}>New booking</Btn>}
    >
      {/* ── New booking form ────────────────────────────────── */}
      {showNewForm && (
        <div style={{ marginBottom: 24, border: `1px solid ${hairlineStrong}`, borderRadius: 'var(--r)', background: paper, padding: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: ink, marginBottom: 16 }}>New booking</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 10, alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: inkMuted, marginBottom: 4 }}>Contact name *</label>
              <input value={newBooking.contact_name} onChange={e => setNewBooking(p => ({ ...p, contact_name: e.target.value }))}
                style={{ width: '100%', height: 36, border: `1px solid ${hairlineStrong}`, borderRadius: 'var(--r)', padding: '0 10px', fontSize: 13, color: ink, outline: 'none', background: paper }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: inkMuted, marginBottom: 4 }}>Business</label>
              <input value={newBooking.business_name} onChange={e => setNewBooking(p => ({ ...p, business_name: e.target.value }))}
                style={{ width: '100%', height: 36, border: `1px solid ${hairlineStrong}`, borderRadius: 'var(--r)', padding: '0 10px', fontSize: 13, color: ink, outline: 'none', background: paper }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: inkMuted, marginBottom: 4 }}>Date *</label>
              <input type="date" value={newBooking.booked_date} onChange={e => setNewBooking(p => ({ ...p, booked_date: e.target.value }))}
                style={{ width: '100%', height: 36, border: `1px solid ${hairlineStrong}`, borderRadius: 'var(--r)', padding: '0 10px', fontSize: 13, color: ink, outline: 'none', background: paper }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: inkMuted, marginBottom: 4 }}>Meeting link</label>
              <input value={newBooking.meeting_link} onChange={e => setNewBooking(p => ({ ...p, meeting_link: e.target.value }))}
                placeholder="https://meet.google.com/…"
                style={{ width: '100%', height: 36, border: `1px solid ${hairlineStrong}`, borderRadius: 'var(--r)', padding: '0 10px', fontSize: 13, color: ink, outline: 'none', background: paper }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn onClick={() => setShowNewForm(false)}>Cancel</Btn>
              <Btn primary onClick={addBooking} disabled={saving || !newBooking.contact_name || !newBooking.booked_date}>
                {saving ? 'Saving…' : 'Add'}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── Calendar ────────────────────────────────────────── */}
      <div style={{ border: `1px solid ${hairline}`, borderRadius: 'var(--r)', background: paper, overflow: 'hidden', marginBottom: 24 }}>
        {/* Calendar header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${hairline}` }}>
          <button onClick={prevMonth} style={{ width: 32, height: 32, borderRadius: 'var(--r)', border: `1px solid ${hairlineStrong}`, background: paper, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: inkSoft }}>
            <Icon name="arrow-left" size={14} />
          </button>
          <h2 style={{ fontSize: 16, fontWeight: 500, color: ink }}>
            {MONTHS[month]} {year}
          </h2>
          <button onClick={nextMonth} style={{ width: 32, height: 32, borderRadius: 'var(--r)', border: `1px solid ${hairlineStrong}`, background: paper, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: inkSoft }}>
            <Icon name="arrow-right" size={14} />
          </button>
        </div>

        {/* Day-of-week headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid ${hairline}` }}>
          {DAYS.map(d => (
            <div key={d} style={{ padding: '8px 0', textAlign: 'center', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: inkMuted, fontWeight: 500 }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} style={{ minHeight: 80, borderRight: i % 7 !== 6 ? `1px solid ${hairline}` : 'none', borderBottom: `1px solid ${hairline}`, background: paperSoft }} />;

            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const dayBookings = byDate[dateStr] || [];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDay;

            return (
              <div
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                style={{
                  minHeight: 80,
                  borderRight: i % 7 !== 6 ? `1px solid ${hairline}` : 'none',
                  borderBottom: `1px solid ${hairline}`,
                  padding: '8px 10px',
                  cursor: dayBookings.length > 0 || true ? 'pointer' : 'default',
                  background: isSelected ? emeraldSoft : 'transparent',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = paperSoft; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: isToday ? ink : 'transparent',
                  color: isToday ? paper : ink,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: isToday ? 600 : 400, marginBottom: 4,
                }}>
                  {day}
                </div>
                {dayBookings.slice(0, 2).map(b => (
                  <div key={b.id} style={{
                    fontSize: 11, lineHeight: 1.3, padding: '2px 5px', borderRadius: 3,
                    background: b.status === 'confirmed' ? emerald : 'oklch(0.78 0.13 75)',
                    color: 'white', marginBottom: 2,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {b.contact_name}
                  </div>
                ))}
                {dayBookings.length > 2 && (
                  <div style={{ fontSize: 10, color: inkMuted }}>+{dayBookings.length - 2} more</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ padding: '10px 20px', borderTop: `1px solid ${hairline}`, display: 'flex', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: inkMuted }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: emerald }} />
            Confirmed
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: inkMuted }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: 'oklch(0.78 0.13 75)' }} />
            Pending
          </div>
        </div>
      </div>

      {/* ── Selected day panel ───────────────────────────────── */}
      {selectedDay && (
        <div style={{ marginBottom: 24, border: `1px solid ${hairlineStrong}`, borderRadius: 'var(--r)', background: emeraldSoft, padding: '16px 20px' }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: emeraldDeep, marginBottom: 12 }}>
            {fmtDate(selectedDay + 'T12:00:00Z')} — {selectedBookings.length > 0 ? `${selectedBookings.length} meeting${selectedBookings.length > 1 ? 's' : ''}` : 'No meetings'}
          </p>
          {selectedBookings.length === 0 && (
            <p style={{ fontSize: 13, color: inkMuted }}>No bookings on this day.</p>
          )}
          {selectedBookings.map(b => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 0', borderTop: `1px solid oklch(0.42 0.09 165 / 0.2)` }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: ink }}>{b.contact_name}</p>
                <p style={{ fontSize: 12, color: inkSoft }}>{b.business_name || '—'}</p>
              </div>
              {b.meeting_link ? (
                <a href={b.meeting_link} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: emeraldDeep, textDecoration: 'none', padding: '6px 12px', border: `1px solid ${emeraldDeep}`, borderRadius: 'var(--r)', background: paper }}>
                  <Icon name="arrow-right" size={13} /> Join meeting
                </a>
              ) : (
                <span style={{ fontSize: 12, color: inkMuted, fontStyle: 'italic' }}>No link yet</span>
              )}
              <span style={{ fontSize: 12, fontWeight: 500, color: b.status === 'confirmed' ? emeraldDeep : 'oklch(0.42 0.12 70)', textTransform: 'capitalize' }}>
                {b.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────── */}
      <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.14em', color: inkMuted, marginBottom: 12 }}>All bookings</p>

      {loading ? (
        <p style={{ color: inkMuted, fontSize: 14 }}>Loading…</p>
      ) : (
        <TableWrap>
          <thead><THead cols={['Name', 'Business', 'Date', 'Meeting link', 'Status', 'Action']} /></thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} style={{ borderBottom: `1px solid ${hairline}` }}>
                <TD bold>{b.contact_name}</TD>
                <TD>{b.business_name || '—'}</TD>
                <TD muted>{b.booked_date ? fmtDate(b.booked_date + 'T12:00:00Z') : '—'}</TD>
                <td style={{ padding: '8px 16px' }}>
                  {editingLink === b.id ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        value={linkInput}
                        onChange={e => setLinkInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveLink(b.id); if (e.key === 'Escape') setEditingLink(null); }}
                        placeholder="https://meet.google.com/…"
                        autoFocus
                        style={{ flex: 1, height: 30, border: `1px solid ${hairlineStrong}`, borderRadius: 'var(--r)', padding: '0 8px', fontSize: 12, color: ink, outline: 'none', background: paper, minWidth: 200 }}
                      />
                      <Btn onClick={() => saveLink(b.id)}>Save</Btn>
                      <button onClick={() => setEditingLink(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: inkMuted, padding: 0 }}>
                        <Icon name="x" size={14} />
                      </button>
                    </div>
                  ) : b.meeting_link ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <a href={b.meeting_link} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 13, color: emeraldDeep, textDecoration: 'underline', textUnderlineOffset: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                        {b.meeting_link.replace(/^https?:\/\//, '')}
                      </a>
                      <button onClick={() => { setEditingLink(b.id); setLinkInput(b.meeting_link); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: inkMuted, padding: 0, flexShrink: 0 }}>
                        <Icon name="settings" size={12} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingLink(b.id); setLinkInput(''); }}
                      style={{ fontSize: 12, color: inkMuted, background: 'none', border: `1px dashed ${hairlineStrong}`, borderRadius: 'var(--r)', padding: '3px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Icon name="plus" size={11} /> Add link
                    </button>
                  )}
                </td>
                <TD>
                  <span style={{ fontSize: 12, fontWeight: 500, color: b.status === 'confirmed' ? emeraldDeep : 'oklch(0.42 0.12 70)', textTransform: 'capitalize' }}>
                    {b.status}
                  </span>
                </TD>
                <TD right>
                  <Btn onClick={() => toggleStatus(b)}>
                    {b.status === 'confirmed' ? 'Set pending' : 'Confirm'}
                  </Btn>
                </TD>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '32px 16px', textAlign: 'center', color: inkMuted, fontSize: 14 }}>No bookings yet.</td></tr>
            )}
          </tbody>
        </TableWrap>
      )}
    </Shell>
  );
}
