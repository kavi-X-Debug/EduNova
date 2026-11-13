import type { ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SkipLink } from './SkipLink';

export interface AuthLayoutProps {
  brandKey?: string;
  /** Optional slot above the card (e.g. language switcher). */
  headerSlot?: ReactNode;
}

export function AuthLayout({ brandKey = 'app.name', headerSlot }: AuthLayoutProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-screen flex-col bg-surface-muted text-ink">
      <SkipLink />
      <header className="flex items-center justify-between px-4 py-4 md:px-8">
        <span className="text-lg font-bold text-brand-700">{t(brandKey)}</span>
        <div>{headerSlot}</div>
      </header>
      <main id="main-content" tabIndex={-1} className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 pb-10 outline-none">
        <div key={pathname} className="animate-slide-up rounded-lg border border-line bg-surface p-6 shadow-card md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
