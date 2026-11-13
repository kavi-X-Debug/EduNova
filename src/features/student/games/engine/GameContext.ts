import { createContext, useContext } from 'react';
import type { GameLevel } from '@/types';

export interface GameCtx {
  level: GameLevel;
  seed: string;
  /** Optional gentle timer mode, chosen on the start screen; OFF by default. */
  extraChallenge: boolean;
  /** True while the pause screen is open: games must not run timers. */
  paused: boolean;
  /** Called by useGameSession as rounds advance, so the shell can show "Question 3 of 8". */
  reportProgress: (index: number, total: number) => void;
  /** Called by useGameSession after the last round. */
  complete: (result: { correct: number; total: number }) => void;
}

export const GameContext = createContext<GameCtx | null>(null);

export function useGameContext(): GameCtx {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('Game components must be rendered inside <GameShell>');
  return ctx;
}
