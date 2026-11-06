import type { RouteObject } from 'react-router-dom';

/** Rendered inside StudentLayout (mounted at /student). */
export const diagnosticRoutes: RouteObject[] = [
  { path: 'diagnostic', lazy: () => import('./DiagnosticPage').then((m) => ({ Component: m.default })) },
];
