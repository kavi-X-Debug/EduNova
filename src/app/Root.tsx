import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LoadingState } from '@/components/ui';
import { useT } from '@/i18n';
import { announce } from '@/lib/a11y';

export function AppLoading() {
  const t = useT();
  return <LoadingState label={t('ui.common.loading')} />;
}

/** After each route change: update document.title, move focus to <h1>, announce the page. */
function RouteFocus() {
  const { pathname } = useLocation();
  const t = useT();
  // Keep the latest `t` without re-running the effect when only the language changes
  // (a language switch must not steal focus from the switcher or re-announce the page).
  const tRef = useRef(t);
  tRef.current = t;
  useEffect(() => {
    // Wait a frame so lazy pages have rendered their heading.
    const id = window.setTimeout(() => {
      const h1 = document.querySelector<HTMLElement>('main h1');
      const brand = tRef.current('app.name');
      if (h1) {
        const title = h1.textContent?.trim() ?? '';
        document.title = title ? `${title} · ${brand}` : brand;
        if (!h1.hasAttribute('tabindex')) h1.setAttribute('tabindex', '-1');
        h1.focus();
        if (title) announce(title, 'polite');
      } else {
        document.title = brand;
      }
    }, 150);
    return () => window.clearTimeout(id);
  }, [pathname]);
  return null;
}

export function Root() {
  return (
    <>
      <RouteFocus />
      <Outlet />
    </>
  );
}
