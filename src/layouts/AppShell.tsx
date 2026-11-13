import { useState, type ComponentType, type ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/components/ui/cn';
import { AmbientShapes } from '@/components/ui/AmbientShapes';
import { Modal } from '@/components/ui/Modal';
import { SkipLink } from './SkipLink';

export interface NavItem {
  /** Route path, e.g. /student/path */
  to: string;
  /** i18n key, e.g. nav.student.dashboard */
  labelKey: string;
  icon?: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  /** Match only the exact path (use for index routes like /student). */
  end?: boolean;
}

export interface LayoutProps {
  navItems: NavItem[];
  /** i18n key for the product/brand name shown in the sidebar. Default: app.name */
  brandKey?: string;
  /** Slot in the top bar (e.g. language switcher, user menu, accessibility toggles). */
  headerSlot?: ReactNode;
  /** Slot at the bottom of the sidebar (e.g. sign out). */
  sidebarFooter?: ReactNode;
}

// Active indicator: a bar at the left edge that scales in (transform only). `before:` bar is decorative.
const linkBase =
  'group relative flex min-h-[44px] items-center gap-3 rounded-md px-3 text-sm font-semibold outline-none transition-colors duration-fast ease-standard before:absolute before:inset-y-2 before:left-0 before:w-1 before:origin-center before:scale-y-0 before:rounded-full before:bg-brand-600 before:transition-transform before:duration-base before:ease-standard focus-visible:shadow-focus active:bg-brand-100';
const linkActive = 'bg-brand-50 text-brand-700 before:scale-y-100';

// Bottom nav item: a top bar scales in for the active item.
const bottomBase =
  'group relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-1 text-xs font-semibold outline-none transition-colors duration-fast ease-standard before:absolute before:inset-x-4 before:top-0 before:h-0.5 before:origin-center before:scale-x-0 before:rounded-full before:bg-brand-600 before:transition-transform before:duration-base before:ease-standard focus-visible:shadow-focus active:bg-brand-50';

export function AppShell({ navItems, brandKey = 'app.name', headerSlot, sidebarFooter }: LayoutProps) {
  const { t } = useTranslation();
  const navLabel = t('layout.mainNavigation');
  const [moreOpen, setMoreOpen] = useState(false);
  const needsMore = navItems.length > 5;
  const primary = needsMore ? navItems.slice(0, 4) : navItems;
  const overflow = needsMore ? navItems.slice(4) : [];
  const { pathname } = useLocation();
  const overflowActive = overflow.some((i) => (i.end ? pathname === i.to : pathname === i.to || pathname.startsWith(`${i.to}/`)));
  return (
    <div className="relative isolate min-h-screen bg-surface-muted text-ink">
      <SkipLink />
      <AmbientShapes />

      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line bg-surface md:flex">
        <div className="px-5 py-5 text-lg font-bold text-brand-700">{t(brandKey)}</div>
        <nav aria-label={navLabel} className="flex-1 overflow-y-auto px-3">
          <ul className="flex flex-col gap-1">
            {navItems.map(({ to, labelKey, icon: Icon, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} className={({ isActive }) => cn(linkBase, isActive ? linkActive : 'text-ink-soft hover:bg-surface-sunken hover:text-ink')}>
                  {Icon && <Icon aria-hidden className="fx-nav-icon h-5 w-5" />}
                  {t(labelKey)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        {sidebarFooter && <div className="border-t border-line p-3">{sidebarFooter}</div>}
      </aside>

      <div className="md:pl-64">
        <header className="flex min-h-[56px] items-center justify-between gap-3 border-b border-line bg-surface px-4 md:px-8">
          <span className="font-bold text-brand-700 md:hidden">{t(brandKey)}</span>
          <div className="ml-auto flex items-center gap-2">{headerSlot}</div>
        </header>
        <main id="main-content" tabIndex={-1} className="mx-auto max-w-6xl px-4 pb-28 pt-6 outline-none md:px-8 md:pb-10">
          {/* Keyed by path so each route change replays a short fade/slide. */}
          <div key={pathname} className="fx-page animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      <nav aria-label={t('a11y.landmark.navigationMobile')} className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface md:hidden">
        <ul className="flex justify-around">
          {primary.map(({ to, labelKey, icon: Icon, end }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(bottomBase, isActive ? 'text-brand-700 before:scale-x-100' : 'text-ink-soft hover:text-ink')
                }
              >
                {Icon && <Icon aria-hidden className="fx-nav-icon h-5 w-5" />}
                <span>{t(labelKey)}</span>
              </NavLink>
            </li>
          ))}
          {needsMore && (
            <li className="flex-1">
              <button
                type="button"
                aria-expanded={moreOpen}
                aria-haspopup="dialog"
                aria-current={overflowActive ? 'page' : undefined}
                onClick={() => setMoreOpen(true)}
                className={cn(bottomBase, 'w-full', overflowActive ? 'text-brand-700 before:scale-x-100' : 'text-ink-soft hover:text-ink')}
              >
                <MoreHorizontal aria-hidden className="fx-nav-icon h-5 w-5" />
                <span>{t('nav.menu.open')}</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
      {needsMore && (
        <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title={navLabel} closeLabel={t('nav.menu.close')}>
          <ul className="flex flex-col gap-1">
            {overflow.map(({ to, labelKey, icon: Icon, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} onClick={() => setMoreOpen(false)} className={({ isActive }) => cn(linkBase, isActive ? linkActive : 'text-ink-soft hover:bg-surface-sunken hover:text-ink')}>
                  {Icon && <Icon aria-hidden className="fx-nav-icon h-5 w-5" />}
                  {t(labelKey)}
                </NavLink>
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </div>
  );
}
