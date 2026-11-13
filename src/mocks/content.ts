import type { CurriculumDoc, Question } from '@/types';
import { daysAgo, hashString } from './rng';
import { MVP_GRADE } from './concepts';
import { G6_SOURCE_DOCS } from './grade6.generated';

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

/**
 * Grade 6 diagnostic items. Original, simple questions written for EduNova (not textbook exercises).
 * Each points at a Grade 6 concept id from curriculum/grade6/<subject>/path.json.
 * Locale text lives in src/i18n/locales/*.json under `diagnostic.<id>.*` (options in shown order).
 */
const Q_RAW: Q[] = [
  // Mathematics
  { id: 'q-m6-place-value', conceptId: 'm6-place-value', type: 'mcq', difficulty: 1, text: 'What is the value of the digit 7 in the number 4 735?', options: ['700', '7', '70', '7 000'], answer: 0 },
  { id: 'q-m6-time', conceptId: 'm6-time', type: 'numeric', difficulty: 1, text: 'How many minutes are there in 2 hours?', answer: '120' },
  { id: 'q-m6-fractions', conceptId: 'm6-fractions', type: 'mcq', difficulty: 2, text: 'Which fraction is equal to 1/2?', options: ['3/6', '2/3', '1/3', '2/5'], answer: 0 },
  { id: 'q-m6-factors-multiples', conceptId: 'm6-factors-multiples', type: 'numeric', difficulty: 2, text: 'What is the smallest number that is a multiple of both 4 and 6?', answer: '12' },
  { id: 'q-m6-decimals', conceptId: 'm6-decimals', type: 'numeric', difficulty: 3, text: 'Write three tenths as a decimal number.', answer: '0.3' },
  // Science
  { id: 'q-s6-living-characteristics', conceptId: 's6-living-characteristics', type: 'mcq', difficulty: 1, text: 'Which of these is true for all living things?', options: ['They grow', 'They are green', 'They can fly', 'They live in water'], answer: 0 },
  { id: 'q-s6-magnets', conceptId: 's6-magnets', type: 'mcq', difficulty: 2, text: 'Which of these objects is pulled by a magnet?', options: ['An iron nail', 'A plastic ruler', 'A wooden pencil', 'A paper cup'], answer: 0 },
  { id: 'q-s6-electric-circuits', conceptId: 's6-electric-circuits', type: 'mcq', difficulty: 3, text: 'Which material lets electricity flow through it easily?', options: ['Copper', 'Rubber', 'Glass', 'Dry wood'], answer: 0 },
  // Sinhala (options are Sinhala words in every locale)
  { id: 'q-si6-verbs', conceptId: 'si6-verbs', type: 'mcq', difficulty: 1, text: 'Which of these Sinhala words is a verb?', options: ['දුවයි', 'ගස', 'ලස්සන', 'පොත'], answer: 0 },
  { id: 'q-si6-nouns', conceptId: 'si6-nouns', type: 'mcq', difficulty: 2, text: 'Which of these Sinhala words is a plural noun?', options: ['ළමයි', 'ළමයා', 'ගියේය', 'ලොකු'], answer: 0 },
  // English (options are English sentences in every locale)
  { id: 'q-en6-was-it-yesterday', conceptId: 'en6-was-it-yesterday', type: 'short', difficulty: 1, text: 'Write the past tense of the English verb "go".', answer: 'went' },
  { id: 'q-en6-what-we-do', conceptId: 'en6-what-we-do', type: 'mcq', difficulty: 2, text: 'Choose the correct English sentence.', options: ['She walks to school every day.', 'She walk to school every day.', 'She walking to school every day.', 'She are walk to school every day.'], answer: 0 },
  // ICT
  { id: 'q-ict6-computer-basics', conceptId: 'ict6-computer-basics', type: 'mcq', difficulty: 1, text: 'Which of these is an input device?', options: ['Keyboard', 'Monitor', 'Speaker', 'Printer'], answer: 0 },
  { id: 'q-ict6-flowcharts', conceptId: 'ict6-flowcharts', type: 'mcq', difficulty: 2, text: 'Which flowchart symbol is used for a decision?', options: ['Diamond', 'Rectangle', 'Oval', 'Arrow'], answer: 0 },
  { id: 'q-ict6-online-safety', conceptId: 'ict6-online-safety', type: 'mcq', difficulty: 2, text: 'Someone you do not know asks for your home address online. What should you do?', options: ['Do not share it and tell a trusted adult', 'Send it to them quickly', 'Post it for everyone to see', 'Share your phone number instead'], answer: 0 },
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
  return r.replace(/\s+/g, '') === String(q.answer).toLowerCase().replace(/\s+/g, '');
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
/** The official Grade 6 source documents behind the learning paths (titles from each manifest.json). */
const DOC_STATUS: CurriculumDoc['status'][] = ['published', 'published', 'in_review', 'published', 'draft'];
export const CURRICULUM: CurriculumDoc[] = G6_SOURCE_DOCS.map((d, i) => ({
  id: d.id,
  title: d.title,
  titleKey: `curriculum.doc.${d.id}`,
  subject: d.subject,
  grade: MVP_GRADE,
  status: d.kind === 'textbook' ? 'published' : DOC_STATUS[i % DOC_STATUS.length],
  updatedAt: daysAgo(3 + ((i * 11) % 50)),
}));
