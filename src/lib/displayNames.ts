import type { TFunction } from 'i18next';
import type { ClassSummary, CurriculumDoc } from '@/types';

/**
 * Display helpers for service data that carries user-visible names.
 * Services return keys/parts, never pre-rendered English; the UI renders them with t().
 * Fallbacks (`name`, `title`) are for real backends that send plain text.
 */

/** "Grade 8A" in the current language (grade + section letter). */
export function classLabel(c: Pick<ClassSummary, 'name' | 'grade' | 'section'>, t: TFunction): string {
  return c.section ? (t('common.classLabel', { grade: c.grade, section: c.section }) as string) : c.name;
}

/** Curriculum document title in the current language. */
export function docTitle(d: Pick<CurriculumDoc, 'title' | 'titleKey'>, t: TFunction): string {
  return d.titleKey ? (t(d.titleKey, { defaultValue: d.title }) as string) : d.title;
}
