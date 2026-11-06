import type { TFunction } from 'i18next';
import { useLocale } from '@/i18n';
import type { CurriculumDoc, Role } from '@/types';

export type Status = CurriculumDoc['status'];
export const STATUSES: Status[] = ['draft', 'in_review', 'published'];
export const ROLES: Role[] = ['student', 'teacher', 'admin'];

export type AdminT = TFunction;

export function useAdminLocale() {
  return useLocale().locale;
}

export const auditGroup = (action: string) => action.split('.')[0];
export const AUDIT_GROUPS = ['user', 'curriculum', 'class', 'export', 'settings'] as const;

export function auditActionLabel(t: AdminT, code: string): string {
  const key = `admin.audit.action.${code}`;
  const label = t(key, { defaultValue: '' }) as string;
  return label === '' ? (t('admin.audit.action.unknown', { code }) as string) : label;
}
