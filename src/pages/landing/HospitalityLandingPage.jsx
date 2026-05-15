import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SiteShell } from '../../components/landing/SiteShell';
import { Eyebrow } from '../../components/landing/Eyebrow';
import { CheckCircle2 } from 'lucide-react';

const STATS = [
  { value: '$8K–$15K', label: 'Average property earns per year from gift cards' },
  { value: '$38K–$60K', label: 'Top 10% of properties earn per year' },
  { value: '$126K', label: 'Top 10% of inns and B&Bs earn per year' },
];

const PROOF = [
  { heading: 'Highest avg ticket', body: 'Hospitality gift cards average $200–$350 per transaction — the highest of any vertical. The buyer is already thinking experientially.' },
  { heading: '"Romantic Getaway" package', body: 'The single highest-converting gift card offer across all verticals. Properties that name and price it explicitly outsell those that don\'t.' },
  { heading: "Valentine's Day", body: 'Top-10% properties see a 4× revenue lift around Valentine\'s Day. Most properties send one email — top performers run a four-week sequence.' },
];

export default function HospitalityLandingPage() {
  const navigate = useNavigate();
  const calendlyRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data?.event === 'calendly.event_scheduled') {
        navigate('/thank-you');
      }
      if (e.data?.event === 'calendly.page_height' && calendlyRef.current) {
        calendlyRef.current.style.height = e.data.payload.height;
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  return (
    <SiteShell>

      {/* Hero + Calendly */}
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-16 sm:pt-24 pb-16 sm:pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Left: hook */}
          <div className="pt-4 pb-10 lg:pb-16">
            <Eyebrow>Boutique Hotels &amp; B&amp;Bs</Eyebrow>
            <h1 className="mt-5 font-display text-[36px] sm:text-[52px] leading-[1.02] text-xg-bordo">
              Your property is leaving up to $45K in gift card revenue behind.
            </h1>
            <p className="mt-6 text-[16px] text-ink-soft leading-relaxed">
              The gap between an average hospitality program and a top-10% one is $23K–$45K per year. Top inns and B&Bs earn $126K. The difference is a system, not a platform.
            </p>
            <p className="mt-4 text-[15px] text-ink-soft leading-relaxed">
              Book a free 30-minute audit. You'll leave with two to three specific revenue opportunities — yours to keep, no strings attached.
            </p>

            <div className="mt-8 space-y-2">
              {[
                'No pitch. No deck.',
                'Two to three specific opportunities for your property',
                'Free — no obligation to work together',
              ].map((t) => (
                <div key={t} className="flex gap-2 items-center text-[14px] text-ink-soft">
                  <CheckCircle2 className="h-4 w-4 text-xg-sage shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Calendly */}
          <div className="border-l border-hairline pl-0 lg:pl-10">
            <div
              ref={calendlyRef}
              className="calendly-inline-widget"
              data-url="https://calendly.com/isabel-thegiftcardcafe/new-meeting"
              style={{ minWidth: '280px', height: '1050px' }}
            />
          </div>

        </div>
      </section>

      {/* Stats */}
      <section className="bg-paper-soft border-b border-hairline">
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10 py-14 sm:py-20">
          <div className="grid gap-10 sm:grid-cols-3 border-t border-hairline pt-10">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="font-display text-[36px] sm:text-[44px] leading-none text-xg-terracotta">{s.value}</p>
                <p className="mt-3 text-[13px] text-ink-muted uppercase tracking-widest leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proof points */}
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10 py-16 sm:py-24">
          <Eyebrow>What the data shows</Eyebrow>
          <h2 className="mt-5 font-display text-[28px] sm:text-[38px] leading-[1.05] text-xg-bordo max-w-[560px] mb-12">
            Guests already want an experience. The program just has to show up.
          </h2>
          <div className="grid sm:grid-cols-3 border border-hairline divide-y sm:divide-y-0 sm:divide-x divide-hairline">
            {PROOF.map((p) => (
              <div key={p.heading} className="p-7 sm:p-8 bg-paper">
                <p className="text-[11px] uppercase tracking-[0.15em] text-ink-muted mb-3">{p.heading}</p>
                <p className="text-[15px] text-ink-soft leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="border-b border-hairline bg-paper-soft">
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10 py-16 sm:py-24">
          <Eyebrow>How Xperigift works</Eyebrow>
          <h2 className="mt-5 font-display text-[28px] sm:text-[38px] leading-[1.05] text-xg-bordo max-w-[500px] mb-10">
            We run the program. You approve once.
          </h2>
          <div className="grid sm:grid-cols-2 border border-hairline divide-y sm:divide-y-0 sm:divide-x divide-hairline">
            <div className="p-7 sm:p-8 bg-paper space-y-4">
              <p className="text-[11px] uppercase tracking-[0.15em] text-ink-muted mb-5">Without a system</p>
              {[
                'Gift cards sold on request — no packages, no campaigns',
                'Valentine\'s Day and holidays underworked or missed',
                'No "Romantic Getaway" or named package to drive conversions',
                'Buyers never re-engaged after purchase',
              ].map((t) => (
                <div key={t} className="flex gap-3 items-start text-[15px] text-ink-muted">
                  <span className="mt-2.5 h-1 w-1 rounded-full bg-hairline-strong shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
            <div className="p-7 sm:p-8 bg-paper space-y-4">
              <p className="text-[11px] uppercase tracking-[0.15em] text-xg-teal mb-5">With Xperigift</p>
              {[
                'Named packages and experiences that convert at the highest rates',
                'Multi-week sequences around Valentine\'s Day, holidays, and anniversaries',
                'Automated re-engagement for buyers and recipients',
                'Written 90-day strategy you approve before anything sends',
              ].map((t) => (
                <div key={t} className="flex gap-3 items-start text-[15px] text-ink">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-xg-sage shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </SiteShell>
  );
}
