import { SiteShell } from '../../components/landing/SiteShell';
import { CTALink } from '../../components/landing/CTALink';
import { Eyebrow } from '../../components/landing/Eyebrow';
import {
  TrendingUp, Clock, BarChart3, Megaphone,
  ClipboardList, FileText, Rocket,
  Sparkles, Scissors, UtensilsCrossed, Flag, ShoppingBag, Target,
  CheckCircle2,
} from 'lucide-react';

const PILLARS = [
  { icon: TrendingUp, title: 'Pre-paid revenue', body: 'Gift cards are cash in your account before a service is delivered. We help you capture more of it — year-round, not just in December.' },
  { icon: Clock, title: 'Managed end-to-end', body: 'We design, write, and run every campaign. You approve in under 24 hours. No new software to learn. No staff hours diverted.' },
  { icon: BarChart3, title: 'Data that pays back', body: 'Every gift card sale builds a customer record. We use that data to re-engage buyers, convert recipients, and identify high-value segments.' },
  { icon: Megaphone, title: 'Strategy first', body: 'You get a written 90-day calendar before anything goes out — offers, timing, targets. No surprises, no guesswork.' },
];

const STEPS = [
  { n: '01', icon: ClipboardList, title: 'Audit', body: 'A free 30-minute session. You walk away with two to three specific revenue opportunities regardless of next steps.' },
  { n: '02', icon: FileText, title: 'Strategy', body: 'A written plan with a campaign calendar, offers, and revenue targets — before we spend a dollar.' },
  { n: '03', icon: Rocket, title: 'Execution', body: 'We build and send everything. You approve once. We handle the rest end-to-end.' },
  { n: '04', icon: BarChart3, title: 'Dashboard', body: 'Real-time visibility into sales, customers, and campaign performance — simple and clear.' },
];

const INDUSTRIES = [
  { icon: Sparkles, label: 'Spas' },
  { icon: Scissors, label: 'Salons' },
  { icon: UtensilsCrossed, label: 'Restaurants' },
  { icon: Flag, label: 'Golf clubs' },
  { icon: ShoppingBag, label: 'Specialty retail' },
  { icon: Target, label: 'Gun shops' },
];

const FAQS = [
  {
    q: 'How is this different from just using a gift card platform?',
    a: "A platform gives you a tool. We give you a result. We manage the platform for you — plus the strategy, the campaigns, and the reporting. You don't need to learn anything new.",
  },
  {
    q: 'What does the audit cost?',
    a: "Nothing. Thirty minutes. You'll leave with two to three specific revenue opportunities — yours to act on whether or not you work with us.",
  },
  {
    q: 'How quickly can I see results?',
    a: 'Most clients see incremental revenue in the first campaign cycle — usually within 30 days of strategy sign-off. The 90-day plan is built to generate early wins first.',
  },
  {
    q: 'Do I need to have a gift card program already?',
    a: "No. We can build from zero or improve what you already have. Either way, the audit tells us where to start.",
  },
  {
    q: 'What does it cost to work together?',
    a: "Pricing is scoped per engagement based on your program size and goals. We'll cover that clearly at the end of the audit — no surprises.",
  },
];

export default function HomePage() {
  return (
    <SiteShell>

      {/* ── Hero ── */}
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-20 sm:pt-28 pb-16 sm:pb-24">
          <Eyebrow>Gift card revenue management</Eyebrow>
          <h1 className="mt-5 font-display text-[42px] sm:text-[60px] lg:text-[72px] leading-[1.02] text-xg-bordo max-w-[720px]">
            Your gift cards should be earning more.
          </h1>
          <p className="mt-6 max-w-[500px] text-[17px] text-ink-soft leading-relaxed">
            Xperigift manages your entire gift card revenue channel — strategy, campaigns, and reporting — so you don't have to.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <CTALink to="/book-audit" size="lg">Book a free audit</CTALink>
            <CTALink to="/how-it-works" variant="outline" size="lg">See how it works</CTALink>
          </div>
        </div>
      </section>

      {/* ── Marquee strip ── */}
      <div className="border-b border-hairline bg-paper-soft overflow-hidden">
        <div className="flex gap-10 px-6 sm:px-10 py-4 text-[11px] uppercase tracking-[0.18em] text-ink-muted whitespace-nowrap">
          {['Built for operators', 'No platform to learn', 'Year-round revenue', 'Done with you', 'US SMBs only', '90-day cycles', 'Pre-paid revenue', 'Free audit to start'].map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Problem ── */}
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10 py-16 sm:py-24">
          <Eyebrow>The problem</Eyebrow>
          <h2 className="mt-5 font-display text-[32px] sm:text-[44px] leading-[1.05] text-xg-bordo max-w-[580px] mb-12">
            Most gift card programs leave money on the table.
          </h2>
          <div className="grid sm:grid-cols-3 border border-hairline divide-y sm:divide-y-0 sm:divide-x divide-hairline">
            {[
              { label: 'One seasonal push', body: 'November–December spike, then near-silence. The rest of the year is a missed opportunity most operators never go back to.' },
              { label: 'No system behind it', body: 'Gift cards are sold reactively — at checkout, on request — without a structured calendar, segmented campaigns, or re-engagement plan.' },
              { label: 'Data stays idle', body: 'Every sale is a customer record. Without a system to act on it, that data just sits. Buyers don\'t hear from you again.' },
            ].map((p) => (
              <div key={p.label} className="p-7 sm:p-8 bg-paper">
                <p className="text-[11px] uppercase tracking-[0.15em] text-ink-muted mb-3">{p.label}</p>
                <p className="text-[15px] text-ink-soft leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Solution pillars ── */}
      <section className="border-b border-hairline bg-paper-soft">
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10 py-16 sm:py-24">
          <Eyebrow>The solution</Eyebrow>
          <h2 className="mt-5 font-display text-[32px] sm:text-[44px] leading-[1.05] text-xg-bordo max-w-[580px] mb-12">
            A managed channel, not another tool.
          </h2>
          <div className="grid sm:grid-cols-2 border border-hairline divide-y sm:divide-y-0 divide-hairline">
            <div className="grid divide-y divide-hairline">
              {PILLARS.slice(0, 2).map((p) => (
                <div key={p.title} className="p-7 sm:p-8 bg-xg-cream">
                  <p.icon className="h-5 w-5 text-emerald mb-4" />
                  <h3 className="font-display text-[20px] text-xg-bordo mb-2">{p.title}</h3>
                  <p className="text-[15px] text-ink-soft leading-relaxed">{p.body}</p>
                </div>
              ))}
            </div>
            <div className="grid divide-y divide-hairline border-t sm:border-t-0 sm:border-l border-hairline">
              {PILLARS.slice(2).map((p) => (
                <div key={p.title} className="p-7 sm:p-8 bg-xg-cream">
                  <p.icon className="h-5 w-5 text-emerald mb-4" />
                  <h3 className="font-display text-[20px] text-xg-bordo mb-2">{p.title}</h3>
                  <p className="text-[15px] text-ink-soft leading-relaxed">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10 py-16 sm:py-24">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-5 font-display text-[32px] sm:text-[44px] leading-[1.05] text-xg-bordo max-w-[500px] mb-12">
            From audit to revenue in 90 days.
          </h2>
          <ol className="grid sm:grid-cols-2 border border-hairline divide-y sm:divide-y-0 divide-hairline">
            <div className="grid divide-y divide-hairline">
              {STEPS.slice(0, 2).map((s) => (
                <li key={s.n} className="p-7 sm:p-8 bg-paper list-none">
                  <span className="font-display text-[40px] text-hairline-strong leading-none block">{s.n}</span>
                  <div className="mt-3 mb-4 inline-flex h-9 w-9 items-center justify-center rounded-sm bg-emerald-soft">
                    <s.icon className="h-4 w-4 text-emerald-deep" />
                  </div>
                  <h3 className="font-display text-[20px] text-xg-bordo mb-2">{s.title}</h3>
                  <p className="text-[15px] text-ink-soft leading-relaxed">{s.body}</p>
                </li>
              ))}
            </div>
            <div className="grid divide-y divide-hairline border-t sm:border-t-0 sm:border-l border-hairline">
              {STEPS.slice(2).map((s) => (
                <li key={s.n} className="p-7 sm:p-8 bg-paper list-none">
                  <span className="font-display text-[40px] text-hairline-strong leading-none block">{s.n}</span>
                  <div className="mt-3 mb-4 inline-flex h-9 w-9 items-center justify-center rounded-sm bg-emerald-soft">
                    <s.icon className="h-4 w-4 text-emerald-deep" />
                  </div>
                  <h3 className="font-display text-[20px] text-xg-bordo mb-2">{s.title}</h3>
                  <p className="text-[15px] text-ink-soft leading-relaxed">{s.body}</p>
                </li>
              ))}
            </div>
          </ol>
          <div className="mt-8">
            <CTALink to="/how-it-works" variant="outline">See the full process</CTALink>
          </div>
        </div>
      </section>

      {/* ── Outcomes — dark ── */}
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10 py-16 sm:py-24">
          <Eyebrow style={{ color: 'oklch(0.985 0.005 85 / 0.45)' }}>Outcomes</Eyebrow>
          <h2 className="mt-5 font-display text-[32px] sm:text-[44px] leading-[1.05] max-w-[640px] mb-14">
            What a well-run program looks like.
          </h2>
          <div className="grid gap-10 sm:grid-cols-3 border-t border-paper/10 pt-10">
            {[
              { value: '3–5×', label: 'More revenue vs. unmanaged programs' },
              { value: '90 days', label: 'Typical time to first incremental revenue' },
              { value: '$0', label: 'Cost to start — the audit is free' },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display text-[44px] sm:text-[52px] leading-none text-xg-terracotta">{s.value}</p>
                <p className="mt-3 text-[13px] text-paper/50 uppercase tracking-widest leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Industries ── */}
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10 py-16 sm:py-24">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-4">
              <Eyebrow>Verticals</Eyebrow>
              <h2 className="mt-5 font-display text-[28px] sm:text-[36px] leading-[1.1] text-xg-bordo mb-4">
                Vertical-specific programs that actually work.
              </h2>
              <p className="text-[15px] text-ink-soft leading-relaxed mb-8">
                We work with US service-led SMBs doing $150k–$2M in revenue. Different verticals need different playbooks.
              </p>
              <CTALink to="/industries" variant="outline">See all verticals</CTALink>
            </div>
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 border border-hairline divide-y divide-hairline">
              {INDUSTRIES.map((i, idx) => (
                <div key={i.label} className={`p-6 bg-paper flex flex-col gap-3 ${idx % 3 !== 0 ? 'border-l border-hairline' : ''}`}>
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-emerald-soft">
                    <i.icon className="h-4 w-4 text-emerald-deep" />
                  </div>
                  <p className="font-display text-[17px] text-xg-bordo">{i.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DIY vs Xperigift ── */}
      <section className="border-b border-hairline bg-paper-soft">
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10 py-16 sm:py-24">
          <Eyebrow>Why us</Eyebrow>
          <h2 className="mt-5 font-display text-[32px] sm:text-[44px] leading-[1.05] text-xg-bordo mb-12">
            Doing it yourself vs. Xperigift.
          </h2>
          <div className="grid sm:grid-cols-2 border border-hairline divide-y sm:divide-y-0 sm:divide-x divide-hairline">
            <div className="p-7 sm:p-8 bg-paper space-y-4">
              <p className="text-[11px] uppercase tracking-[0.15em] text-ink-muted mb-5">DIY / unmanaged</p>
              {[
                'Gift cards pushed once a year, if at all',
                'No system for re-engaging buyers',
                'Staff time diverted to learn new tools',
                'No strategy, no calendar, no targets',
                'Revenue left on the table year-round',
              ].map((t) => (
                <div key={t} className="flex gap-3 items-start text-[15px] text-ink-muted">
                  <span className="mt-2.5 h-1 w-1 rounded-full bg-hairline-strong shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
            <div className="p-7 sm:p-8 bg-paper space-y-4">
              <p className="text-[11px] uppercase tracking-[0.15em] text-xg-teal mb-5">Xperigift</p>
              {[
                'Year-round calendar built to your business cycle',
                'Automated re-engagement for buyers and recipients',
                'Zero new tools — we manage everything',
                'Written 90-day strategy before anything goes out',
                'Clear revenue targets you can hold us to',
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

      {/* ── FAQ ── */}
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-[760px] px-6 sm:px-10 py-16 sm:py-24">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="mt-5 font-display text-[32px] sm:text-[40px] leading-[1.05] text-xg-bordo mb-10">
            Common questions.
          </h2>
          <div className="divide-y divide-hairline border-y border-hairline">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer items-center justify-between gap-6 text-[15px] font-medium text-ink list-none select-none">
                  {f.q}
                  <span className="shrink-0 text-ink-muted text-[18px] leading-none group-open:rotate-45 transition-transform origin-center">+</span>
                </summary>
                <p className="mt-4 text-[14px] text-ink-soft leading-relaxed pr-8">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-xg-cream">
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10 py-16 sm:py-28 text-center">
          <h2 className="font-display text-[34px] sm:text-[48px] leading-[1.05] max-w-[640px] mx-auto text-xg-bordo">
            Find out what your gift card program is leaving behind.
          </h2>
          <p className="mt-5 max-w-[420px] mx-auto text-[15px] leading-relaxed text-ink-soft">
            Thirty minutes. No pitch. Two to three specific revenue opportunities you can act on immediately.
          </p>
          <div className="mt-9 flex flex-wrap gap-3 justify-center">
            <CTALink to="/book-audit" size="lg">
              Book your free audit
            </CTALink>
          </div>
        </div>
      </section>

    </SiteShell>
  );
}
