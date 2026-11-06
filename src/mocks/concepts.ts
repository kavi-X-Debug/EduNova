import type { Concept } from '@/types';

export const SUBJECTS = ['maths', 'science', 'sinhala', 'english', 'ict'] as const;

type C = [id: string, subject: string, grade: number, title: string, prereqs: string[]];

/** id, subject, grade, English title, prerequisites */
const RAW: C[] = [
  ['m6-frac', 'maths', 6, 'Fractions', []],
  ['m6-dec', 'maths', 6, 'Decimals', ['m6-frac']],
  ['m7-int', 'maths', 7, 'Integers', []],
  ['m7-ratio', 'maths', 7, 'Ratio and proportion', ['m6-frac']],
  ['m8-alg', 'maths', 8, 'Algebraic expressions', ['m7-int']],
  ['m8-eq', 'maths', 8, 'Linear equations', ['m8-alg']],
  ['m9-pyth', 'maths', 9, 'Pythagoras theorem', ['m8-eq']],
  ['m10-quad', 'maths', 10, 'Quadratic equations', ['m8-eq']],
  ['m11-trig', 'maths', 11, 'Trigonometry', ['m9-pyth']],
  ['s6-matter', 'science', 6, 'States of matter', []],
  ['s7-cells', 'science', 7, 'Cells and living things', []],
  ['s8-force', 'science', 8, 'Forces and motion', []],
  ['s9-atoms', 'science', 9, 'Atoms and elements', ['s6-matter']],
  ['s10-elec', 'science', 10, 'Electric circuits', ['s8-force']],
  ['s11-gen', 'science', 11, 'Heredity and genetics', ['s7-cells']],
  ['si7-gram', 'sinhala', 7, 'Sinhala grammar: word forms', []],
  ['si9-comp', 'sinhala', 9, 'Sinhala reading comprehension', ['si7-gram']],
  ['en6-tense', 'english', 6, 'English tenses', []],
  ['en8-essay', 'english', 8, 'Paragraph and essay writing', ['en6-tense']],
  ['en10-comp', 'english', 10, 'English comprehension', ['en8-essay']],
  ['ict6-comp', 'ict', 6, 'Parts of a computer', []],
  ['ict8-algo', 'ict', 8, 'Algorithms and flowcharts', ['ict6-comp']],
  ['ict10-prog', 'ict', 10, 'Introduction to programming', ['ict8-algo']],
];

export const CONCEPTS: Concept[] = RAW.map(([id, subject, grade, , prerequisiteIds]) => ({
  id,
  subject,
  grade,
  titleKey: `concept.${id}`,
  prerequisiteIds,
}));

/** English text for concept titleKeys. */
export const CONCEPT_EN: Record<string, string> = Object.fromEntries(
  RAW.map(([id, , , title]) => [`concept.${id}`, title]),
);

export const SUBJECT_EN: Record<string, string> = {
  'subject.maths': 'Mathematics',
  'subject.science': 'Science',
  'subject.sinhala': 'Sinhala',
  'subject.english': 'English',
  'subject.ict': 'ICT',
};
