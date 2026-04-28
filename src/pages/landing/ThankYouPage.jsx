import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SiteShell } from '../../components/landing/SiteShell';
import { CheckCircle2, Download } from 'lucide-react';

export default function ThankYouPage() {
  useEffect(() => {
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Schedule');
    }
  }, []);

  return (
    <SiteShell>
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-20 sm:pt-28 pb-24 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-xg-sage mb-6" />
          <p className="text-[12px] uppercase tracking-[0.16em] text-ink-muted mb-4">You're booked</p>
          <h1 className="font-display text-[38px] sm:text-[54px] leading-[1.02] text-xg-bordo max-w-[600px] mx-auto">
            See you soon.
          </h1>
          <p className="mt-6 max-w-[440px] mx-auto text-[16px] text-ink-soft leading-relaxed">
            Check your email for the calendar invite. We'll come prepared with specifics for your program — no generic pitch.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/Client Success Playbook 2026.pdf"
              download="Gift Card Revenue Report — Xperigift.pdf"
              className="inline-flex h-11 items-center gap-2 rounded-sm bg-xg-bordo text-white hover:opacity-90 px-6 text-[14px] font-medium transition-opacity"
            >
              <Download className="h-4 w-4" />
              Download the Revenue Gap Report
            </a>
            <Link
              to="/"
              className="inline-flex h-11 items-center rounded-sm border border-xg-teal-dark text-xg-teal-dark hover:border-xg-teal hover:text-xg-teal px-5 text-[14px] font-medium transition-colors"
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
