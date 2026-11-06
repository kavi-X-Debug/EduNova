import type { RouteObject } from 'react-router-dom';

/** Relative to /student. Pages load lazily through the router's `lazy` option. */
export const pathRoutes: RouteObject[] = [
  { path: 'path', lazy: async () => ({ Component: (await import('./PathPage')).default }) },
];
