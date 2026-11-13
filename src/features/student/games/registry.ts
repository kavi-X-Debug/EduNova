import type { GameDefinition, GameSubject } from '@/types';
import { englishGames } from './english';
import { ictGames } from './ict';
import { mathsGames } from './maths';
import { mixedGames } from './mixed';
import { scienceGames } from './science';
import { sinhalaGames } from './sinhala';

/**
 * Every game. One file per subject folder (`<subject>/index.ts`) so subject agents never edit the same file:
 * do NOT edit this list when you add a game, only your own subject's index.ts.
 */
export const GAMES: GameDefinition[] = [...mathsGames, ...scienceGames, ...sinhalaGames, ...englishGames, ...ictGames, ...mixedGames];

/** Library filter order (also the order of the subject icons). */
export const GAME_SUBJECTS: GameSubject[] = ['maths', 'science', 'sinhala', 'english', 'ict', 'mixed'];

export const gameById = (id: string | undefined): GameDefinition | undefined => GAMES.find((g) => g.id === id);
