import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { Role } from '@/types';
import { useSessionStore } from '@/store';

const HOME: Record<Role, string> = { student: '/student', teacher: '/teacher', admin: '/admin' };
export const homeFor = (role: Role) => HOME[role];

/** Redirects signed-out visitors to /login and users with the wrong role to their own home. */
export function RequireRole({ role }: { role: Role }) {
  const user = useSessionStore((s) => s.user);
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.role !== role) return <Navigate to={HOME[user.role]} replace />;
  return <Outlet />;
}

export function RedirectHome() {
  const user = useSessionStore((s) => s.user);
  return <Navigate to={user ? HOME[user.role] : '/login'} replace />;
}

/** Moves focus to the page <h1> after each route change (keyboard / screen reader users). */
export function RouteFocus() {
  const { pathname } = useLocation();
  useEffect(() => {
    const h1 = document.querySelector<HTMLElement>('main h1');
    if (h1) {
      if (!h1.hasAttribute('tabindex')) h1.setAttribute('tabindex', '-1');
      h1.focus({ preventScroll: false });
    }
  }, [pathname]);
  return null;
}
