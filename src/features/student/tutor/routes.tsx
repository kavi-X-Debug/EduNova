import type { RouteObject } from 'react-router-dom';

/** Relative to /student. Pages load lazily through the router's `lazy` option. */
export const tutorRoutes: RouteObject[] = [
  { path: 'tutor', lazy: async () => ({ Component: (await import('./TutorPage')).default }) },
];
