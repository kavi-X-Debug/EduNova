import type { TFunction } from 'i18next';
import type { ClassSummary, CurriculumDoc, Locale } from '@/types';

/**
 * Display helpers for service data that carries user-visible names.
 * Services return keys/parts, never pre-rendered English; the UI renders them with t().
 * Fallbacks (`name`, `title`) are for real backends that send plain text.
 */

/** "Grade 8A" in the current language (grade + section letter). */
export function classLabel(c: Pick<ClassSummary, 'name' | 'grade' | 'section'>, t: TFunction): string {
  return c.section ? (t('common.classLabel', { grade: c.grade, section: c.section }) as string) : c.name;
}

/** Locale key for a textbook unit/chapter name, e.g. "9. Fractions" -> "unit.9-fractions". */
export function unitKey(unit: string): string {
  return `unit.${unit.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

/** Textbook unit name in the current language; names with no translation (printed book titles) stay as they are. */
export function unitLabel(unit: string, t: TFunction): string {
  return t(unitKey(unit), { defaultValue: unit }) as string;
}

/** Curriculum document title in the current language. */
export function docTitle(d: Pick<CurriculumDoc, 'title' | 'titleKey'>, t: TFunction): string {
  return d.titleKey ? (t(d.titleKey, { defaultValue: d.title }) as string) : d.title;
}

type L3 = Record<Locale, string>;
const REF_WORDS: [RegExp, L3][] = [
  [/Part 1,\s*/g, { en: '', si: 'I කොටස, ', ta: 'பகுதி I, ' }],
  [/Part 2,\s*/g, { en: '', si: 'II කොටස, ', ta: 'பகுதி II, ' }],
  [/Pupil's Book/g, { en: '', si: 'ශිෂ්‍ය පොත', ta: 'மாணவர் புத்தகம்' }],
  [/Reading Book/g, { en: '', si: 'කියවීම් පොත', ta: 'வாசிப்பு நூல்' }],
  [/Workbook Activities/g, { en: '', si: 'වැඩපොත් ක්‍රියාකාරකම්', ta: 'வேலைப்புத்தக செயற்பாடுகள்' }],
  [/Workbook/g, { en: '', si: 'වැඩපොත', ta: 'வேலைப்புத்தகம்' }],
  [/pp\./g, { en: '', si: 'පිටු', ta: 'பக்.' }],
];

/** Page reference such as "Part 1, pp. 112-134" with the words localised (numbers untouched). */
export function localiseRef(ref: string, locale: Locale): string {
  if (locale === 'en') return ref;
  let out = ref;
  for (const [re, rep] of REF_WORDS) out = out.replace(re, rep[locale]);
  return out;
}
