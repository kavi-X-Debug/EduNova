import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { BarChart3, ClipboardList, LayoutDashboard, MessagesSquare, Route as RouteIcon, ScrollText, Swords, Users, RefreshCw, Stethoscope, Library, Award, UserCircle } from 'lucide-react';
import { AdminLayout, AuthLayout, StudentLayout, TeacherLayout, type NavItem } from '@/layouts';
import { authRoutes } from '@/features/student/onboarding/routes';
import { dashboardRoutes } from '@/features/student/dashboard/routes';
import { diagnosticRoutes } from '@/features/student/diagnostic/routes';
import { pathRoutes } from '@/features/student/path/routes';
import { tutorRoutes } from '@/features/student/tutor/routes';
import { examsRoutes } from '@/features/student/exams/routes';
import { questsRoutes } from '@/features/student/quests/routes';
import { revisionRoutes } from '@/features/student/revision/routes';
import { badgesRoutes } from '@/features/student/badges/routes';
import { profileRoutes } from '@/features/profile/routes';
import { teacherRoutes } from '@/features/teacher/routes';
import { adminRoutes } from '@/features/admin/routes';
import { HeaderSlot } from './HeaderSlot';
import { RedirectHome, RequireRole } from './guards';
import { AppLoading, Root } from './Root';

const studentNav: NavItem[] = [
  { to: '/student', labelKey: 'nav.student.dashboard', icon: LayoutDashboard, end: true },
  { to: '/student/path', labelKey: 'nav.student.path', icon: RouteIcon },
  { to: '/student/tutor', labelKey: 'nav.student.tutor', icon: MessagesSquare },
  { to: '/student/quests', labelKey: 'nav.student.quests', icon: Swords },
  { to: '/student/revision', labelKey: 'nav.student.revision', icon: RefreshCw },
  { to: '/student/exams', labelKey: 'nav.student.exams', icon: ClipboardList },
  { to: '/student/diagnostic', labelKey: 'nav.student.diagnostic', icon: Stethoscope },
  { to: '/student/badges', labelKey: 'nav.student.badges', icon: Award },
  { to: '/student/profile', labelKey: 'nav.account.profile', icon: UserCircle },
];
const teacherNav: NavItem[] = [
  { to: '/teacher', labelKey: 'nav.teacher.overview', icon: BarChart3, end: true },
  { to: '/teacher/profile', labelKey: 'nav.account.profile', icon: UserCircle },
];
const adminNav: NavItem[] = [
  { to: '/admin', labelKey: 'nav.admin.overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', labelKey: 'nav.admin.users', icon: Users },
  { to: '/admin/curriculum', labelKey: 'nav.admin.curriculum', icon: Library },
  { to: '/admin/audit', labelKey: 'nav.admin.audit', icon: ScrollText },
  { to: '/admin/profile', labelKey: 'nav.account.profile', icon: UserCircle },
];

export const routes: RouteObject[] = [
  {
    element: <Root />,
    HydrateFallback: AppLoading,
    children: [
      { path: '/', element: <RedirectHome /> },
      { element: <AuthLayout headerSlot={<HeaderSlot />} />, children: authRoutes },
      {
        element: <RequireRole role="student" />,
        children: [
          {
            path: '/student',
            element: <StudentLayout navItems={studentNav} headerSlot={<HeaderSlot />} />,
            children: [
              ...dashboardRoutes,
              ...diagnosticRoutes,
              ...pathRoutes,
              ...tutorRoutes,
              ...examsRoutes,
              ...questsRoutes,
              ...revisionRoutes,
              ...badgesRoutes,
              ...profileRoutes,
            ],
          },
        ],
      },
      {
        element: <RequireRole role="teacher" />,
        children: [
          {
            path: '/teacher',
            element: <TeacherLayout navItems={teacherNav} headerSlot={<HeaderSlot />} />,
            children: [...teacherRoutes, ...profileRoutes],
          },
        ],
      },
      {
        element: <RequireRole role="admin" />,
        children: [
          {
            path: '/admin',
            element: <AdminLayout navItems={adminNav} headerSlot={<HeaderSlot />} />,
            children: [...adminRoutes, ...profileRoutes],
          },
        ],
      },
      { path: '*', element: <RedirectHome /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
