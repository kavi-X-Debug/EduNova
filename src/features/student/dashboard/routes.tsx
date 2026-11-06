import type { RouteObject } from 'react-router-dom';

/** Rendered inside StudentLayout (mounted at /student): index route. */
export const dashboardRoutes: RouteObject[] = [
  { index: true, lazy: () => import('./DashboardPage').then((m) => ({ Component: m.default })) },
];
