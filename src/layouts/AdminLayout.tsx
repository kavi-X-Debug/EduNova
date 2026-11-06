import { AppShell, type LayoutProps } from './AppShell';

/** Pass nav items with keys like nav.admin.users. */
export function AdminLayout(props: LayoutProps) {
  return <AppShell {...props} />;
}
