import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { BarChart3, BookOpen, Gamepad2, House, LayoutDashboard, MessageCircleQuestionMark, ScrollText, UserCircle, UserRound, Users, Library } from 'lucide-react';
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
import { gamesRoutes } from '@/features/student/games/routes';
import { hubRoutes } from '@/features/student/hubs/routes';
import { TourHost } from '@/features/student/tour/WelcomeTour';
import { profileRoutes } from '@/features/profile/routes';
import { teacherRoutes } from '@/features/teacher/routes';
import { adminRoutes } from '@/features/admin/routes';
import { HeaderSlot } from './HeaderSlot';
import { RedirectHome, RequireRole } from './guards';
import { AppLoading, Root } from './Root';

/** Student nav: 5 big items, one short word each. Older pages stay routable and highlight their parent item. */
const studentNav: NavItem[] = [
  { to: '/student', labelKey: 'nav.kids.home', icon: House, end: true },
  { to: '/student/learn', labelKey: 'nav.kids.learn', icon: BookOpen, alsoActiveFor: ['/student/path', '/student/diagnostic', '/student/revision', '/student/exams'] },
  { to: '/student/tutor', labelKey: 'nav.kids.ask', icon: MessageCircleQuestionMark },
  { to: '/student/play', labelKey: 'nav.kids.play', icon: Gamepad2, alsoActiveFor: ['/student/quests', '/student/badges', '/student/games'] },
  { to: '/student/me', labelKey: 'nav.kids.me', icon: UserRound, alsoActiveFor: ['/student/profile'] },
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
            element: (
              <>
                <StudentLayout navItems={studentNav} headerSlot={<HeaderSlot />} />
                <TourHost />
              </>
            ),
            children: [
              ...dashboardRoutes,
              ...hubRoutes,
              ...gamesRoutes,
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
