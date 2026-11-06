import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { homeFor } from './home';
import type { Role } from '@/types';
import { useSessionStore } from '@/store';

/** Redirects signed-out visitors to /login and users with the wrong role to their own home. */
export function RequireRole({ role }: { role: Role }) {
  const user = useSessionStore((s) => s.user);
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.role !== role) return <Navigate to={homeFor(user.role)} replace />;
  return <Outlet />;
}

export function RedirectHome() {
  const user = useSessionStore((s) => s.user);
  return <Navigate to={user ? homeFor(user.role) : '/login'} replace />;
}
