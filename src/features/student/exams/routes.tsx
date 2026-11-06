import type { RouteObject } from 'react-router-dom';

/** Relative to /student. Pages load lazily through the router's `lazy` option. */
export const examsRoutes: RouteObject[] = [
  { path: 'exams', lazy: async () => ({ Component: (await import('./ExamsPage')).default }) },
  { path: 'exams/:id', lazy: async () => ({ Component: (await import('./ExamDetailPage')).default }) },
];
