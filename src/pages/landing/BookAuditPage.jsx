import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SiteShell } from '../../components/landing/SiteShell';
import { Eyebrow } from '../../components/landing/Eyebrow';
import { supabase } from '../../lib/supabase';

const BUSINESS_TYPES = [
  'Spa/Massage Center',
  'Salon & Beauty',
  'Fitness Center',
  'Hotel/Inns/B&B',
  'Tattoo Shops',
  'Other',
];

const REVENUE_OPTIONS = [
  'Under $150K',
  '$150K - $500K',
  '$500K - $1M',
  'Over $1M',
];

const inputClass = 'w-full h-11 px-4 border border-hairline-strong rounded-sm text-[14px] text-ink bg-white focus:outline-none focus:ring-2 focus:ring-xg-bordo/30 focus:border-xg-bordo transition-colors';
const selectClass = 'w-full h-11 px-4 border border-hairline-strong rounded-sm text-[14px] text-ink bg-white focus:outline-none focus:ring-2 focus:ring-xg-bordo/30 focus:border-xg-bordo transition-colors appearance-none cursor-pointer';

export default function BookAuditPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('form');
  const [leadId, setLeadId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    business_type: '',
    annual_revenue: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (step !== 'calendly') return;
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, [step]);

  useEffect(() => {
    const handleMessage = async (e) => {
      if (e.data?.event !== 'calendly.event_scheduled') return;
      if (leadId) {
        await supabase
          .from('audit_leads')
          .update({
            meeting_scheduled: true,
            calendly_event_uri: e.data?.payload?.event?.uri || null,
          })
          .eq('id', leadId);
      }
      navigate('/thank-you');
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate, leadId]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: dbError } = await supabase
      .from('audit_leads')
      .insert({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        business_type: form.business_type,
        annual_revenue: form.annual_revenue,
      })
      .select('id')
      .single();

    setLoading(false);

    if (dbError) {
      console.error('Supabase error:', dbError);
      setError('Something went wrong. Please try again.');
      return;
    }

    setLeadId(data.id);
    setStep('calendly');
  };

  return (
    <SiteShell>
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-20 sm:pt-28 pb-12">
          <div className="max-w-[640px]">
            <Eyebrow>Free audit</Eyebrow>
            <h1 className="mt-5 font-display text-[38px] sm:text-[54px] leading-[1.02] text-xg-bordo">
              Book your 30-minute audit.
            </h1>
            <p className="mt-5 text-[16px] text-ink-soft leading-relaxed">
              No pitch. No deck. You'll leave with two to three specific gift card revenue opportunities — yours to keep regardless.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-hairline">
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10 py-10 sm:py-14">

          {step === 'form' && (
            <div className="max-w-[480px]">
              <p className="text-[13px] uppercase tracking-[0.14em] text-ink-muted mb-6">
                Step 1 of 2 — Tell us about your business
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">
                    Full name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    required
                    autoFocus
                    placeholder="Maria García"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">
                    Email address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    required
                    placeholder="maria@yourbusiness.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">
                    Phone number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    required
                    placeholder="+1 (555) 000-0000"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">
                    What type of business do you own? <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.business_type}
                      onChange={(e) => set('business_type', e.target.value)}
                      required
                      className={selectClass}
                    >
                      <option value="" disabled>Select...</option>
                      {BUSINESS_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted">▾</div>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">
                    Estimated annual revenue <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.annual_revenue}
                      onChange={(e) => set('annual_revenue', e.target.value)}
                      required
                      className={selectClass}
                    >
                      <option value="" disabled>Select...</option>
                      {REVENUE_OPTIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted">▾</div>
                  </div>
                </div>

                {error && <p className="text-[13px] text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-xg-bordo text-white rounded-sm text-[14px] font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {loading ? 'Saving…' : 'Continue to scheduling →'}
                </button>
              </form>
            </div>
          )}

          {step === 'calendly' && (
            <div>
              <p className="text-[13px] uppercase tracking-[0.14em] text-ink-muted mb-6">
                Step 2 of 2 — Pick a time
              </p>
              <div
                className="calendly-inline-widget"
                data-url="https://calendly.com/isabel-thegiftcardcafe/30min"
                style={{ minWidth: '320px', height: '700px' }}
              />
            </div>
          )}

        </div>
      </section>
    </SiteShell>
  );
}
