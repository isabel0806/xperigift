import { Briefcase, Compass, HandHeart, Target } from 'lucide-react';
import { SiteShell } from '../../components/landing/SiteShell';
import { CTALink } from '../../components/landing/CTALink';
import { Eyebrow } from '../../components/landing/Eyebrow';

const principles = [
  { icon: Target, title: 'Outcomes over outputs', body: 'We measure ourselves by revenue generated, not campaigns sent or features shipped.' },
  { icon: Briefcase, title: 'Operator mindset', body: "We've sat in your seat. Plans are built around staff time, cash flow, and real-world constraints." },
  { icon: Compass, title: 'One channel, deep focus', body: "Gift cards are our entire surface area. We don't sell a platform — we sell a result." },
  { icon: HandHeart, title: 'Done with you', body: 'You stay in control of your business. We handle the work and bring you the data.' },
];

export default function AboutPage() {
  return (
    <SiteShell>
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-20 sm:pt-28 pb-16 sm:pb-20">
          <div className="max-w-[820px]">
            <Eyebrow>About Xperigift</Eyebrow>
            <h1 className="mt-6 font-display text-[44px] sm:text-[60px] lg:text-[72px] leading-[1] text-xg-bordo">
              Built by operators. For operators.
            </h1>
            <p className="mt-7 max-w-[640px] text-[17px] sm:text-[19px] text-ink-soft leading-relaxed">
              Xperigift is not a software company. We're a small team focused on a single, often-ignored revenue channel for US-based SMBs — gift cards — and we run it for you.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-hairline">
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10 py-16 sm:py-24">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
              <Eyebrow>Why we exist</Eyebrow>
              <h2 className="mt-5 font-display text-[34px] sm:text-[40px] leading-[1.05] text-xg-bordo">
                Most SMBs don't need another tool.
              </h2>
            </div>
            <div className="md:col-span-7 space-y-5 text-[16px] text-ink-soft leading-relaxed">
              <p>
                We watched too many small businesses sign up for marketing platforms they never had time to use. Trials expired. Dashboards went unread. Real revenue stayed on the table.
              </p>
              <p>
                The problem wasn't the software — it was the model. Operators don't have spare hours to learn a new system. They need someone who knows the channel, runs it well, and reports back on what's working.
              </p>
              <p className="text-ink font-medium">
                That's the whole reason Xperigift exists. One channel. One outcome. Done with you.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-hairline bg-paper-soft">
        <div className="mx-auto max-w-[1200px] px-6 sm:px-10 py-16 sm:py-24">
          <Eyebrow>How we work</Eyebrow>
          <h2 className="mt-5 font-display text-[34px] sm:text-[44px] leading-[1.05] text-xg-bordo max-w-[700px]">
            Four principles that shape every engagement.
          </h2>
          <div className="mt-12 grid gap-px bg-hairline border border-hairline sm:grid-cols-2">
            {principles.map((p) => (
              <div key={p.title} className="bg-paper p-8">
                <p.icon className="h-5 w-5 text-emerald" />
                <h3 className="mt-5 font-display text-[24px] text-xg-bordo">{p.title}</h3>
                <p className="mt-3 text-[15px] text-ink-soft leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-hairline">
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10 py-16 sm:py-24">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
              <Eyebrow>Infrastructure</Eyebrow>
              <h2 className="mt-5 font-display text-[34px] sm:text-[40px] leading-[1.05] text-xg-bordo">
                Powered by a proven platform.
              </h2>
            </div>
            <div className="md:col-span-7 space-y-5 text-[16px] text-ink-soft leading-relaxed">
              <p>
                Xperigift is powered by{' '}
                <a href="https://thegiftcardcafe.com" target="_blank" rel="noopener noreferrer"
                  className="text-ink underline underline-offset-4 hover:text-emerald-deep">
                  TheGiftCardCafe
                </a>
                {' '}— the underlying gift card sales infrastructure we manage on your behalf. You don't need to learn it. You don't need to operate it.
              </p>
              <p>
                You get the result: a reliable, modern purchase experience for your customers and clean data flowing into your dashboard. We handle the system; you focus on running your business.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10 py-16 sm:py-24 text-center">
          <h2 className="font-display text-[34px] sm:text-[48px] leading-[1.05] max-w-[760px] mx-auto">
            Talk to an operator who's done this before.
          </h2>
          <p className="mt-6 max-w-lg mx-auto text-[15px] leading-relaxed" style={{ color: 'oklch(0.985 0.005 85 / 0.7)' }}>
            Thirty minutes. No deck. Just a working conversation about your business and what's possible.
          </p>
          <div className="mt-9 flex justify-center">
            <CTALink to="https://calendly.com/isabel-thegiftcardcafe/30min" size="lg" className="bg-xg-terracotta hover:bg-xg-terracotta-dark text-white">
              Book your free audit
            </CTALink>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
