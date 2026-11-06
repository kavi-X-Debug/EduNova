import type { RouteObject } from 'react-router-dom';

/** Relative paths; mount under the AdminLayout route at `/admin`. Pages are lazy-loaded. */
export const adminRoutes: RouteObject[] = [
  { index: true, lazy: async () => ({ Component: (await import('./OverviewPage')).default }) },
  { path: 'users', lazy: async () => ({ Component: (await import('./UsersPage')).default }) },
  { path: 'curriculum', lazy: async () => ({ Component: (await import('./CurriculumPage')).default }) },
  { path: 'audit', lazy: async () => ({ Component: (await import('./AuditPage')).default }) },
];
