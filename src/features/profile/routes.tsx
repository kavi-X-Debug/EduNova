import type { RouteObject } from 'react-router-dom';

/** Relative `profile` route, mounted under /student, /teacher and /admin (same page for every role). */
export const profileRoutes: RouteObject[] = [
  { path: 'profile', lazy: async () => ({ Component: (await import('./ProfilePage')).default }) },
];
