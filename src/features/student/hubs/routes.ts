import type { RouteObject } from 'react-router-dom';

/** Relative to /student: the new Learn, Play and Me hubs (the old pages keep their own routes). */
export const hubRoutes: RouteObject[] = [
  { path: 'learn', lazy: () => import('./LearnHubPage').then((m) => ({ Component: m.default })) },
  { path: 'play', lazy: () => import('./PlayHubPage').then((m) => ({ Component: m.default })) },
  { path: 'me', lazy: () => import('./MePage').then((m) => ({ Component: m.default })) },
];
