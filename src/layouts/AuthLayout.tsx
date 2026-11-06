import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export interface AuthLayoutProps {
  brandKey?: string;
  /** Optional slot above the card (e.g. language switcher). */
  headerSlot?: ReactNode;
}

export function AuthLayout({ brandKey = 'app.name', headerSlot }: AuthLayoutProps) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col bg-surface-muted text-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-3 focus:font-semibold focus:text-brand-700 focus:shadow-raised focus:outline-none focus-visible:shadow-focus"
      >
        {t('layout.skipToContent')}
      </a>
      <header className="flex items-center justify-between px-4 py-4 md:px-8">
        <span className="text-lg font-bold text-brand-700">{t(brandKey)}</span>
        <div>{headerSlot}</div>
      </header>
      <main id="main-content" tabIndex={-1} className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 pb-10 outline-none">
        <div className="rounded-lg border border-line bg-surface p-6 shadow-card md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
