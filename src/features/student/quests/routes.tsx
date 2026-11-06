import type { RouteObject } from 'react-router-dom';

/** Relative to /student. */
export const questsRoutes: RouteObject[] = [
  {
    path: 'quests',
    lazy: async () => ({ Component: (await import('./QuestsPage')).default }),
  },
];
