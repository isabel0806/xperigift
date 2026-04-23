import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';

export function SiteShell({ children }) {
  return (
    <div className="min-h-screen bg-xg-cream">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
