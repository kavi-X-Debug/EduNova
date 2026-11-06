import type { RouteObject } from 'react-router-dom';

/** Relative to /student. */
export const revisionRoutes: RouteObject[] = [
  {
    path: 'revision',
    lazy: async () => ({ Component: (await import('./RevisionPage')).default }),
  },
];
