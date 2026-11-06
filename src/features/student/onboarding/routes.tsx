import type { RouteObject } from 'react-router-dom';

/** Rendered inside AuthLayout. */
export const authRoutes: RouteObject[] = [
  { path: 'login', lazy: () => import('./LoginPage').then((m) => ({ Component: m.default })) },
  { path: 'onboarding', lazy: () => import('./OnboardingPage').then((m) => ({ Component: m.default })) },
];
