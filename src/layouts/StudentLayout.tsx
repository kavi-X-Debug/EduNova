import { AppShell, type LayoutProps } from './AppShell';

/** Sidebar at >=834px, bottom nav below. Pass nav items with keys like nav.student.dashboard. */
export function StudentLayout(props: LayoutProps) {
  return <AppShell {...props} />;
}
