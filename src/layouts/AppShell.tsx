import { useState, type ComponentType, type ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
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
  /** Other path prefixes that should also highlight this item (e.g. Learn also covers /student/path). */
  alsoActiveFor?: string[];
}

export interface LayoutProps {
  navItems: NavItem[];
  /** i18n key for the product/brand name shown in the sidebar. Default: app.name */
  brandKey?: string;
  /** Slot in the top bar (e.g. language switcher, user menu, accessibility toggles). */
  headerSlot?: ReactNode;
  /** Slot at the bottom of the sidebar (e.g. sign out). */
  sidebarFooter?: ReactNode;
  /** 'kids' = bigger icons and text (student side, Grade 6). Default keeps the compact adult sizes. */
  variant?: 'default' | 'kids';
}

const matches = (pathname: string, to: string) => pathname === to || pathname.startsWith(`${to}/`);
function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.end ? pathname === item.to : matches(pathname, item.to)) return true;
  return (item.alsoActiveFor ?? []).some((p) => matches(pathname, p));
}

// Active indicator: a bar at the left edge that scales in (transform only). `before:` bar is decorative.
const linkBase =
  'group relative flex items-center rounded-md px-3 font-semibold outline-none transition-colors duration-fast ease-standard before:absolute before:inset-y-2 before:left-0 before:w-1 before:origin-center before:scale-y-0 before:rounded-full before:bg-brand-600 before:transition-transform before:duration-base before:ease-standard focus-visible:shadow-focus active:bg-brand-100';
const linkActive = 'bg-brand-50 text-brand-700 before:scale-y-100';

// Bottom nav item: a top bar scales in for the active item.
const linkSize = { default: 'min-h-[44px] gap-3 text-sm', kids: 'min-h-[56px] gap-4 text-lg' };
const bottomSize = { default: 'min-h-[56px] text-xs', kids: 'min-h-[64px] text-sm' };
const bottomBase =
  'group relative flex flex-col items-center justify-center gap-0.5 px-1 font-semibold outline-none transition-colors duration-fast ease-standard before:absolute before:inset-x-4 before:top-0 before:h-0.5 before:origin-center before:scale-x-0 before:rounded-full before:bg-brand-600 before:transition-transform before:duration-base before:ease-standard focus-visible:shadow-focus active:bg-brand-50';

export function AppShell({ navItems, brandKey = 'app.name', headerSlot, sidebarFooter, variant = 'default' }: LayoutProps) {
  const kids = variant === 'kids';
  const iconCls = kids ? 'h-7 w-7' : 'h-5 w-5';
  const { t } = useTranslation();
  const navLabel = t('layout.mainNavigation');
  const [moreOpen, setMoreOpen] = useState(false);
  const needsMore = navItems.length > 5;
  const primary = needsMore ? navItems.slice(0, 4) : navItems;
  const overflow = needsMore ? navItems.slice(4) : [];
  const { pathname } = useLocation();
  const overflowActive = overflow.some((i) => isNavItemActive(i, pathname));
  return (
    <div className="relative isolate min-h-screen bg-surface-muted text-ink">
      <SkipLink />
      <AmbientShapes />

      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line bg-surface md:flex">
        <div className="px-5 py-5 text-lg font-bold text-brand-700">{t(brandKey)}</div>
        <nav aria-label={navLabel} className="flex-1 overflow-y-auto px-3">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const { to, labelKey, icon: Icon } = item;
              const active = isNavItemActive(item, pathname);
              return (
                <li key={to}>
                  <Link to={to} aria-current={active ? 'page' : undefined} className={cn(linkBase, linkSize[variant], active ? linkActive : 'text-ink-soft hover:bg-surface-sunken hover:text-ink')}>
                    {Icon && <Icon aria-hidden className={cn('fx-nav-icon', iconCls)} />}
                    {t(labelKey)}
                  </Link>
                </li>
              );
            })}
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
          {primary.map((item) => {
            const { to, labelKey, icon: Icon } = item;
            const active = isNavItemActive(item, pathname);
            return (
              <li key={to} className="flex-1">
                <Link
                  to={to}
                  aria-current={active ? 'page' : undefined}
                  className={cn(bottomBase, bottomSize[variant], active ? 'text-brand-700 before:scale-x-100' : 'text-ink-soft hover:text-ink')}
                >
                  {Icon && <Icon aria-hidden className={cn('fx-nav-icon', iconCls)} />}
                  <span>{t(labelKey)}</span>
                </Link>
              </li>
            );
          })}
          {needsMore && (
            <li className="flex-1">
              <button
                type="button"
                aria-expanded={moreOpen}
                aria-haspopup="dialog"
                aria-current={overflowActive ? 'page' : undefined}
                onClick={() => setMoreOpen(true)}
                className={cn(bottomBase, bottomSize[variant], 'w-full', overflowActive ? 'text-brand-700 before:scale-x-100' : 'text-ink-soft hover:text-ink')}
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
            {overflow.map((item) => {
              const { to, labelKey, icon: Icon } = item;
              const active = isNavItemActive(item, pathname);
              return (
                <li key={to}>
                  <Link to={to} aria-current={active ? 'page' : undefined} onClick={() => setMoreOpen(false)} className={cn(linkBase, linkSize.default, active ? linkActive : 'text-ink-soft hover:bg-surface-sunken hover:text-ink')}>
                    {Icon && <Icon aria-hidden className="fx-nav-icon h-5 w-5" />}
                    {t(labelKey)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Modal>
      )}
    </div>
  );
}
