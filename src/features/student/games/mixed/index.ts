import type { GameDefinition } from '@/types';

/** Mixed-subject challenges. `subject: 'mixed'` does not count toward "a game in each subject". */
export const mixedGames: GameDefinition[] = [
  {
    id: 'mixed-challenge',
    subject: 'mixed',
    grade: 6,
    // Maths, Science and ICT questions in turn (own small question set; no other subject's generator exists on main to reuse)
    conceptIds: ['m6-whole-number-operations', 's6-things-around-us', 'ict6-computer-basics'],
    titleKey: 'games.mixed.mixedChallenge.title',
    howToKey: 'games.mixed.mixedChallenge.howTo',
    levels: [1, 2, 3],
    estimatedMinutes: 4,
    kind: 'mixed',
    thumbnail: { tone: 'brand' },
    load: () => import('./MixedChallenge'),
  },
];
