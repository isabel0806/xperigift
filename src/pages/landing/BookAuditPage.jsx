import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SiteShell } from '../../components/landing/SiteShell';
import { Eyebrow } from '../../components/landing/Eyebrow';
import { supabase } from '../../lib/supabase';

export default function BookAuditPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('form'); // 'form' | 'calendly'
  const [leadId, setLeadId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', business_website: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load Calendly script once we reach that step
  useEffect(() => {
    if (step !== 'calendly') return;
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, [step]);

  // Listen for Calendly booking completion
  useEffect(() => {
    const handleMessage = async (e) => {
      if (e.data?.event !== 'calendly.event_scheduled') return;

      // Mark lead as scheduled in Supabase
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
        business_website: form.business_website.trim() || null,
      })
      .select('id')
      .single();

    setLoading(false);

    if (dbError) {
      setError('Something went wrong. Please try again.');
      return;
    }

    setLeadId(data.id);
    setStep('calendly');
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

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
                  <label className="block text-[13px] font-medium text-ink mb-1.5">Your name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    required
                    autoFocus
                    placeholder="Maria García"
                    className="w-full h-11 px-4 border border-hairline-strong rounded-sm text-[14px] text-ink bg-white focus:outline-none focus:ring-2 focus:ring-xg-bordo/30 focus:border-xg-bordo transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    required
                    placeholder="maria@yourbusiness.com"
                    className="w-full h-11 px-4 border border-hairline-strong rounded-sm text-[14px] text-ink bg-white focus:outline-none focus:ring-2 focus:ring-xg-bordo/30 focus:border-xg-bordo transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">Phone number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full h-11 px-4 border border-hairline-strong rounded-sm text-[14px] text-ink bg-white focus:outline-none focus:ring-2 focus:ring-xg-bordo/30 focus:border-xg-bordo transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">Business website</label>
                  <input
                    type="url"
                    value={form.business_website}
                    onChange={(e) => set('business_website', e.target.value)}
                    placeholder="https://yourbusiness.com"
                    className="w-full h-11 px-4 border border-hairline-strong rounded-sm text-[14px] text-ink bg-white focus:outline-none focus:ring-2 focus:ring-xg-bordo/30 focus:border-xg-bordo transition-colors"
                  />
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
