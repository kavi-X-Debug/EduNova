import type { RouteObject } from 'react-router-dom';

/** Relative to /student: the Games library and the full-page player. */
export const gamesRoutes: RouteObject[] = [
  { path: 'games', lazy: () => import('./GamesPage').then((m) => ({ Component: m.default })) },
  { path: 'games/:gameId', lazy: () => import('./GamePage').then((m) => ({ Component: m.default })) },
];
