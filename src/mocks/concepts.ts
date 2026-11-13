import type { Concept } from '@/types';
import { G6_CONCEPTS, type G6Concept } from './grade6.generated';

/** Subject ids, in display order. Match `subject` in curriculum/grade6/<subject>/path.json. */
export const SUBJECTS = ['maths', 'science', 'sinhala', 'english', 'ict'] as const;

/** Grade 6 MVP: every concept comes from the official Grade 6 learning paths. */
export const MVP_GRADE = 6;

/** Teaching order: subject (SUBJECTS order), then term, then textbook order. */
export const G6_ORDERED: G6Concept[] = SUBJECTS.flatMap((s) => G6_CONCEPTS.filter((c) => c.subject === s));

export const CONCEPTS: Concept[] = G6_ORDERED.map((c) => ({
  id: c.id,
  subject: c.subject,
  grade: MVP_GRADE,
  titleKey: `concept.${c.id}`,
  prerequisiteIds: c.prerequisiteIds,
  term: c.term,
  unit: c.unit,
  textbookRef: c.textbookRef,
}));

export const G6_BY_ID = new Map(G6_ORDERED.map((c) => [c.id, c]));

/** English text for concept titleKeys. */
export const CONCEPT_EN: Record<string, string> = Object.fromEntries(
  G6_ORDERED.map((c) => [`concept.${c.id}`, c.titleEn]),
);

export const SUBJECT_EN: Record<string, string> = {
  'subject.maths': 'Mathematics',
  'subject.science': 'Science',
  'subject.sinhala': 'Sinhala',
  'subject.english': 'English',
  'subject.ict': 'ICT',
};

/** Printed title of the main textbook per subject (for tutor source citations). */
const BOOK: Record<string, string> = {
  science: 'Science Grade 6',
  sinhala: 'සිංහල භාෂාව හා සාහිත්‍යය 6 ශ්‍රේණිය',
  english: "English Pupil's Book Grade 6",
  ict: 'ICT Grade 6 Reading Book',
};

/** A tutor source pointing at the real Grade 6 textbook unit and pages for a concept. */
export function textbookSource(conceptId: string): { title: string; ref: string } {
  const c = G6_BY_ID.get(conceptId);
  if (!c) return { title: 'Grade 6 textbook', ref: conceptId };
  if (c.subject === 'maths') {
    // "Part 1, pp. 112-134" -> "Mathematics Grade 6 Part I"
    const part = /Part 2/.test(c.textbookRef) ? 'II' : 'I';
    return { title: `Mathematics Grade 6 Part ${part}, ${c.unit}`, ref: c.textbookRef.replace(/^Part \d,\s*/, '') };
  }
  return { title: `${BOOK[c.subject]}, ${c.unit}`, ref: c.textbookRef };
}
