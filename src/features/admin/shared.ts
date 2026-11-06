import { useTranslation } from 'react-i18next';
import { useLocale } from '@/i18n';
import type { CurriculumDoc, Role } from '@/types';

export type Status = CurriculumDoc['status'];
export const STATUSES: Status[] = ['draft', 'in_review', 'published'];
export const ROLES: Role[] = ['student', 'teacher', 'admin'];

/** English fallbacks for keys not yet in the locale files (listed in docs/REQUESTS.md for Agent C). */
const EN: Record<string, string> = {
  'admin.overview.roles.title': 'People by role',
  'admin.overview.roles.summary': '{{students}} students, {{teachers}} teachers and {{admins}} administrators.',
  'admin.overview.curriculum.title': 'Curriculum status',
  'admin.overview.curriculum.summary': '{{draft}} in draft, {{review}} in review and {{published}} published.',
  'admin.overview.curriculum.docs': 'Documents',
  'admin.overview.recent.title': 'Recent activity',
  'admin.overview.recent.viewAll': 'View full audit log',
  'admin.users.search': 'Search by name or email',
  'admin.users.filter.role': 'Role',
  'admin.users.filter.all': 'All roles',
  'admin.users.showing': 'Showing {{shown}} of {{total}} users.',
  'admin.users.emptyFiltered': 'No users match your search or role filter.',
  'admin.users.clearFilters': 'Clear filters',
  'admin.curriculum.statusFor': 'Status for {{title}}',
  'admin.curriculum.publish.title': 'Publish this document?',
  'admin.curriculum.publish.body': '"{{title}}" will become visible to students and teachers.',
  'admin.curriculum.publish.confirm': 'Publish',
  'admin.curriculum.toast.success': '"{{title}}" is now {{status}}.',
  'admin.curriculum.toast.error': 'Could not update "{{title}}". The change was undone.',
  'admin.curriculum.summary': '{{draft}} in draft, {{review}} in review and {{published}} published.',
  'admin.curriculum.saving': 'Saving',
  'admin.audit.readOnly': 'This log is read-only.',
  'admin.audit.filter.label': 'Action type',
  'admin.audit.filter.all': 'All actions',
  'admin.audit.group.user': 'Users',
  'admin.audit.group.curriculum': 'Curriculum',
  'admin.audit.group.class': 'Classes',
  'admin.audit.group.export': 'Exports',
  'admin.audit.group.settings': 'Settings',
  'admin.audit.showing': 'Showing {{shown}} of {{total}} events.',
  'admin.audit.emptyFiltered': 'No events match this filter.',
  'admin.audit.actor.unknown': 'Unknown user',
  'admin.audit.action.unknown': 'Other action ({{code}})',
  'admin.audit.action.user.signIn': 'Signed in',
  'admin.audit.action.user.roleChange': 'Changed a user role',
  'admin.audit.action.user.invite': 'Invited a user',
  'admin.audit.action.curriculum.update': 'Updated a curriculum document',
  'admin.audit.action.curriculum.publish': 'Published a curriculum document',
  'admin.audit.action.curriculum.published': 'Published a curriculum document',
  'admin.audit.action.curriculum.draft': 'Moved a curriculum document to draft',
  'admin.audit.action.curriculum.in_review': 'Sent a curriculum document for review',
  'admin.audit.action.curriculum.submitForReview': 'Sent a curriculum document for review',
  'admin.audit.action.curriculum.archive': 'Archived a curriculum document',
  'admin.audit.action.class.create': 'Created a class',
  'admin.audit.action.export.classReport': 'Exported a class report',
  'admin.audit.action.settings.localeDefault': 'Changed the default language',
  'admin.audit.target.session': 'Current session',
};

export type AdminT = (key: string, opts?: Record<string, unknown>) => string;

/** Translator that falls back to English text when a key is not yet in the locale files. */
export function useAdminT(): AdminT {
  const { t } = useTranslation();
  return (key, opts) => t(key, { defaultValue: EN[key] ?? key, ...opts }) as string;
}

export function useAdminLocale() {
  return useLocale().locale;
}

export const auditGroup = (action: string) => action.split('.')[0];
export const AUDIT_GROUPS = ['user', 'curriculum', 'class', 'export', 'settings'] as const;

export function auditActionLabel(t: AdminT, code: string): string {
  const key = `admin.audit.action.${code}`;
  const label = t(key);
  return label === key ? t('admin.audit.action.unknown', { code }) : label;
}
