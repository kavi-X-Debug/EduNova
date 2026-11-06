import type { RouteObject } from 'react-router-dom';

/** Relative paths: the lead mounts these under `/teacher` inside TeacherLayout. */
export const teacherRoutes: RouteObject[] = [
  { index: true, lazy: async () => ({ Component: (await import('./pages/TeacherOverviewPage')).default }) },
  { path: 'classes/:id', lazy: async () => ({ Component: (await import('./pages/ClassPage')).default }) },
  { path: 'students/:id', lazy: async () => ({ Component: (await import('./pages/StudentPage')).default }) },
];
