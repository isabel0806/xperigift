import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';

export function SiteShell({ children }) {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
