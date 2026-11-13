import type { CurriculumDoc, Question } from '@/types';
import { daysAgo, hashString } from './rng';

interface Q {
  id: string;
  conceptId: string;
  type: Question['type'];
  difficulty: Question['difficulty'];
  text: string;
  options?: string[];
  /** mcq: option index; short/numeric: accepted answer (case-insensitive) */
  answer: string | number;
}

const Q_RAW: Q[] = [
  { id: 'q-m6-frac', conceptId: 'm6-frac', type: 'mcq', difficulty: 1, text: 'What is 1/2 + 1/4?', options: ['3/4', '2/6', '1/6', '2/4'], answer: 0 },
  { id: 'q-m6-dec', conceptId: 'm6-dec', type: 'numeric', difficulty: 1, text: 'Write 3/4 as a decimal.', answer: '0.75' },
  { id: 'q-m7-int', conceptId: 'm7-int', type: 'mcq', difficulty: 1, text: 'What is -3 + 8?', options: ['5', '-5', '11', '-11'], answer: 0 },
  { id: 'q-m7-ratio', conceptId: 'm7-ratio', type: 'numeric', difficulty: 2, text: 'Rs. 600 is shared in the ratio 1 : 2. How many rupees is the larger share?', answer: '400' },
  { id: 'q-m8-alg', conceptId: 'm8-alg', type: 'mcq', difficulty: 2, text: 'Simplify 3x + 2x - x.', options: ['4x', '5x', '6x', '3x'], answer: 0 },
  { id: 'q-m8-eq', conceptId: 'm8-eq', type: 'numeric', difficulty: 2, text: 'Solve 2x + 3 = 11. What is x?', answer: '4' },
  { id: 'q-m9-pyth', conceptId: 'm9-pyth', type: 'numeric', difficulty: 3, text: 'A right-angled triangle has shorter sides 3 cm and 4 cm. How long is the hypotenuse in cm?', answer: '5' },
  { id: 'q-m10-quad', conceptId: 'm10-quad', type: 'mcq', difficulty: 3, text: 'What are the roots of x² - 5x + 6 = 0?', options: ['2 and 3', '-2 and -3', '1 and 6', '-1 and -6'], answer: 0 },
  { id: 'q-s6-matter', conceptId: 's6-matter', type: 'mcq', difficulty: 1, text: 'Which of these is a state of matter?', options: ['Liquid', 'Energy', 'Heat', 'Light'], answer: 0 },
  { id: 'q-s7-cells', conceptId: 's7-cells', type: 'mcq', difficulty: 1, text: 'Which part of a cell controls its activities?', options: ['Nucleus', 'Cell wall', 'Vacuole', 'Chloroplast'], answer: 0 },
  { id: 'q-s8-force', conceptId: 's8-force', type: 'mcq', difficulty: 2, text: 'What is the SI unit of force?', options: ['Newton', 'Joule', 'Watt', 'Pascal'], answer: 0 },
  { id: 'q-s9-atoms', conceptId: 's9-atoms', type: 'mcq', difficulty: 2, text: 'Which particle in an atom has a negative charge?', options: ['Electron', 'Proton', 'Neutron', 'Nucleus'], answer: 0 },
  { id: 'q-en6-tense', conceptId: 'en6-tense', type: 'short', difficulty: 1, text: 'Write the simple past tense of the verb "go".', answer: 'went' },
  { id: 'q-en8-essay', conceptId: 'en8-essay', type: 'mcq', difficulty: 2, text: 'What do we call the sentence that states the main idea of a paragraph?', options: ['Topic sentence', 'Closing sentence', 'Title', 'Example'], answer: 0 },
  { id: 'q-ict6-comp', conceptId: 'ict6-comp', type: 'mcq', difficulty: 1, text: 'Which of these is an input device?', options: ['Keyboard', 'Monitor', 'Speaker', 'Printer'], answer: 0 },
  { id: 'q-ict8-algo', conceptId: 'ict8-algo', type: 'mcq', difficulty: 2, text: 'Which flowchart symbol is used for a decision?', options: ['Diamond', 'Rectangle', 'Oval', 'Arrow'], answer: 0 },
];

/** Rotate options by a stable per-question amount so the right answer is not always first. */
function shown(q: Q): { options?: string[]; correctIndex?: number } {
  if (!q.options) return {};
  const n = q.options.length;
  const r = hashString(q.id) % n;
  return {
    options: q.options.map((_, i) => q.options![(i + r) % n]),
    correctIndex: (Number(q.answer) - r + n) % n,
  };
}

export const QUESTIONS: Question[] = Q_RAW.map((q) => ({
  id: q.id,
  conceptId: q.conceptId,
  type: q.type,
  difficulty: q.difficulty,
  promptKey: `diagnostic.${q.id}.prompt`,
  // options are i18n keys (English text in QUESTION_EN)
  options: shown(q).options?.map((_, i) => `diagnostic.${q.id}.opt${i}`),
}));

export const QUESTION_EN: Record<string, string> = {};
for (const q of Q_RAW) {
  QUESTION_EN[`diagnostic.${q.id}.prompt`] = q.text;
  shown(q).options?.forEach((o, i) => (QUESTION_EN[`diagnostic.${q.id}.opt${i}`] = o));
}

/** Server-side answer check (the client never receives the key). */
export function isCorrect(questionId: string, response: string): boolean {
  const q = Q_RAW.find((x) => x.id === questionId);
  if (!q) return false;
  const r = response.trim().toLowerCase();
  if (q.type === 'mcq') {
    const idx = shown(q).correctIndex;
    return r === String(idx) || r === `diagnostic.${q.id}.opt${idx}`.toLowerCase();
  }
  return r === String(q.answer).toLowerCase();
}

// ---------- Quests ----------
export const QUEST_TEMPLATES = [
  {
    id: 'quest-fractions-week',
    titleKey: 'quest.fractionsWeek.title',
    xp: 120,
    missions: [
      { id: 'mis-frac-1', titleKey: 'mission.practice5', target: 5 },
      { id: 'mis-frac-2', titleKey: 'mission.oneQuiz', target: 1 },
      { id: 'mis-frac-3', titleKey: 'mission.askTutor', target: 2 },
    ],
  },
  {
    id: 'quest-reading-streak',
    titleKey: 'quest.readingStreak.title',
    xp: 80,
    missions: [
      { id: 'mis-read-1', titleKey: 'mission.read15', target: 3 },
      { id: 'mis-read-2', titleKey: 'mission.vocab', target: 10 },
    ],
  },
  {
    id: 'quest-revision-hero',
    titleKey: 'quest.revisionHero.title',
    xp: 150,
    missions: [
      { id: 'mis-rev-1', titleKey: 'mission.revise3', target: 3 },
      { id: 'mis-rev-2', titleKey: 'mission.reviseOnTime', target: 5 },
    ],
  },
] as const;

export const QUEST_EN: Record<string, string> = {
  'quest.fractionsWeek.title': 'Fractions week',
  'quest.readingStreak.title': 'Reading streak',
  'quest.revisionHero.title': 'Revision team goal',
  'mission.practice5': 'Practise 5 questions',
  'mission.oneQuiz': 'Finish one short quiz',
  'mission.askTutor': 'Ask the tutor 2 questions',
  'mission.read15': 'Read for 15 minutes (3 days)',
  'mission.vocab': 'Learn 10 new words',
  'mission.revise3': 'Revise 3 topics',
  'mission.reviseOnTime': 'Revise 5 topics on their due day',
};

// ---------- Exam reports / next steps ----------
export const EXAMS = [
  { id: 'exam-term1', daysAgo: 150 },
  { id: 'exam-term2', daysAgo: 70 },
  { id: 'exam-unit-test', daysAgo: 12 },
];

export const NEXT_STEP_EN: Record<string, string> = {
  'exam.next.reviewPrereq': 'Revisit the earlier topics this builds on before moving ahead.',
  'exam.next.practiceMore': 'Do a few more practice questions on topics marked "building".',
  'exam.next.keepGoing': 'You are progressing well. Keep your revision schedule going.',
  'exam.next.challenge': 'Try a harder set of questions to stretch yourself.',
  'exam.next.askTutor': 'Ask the tutor to explain any step that felt unclear.',
};

// ---------- Teacher wellbeing prompts (private, gentle, never diagnoses) ----------
export const WELLBEING_EN: Record<string, string> = {
  'wellbeing.prompt.quietCheckIn': 'Consider a quiet check-in; this student has been less active than usual.',
  'wellbeing.prompt.noticeEffort': 'Consider noticing their recent effort; a short word of encouragement may help.',
  'wellbeing.prompt.offerSupport': 'Consider offering a little extra support on recent topics.',
  'wellbeing.prompt.askHowFeeling': 'Consider asking, privately, how the workload feels right now.',
};
export const WELLBEING_KEYS = Object.keys(WELLBEING_EN);

// Tutor knowledge lives in ./tutorContent.ts (answers and source titles are per-locale).

// ---------- Curriculum ----------
export const CURRICULUM: CurriculumDoc[] = [
  ['cur-01', 'Grade 6 Mathematics: Fractions and decimals', 'maths', 6, 'published', 40],
  ['cur-02', 'Grade 7 Mathematics: Ratio and proportion', 'maths', 7, 'published', 33],
  ['cur-03', 'Grade 8 Mathematics: Algebra and linear equations', 'maths', 8, 'in_review', 5],
  ['cur-04', 'Grade 9 Mathematics: Pythagoras theorem', 'maths', 9, 'published', 21],
  ['cur-05', 'Grade 10 Mathematics: Quadratic equations', 'maths', 10, 'draft', 2],
  ['cur-06', 'Grade 11 Mathematics: Introduction to trigonometry', 'maths', 11, 'draft', 9],
  ['cur-07', 'Grade 6 Science: States of matter', 'science', 6, 'published', 52],
  ['cur-08', 'Grade 7 Science: Cells and living things', 'science', 7, 'published', 47],
  ['cur-09', 'Grade 8 Science: Forces and motion', 'science', 8, 'in_review', 8],
  ['cur-10', 'Grade 10 Science: Electric circuits', 'science', 10, 'in_review', 3],
  ['cur-11', 'Grade 11 Science: Heredity', 'science', 11, 'draft', 14],
  ['cur-12', 'Grade 7 Sinhala: Word forms', 'sinhala', 7, 'published', 60],
  ['cur-13', 'Grade 9 Sinhala: Reading comprehension', 'sinhala', 9, 'in_review', 11],
  ['cur-14', 'Grade 6 English: Tenses', 'english', 6, 'published', 38],
  ['cur-15', 'Grade 8 English: Essay writing', 'english', 8, 'draft', 6],
  ['cur-16', 'Grade 10 English: Comprehension strategies', 'english', 10, 'published', 29],
  ['cur-17', 'Grade 8 ICT: Algorithms and flowcharts', 'ict', 8, 'published', 18],
  ['cur-18', 'Grade 10 ICT: Introduction to programming', 'ict', 10, 'in_review', 4],
].map(([id, title, subject, grade, status, d]) => ({
  id: id as string,
  title: title as string,
  titleKey: `curriculum.doc.${id as string}`,
  subject: subject as string,
  grade: grade as number,
  status: status as CurriculumDoc['status'],
  updatedAt: daysAgo(d as number),
}));
