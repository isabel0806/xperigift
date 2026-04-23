import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { SiteShell } from '../../components/landing/SiteShell';
import { Eyebrow } from '../../components/landing/Eyebrow';
import { supabase } from '../../lib/supabase';

const INDUSTRIES = ['Spa', 'Salon', 'Restaurant', 'Golf club', 'Specialty retail', 'Gun shop', 'Other'];
const REVENUE_BANDS = ['Under $150k', '$150k–$500k', '$500k–$1M', '$1M–$2M', 'Over $2M'];
const GC_STATUSES = ["We don't sell gift cards yet", 'We sell them occasionally', 'We have an active program'];

const BLANK = {
  contact_name: '', email: '', phone: '', business_name: '', website: '',
  industry: '', revenue_band: '', gc_status: '', challenges: '', booked_date: '',
};

export default function BookAuditPage() {
  const [form, setForm] = useState(BLANK);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.contact_name || !form.email || !form.business_name || !form.booked_date) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setError('');
    const { error: err } = await supabase.from('audit_bookings').insert({
      contact_name: form.contact_name,
      business_name: form.business_name,
      email: form.email,
      booked_date: form.booked_date,
      notes: [
        form.phone && `Phone: ${form.phone}`,
        form.website && `Website: ${form.website}`,
        form.industry && `Industry: ${form.industry}`,
        form.revenue_band && `Revenue: ${form.revenue_band}`,
        form.gc_status && `Gift card status: ${form.gc_status}`,
        form.challenges && `Challenges: ${form.challenges}`,
      ].filter(Boolean).join('\n'),
      status: 'pending',
    });
    setSubmitting(false);
    if (err) { setError('Something went wrong. Please try again or email us directly.'); return; }
    setDone(true);
  };

  const inputCls = 'w-full h-10 border border-hairline-strong rounded-sm bg-paper px-3 text-[14px] text-ink outline-none focus:border-ink transition-colors';
  const labelCls = 'block text-[13px] font-medium text-ink mb-1.5';

  if (done) {
    return (
      <SiteShell>
        <section className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-[480px] px-5 py-20">
            <CheckCircle className="h-12 w-12 text-emerald mx-auto" />
            <h1 className="mt-6 font-display text-[36px] text-ink leading-tight">You're booked.</h1>
            <p className="mt-4 text-[16px] text-ink-soft leading-relaxed">
              We'll confirm your time and send a calendar invite shortly. Talk soon.
            </p>
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-20 sm:pt-28 pb-12">
          <div className="max-w-[640px]">
            <Eyebrow>Free audit</Eyebrow>
            <h1 className="mt-6 font-display text-[44px] sm:text-[60px] leading-[1] text-ink">
              Book your 30-minute audit.
            </h1>
            <p className="mt-6 text-[17px] text-ink-soft leading-relaxed">
              No pitch. No deck. You'll leave with two to three specific gift card revenue opportunities — yours to keep regardless.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-hairline">
        <div className="mx-auto max-w-[760px] px-6 sm:px-10 py-16 sm:py-20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Name *</label>
                <input value={form.contact_name} onChange={e => set('contact_name', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email *</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Business name *</label>
                <input value={form.business_name} onChange={e => set('business_name', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Website</label>
                <input type="url" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Preferred date *</label>
                <input type="date" value={form.booked_date} onChange={e => set('booked_date', e.target.value)}
                  min={new Date().toISOString().slice(0, 10)} className={inputCls} />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label className={labelCls}>Industry</label>
                <select value={form.industry} onChange={e => set('industry', e.target.value)}
                  className={inputCls + ' cursor-pointer'}>
                  <option value="">Select…</option>
                  {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Annual revenue</label>
                <select value={form.revenue_band} onChange={e => set('revenue_band', e.target.value)}
                  className={inputCls + ' cursor-pointer'}>
                  <option value="">Select…</option>
                  {REVENUE_BANDS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Gift card status</label>
                <select value={form.gc_status} onChange={e => set('gc_status', e.target.value)}
                  className={inputCls + ' cursor-pointer'}>
                  <option value="">Select…</option>
                  {GC_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Biggest challenge with gift cards (optional)</label>
              <textarea value={form.challenges} onChange={e => set('challenges', e.target.value)} rows={3}
                className="w-full border border-hairline-strong rounded-sm bg-paper px-3 py-2.5 text-[14px] text-ink outline-none focus:border-ink transition-colors resize-none" />
            </div>

            {error && <p className="text-[13px] text-red-600">{error}</p>}

            <button type="submit" disabled={submitting}
              className="inline-flex h-11 items-center rounded-sm bg-ink px-7 text-[14px] font-medium text-paper hover:bg-ink-soft disabled:opacity-60 transition-colors">
              {submitting ? 'Submitting…' : 'Request my audit'}
            </button>

            <p className="text-[12px] text-ink-muted">
              We'll follow up within one business day to confirm your time.
            </p>
          </form>
        </div>
      </section>
    </SiteShell>
  );
}
