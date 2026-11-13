import type { RouteObject } from 'react-router-dom';

/** Relative to /student. */
export const badgesRoutes: RouteObject[] = [
  { path: 'badges', lazy: async () => ({ Component: (await import('./BadgesPage')).default }) },
];
