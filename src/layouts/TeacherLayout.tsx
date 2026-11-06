import { AppShell, type LayoutProps } from './AppShell';

/** Pass nav items with keys like nav.teacher.classes. */
export function TeacherLayout(props: LayoutProps) {
  return <AppShell {...props} />;
}
