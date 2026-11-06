import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Keys this feature needs that are not yet in src/i18n/locales (requested from Agent C in docs/REQUESTS.md).
 * English text doubles as `defaultValue` so the UI is readable until si/ta are added.
 */
export const TEACHER_NEW_KEYS = {
  'teacher.overview.chart.summary': '{{name}}: {{building}} building, {{developing}} developing, {{secure}} secure, {{strong}} strong.',
  'teacher.overview.weak.title': 'Topics to revisit',
  'teacher.overview.weak.none': 'No topics flagged right now.',
  'teacher.overview.openClass': 'Open class',
  'teacher.overview.openClassNamed': 'Open {{name}}',
  'teacher.class.back': 'Back to classes',
  'teacher.class.search': 'Search students',
  'teacher.class.band.all': 'All readiness bands',
  'teacher.class.noMatch': 'No students match your search or filter.',
  'teacher.class.clearFilters': 'Clear filters',
  'teacher.class.sortColumn': 'Sort by {{column}}',
  'teacher.class.sort.name': 'Name',
  'teacher.class.sort.band': 'Readiness',
  'teacher.class.sort.lastActive': 'Last active',
  'teacher.class.shown_one': '{{count}} student shown',
  'teacher.class.shown_other': '{{count}} students shown',
  'teacher.class.error': 'We could not load this class.',
  'teacher.wellbeing.private': 'Private to you',
  'teacher.wellbeing.notDiagnosis': 'A gentle prompt for a conversation. It is not a diagnosis or a score.',
  'teacher.wellbeing.about': 'About {{name}}',
  'teacher.student.back': 'Back to class',
  'teacher.student.notFound': 'We could not find this student.',
  'teacher.student.concepts.title': 'Readiness by topic',
  'teacher.student.concepts.caption': 'Readiness by topic for {{name}}',
  'teacher.student.concepts.empty': 'No topic information is available yet.',
  'teacher.student.col.concept': 'Topic',
  'teacher.student.col.updated': 'Updated',
} as const;

/** Translate function accepting existing keys plus this feature's new keys. */
export type TT = (key: string, options?: Record<string, unknown>) => string;

export function useTT(): TT {
  const { t } = useTranslation();
  return useCallback(
    (key, options) => {
      const fallback = (TEACHER_NEW_KEYS as Record<string, string>)[key];
      const o = fallback === undefined ? options : { defaultValue: fallback, ...options };
      return String(t(key, o));
    },
    [t],
  );
}
