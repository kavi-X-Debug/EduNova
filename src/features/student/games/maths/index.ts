import type { GameDefinition } from '@/types';

/** Maths games. Add a game = add an entry here (and its folder files, see docs/GAMES-AUTHORING.md). */
export const mathsGames: GameDefinition[] = [
  {
    id: 'number-line-jump',
    subject: 'maths',
    grade: 6,
    conceptIds: ['m6-number-line'],
    titleKey: 'games.maths.numberLineJump.title',
    howToKey: 'games.maths.numberLineJump.howTo',
    levels: [1, 2, 3],
    estimatedMinutes: 4,
    kind: 'tap',
    thumbnail: { tone: 'brand' },
    load: () => import('./NumberLineJump'),
  },
];
