import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SiteShell } from '../../components/landing/SiteShell';
import { Eyebrow } from '../../components/landing/Eyebrow';
import { CheckCircle2 } from 'lucide-react';

const STATS = [
  { value: '$38K', label: 'Average annual gift card revenue for golf clubs' },
  { value: '$97K', label: 'Top 10% of golf clubs earn per year' },
  { value: '$58K', label: 'Gap between average and top 10%' },
];

const PROOF = [
  { heading: 'High-ticket category', body: 'Club gift card buyers expect $200+. They\'re purchasing rounds, lessons, memberships, and experiences — not small gestures.' },
  { heading: 'Seasonal windows', body: 'Father\'s Day, member appreciation, tournament season, and the holiday window are all high-leverage moments most clubs underuse.' },
  { heading: 'Corporate gifting', body: 'Clubs with a corporate outreach system consistently land multi-card orders. Without one, that segment simply doesn\'t convert.' },
];

export default function ClubsLandingPage() {
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
            <Eyebrow>Golf &amp; Tennis Clubs</Eyebrow>
            <h1 className="mt-5 font-display text-[36px] sm:text-[52px] leading-[1.02] text-xg-bordo">
              The average club earns $38K from gift cards. The top 10% earn $97K.
            </h1>
            <p className="mt-6 text-[16px] text-ink-soft leading-relaxed">
              A $58K gap separates a typical club program from the top tier. It isn't a better platform — it's a better system.
            </p>
            <p className="mt-4 text-[15px] text-ink-soft leading-relaxed">
              Book a free 30-minute audit. You'll leave with two to three specific revenue opportunities — yours to keep, no strings attached.
            </p>

            <div className="mt-8 space-y-2">
              {[
                'No pitch. No deck.',
                'Two to three specific opportunities for your club',
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
      <section className="bg-ink text-paper border-b border-hairline">
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10 py-14 sm:py-20">
          <div className="grid gap-10 sm:grid-cols-3 border-t border-paper/10 pt-10">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="font-display text-[36px] sm:text-[44px] leading-none text-xg-terracotta">{s.value}</p>
                <p className="mt-3 text-[13px] text-paper/50 uppercase tracking-widest leading-relaxed">{s.label}</p>
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
            Clubs have the highest-ticket buyers in any vertical. Most leave it unworked.
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
                'Gift cards sold on request — no outreach, no calendar',
                'Father\'s Day and holiday windows missed or underworked',
                'Corporate buyers never targeted',
                'No tracking, no re-engagement, no targets',
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
                'Year-round calendar built around your club\'s peak moments',
                'Corporate outreach system that converts multi-card orders',
                'Automated follow-up for buyers and recipients',
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
