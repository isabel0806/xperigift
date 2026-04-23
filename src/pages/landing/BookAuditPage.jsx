import { SiteShell } from '../../components/landing/SiteShell';
import { Eyebrow } from '../../components/landing/Eyebrow';

export default function BookAuditPage() {
  return (
    <SiteShell>
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-20 sm:pt-28 pb-12">
          <div className="max-w-[640px]">
            <Eyebrow>Free audit</Eyebrow>
            <h1 className="mt-5 font-display text-[38px] sm:text-[54px] leading-[1.02] text-ink">
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
          <iframe
            src="https://calendly.com/isabel-thegiftcardcafe/30min"
            width="100%"
            height="700"
            frameBorder="0"
            title="Book a free audit"
          />
        </div>
      </section>
    </SiteShell>
  );
}
