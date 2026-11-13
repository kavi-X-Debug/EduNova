import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GameLevel } from '@/types';
import { useGameContext } from './GameContext';
import { generateRounds, type RoundContext } from './generate';
import type { Rng } from './rng';
import { playSound } from './sound';

export type RoundStatus = 'asking' | 'right' | 'wrong';

export interface GameSession<R> {
  /** The current round, as built by your pure `makeRound`. */
  round: R;
  /** 0-based. */
  index: number;
  total: number;
  isLast: boolean;
  level: GameLevel;
  /** Optional gentle timer mode (off by default). Show a <TimerBar> only when true. */
  extraChallenge: boolean;
  paused: boolean;
  status: RoundStatus;
  /** Rounds answered right at the first try so far. */
  correct: number;
  /** One short kid sentence explaining the right answer (set by `answer`). */
  explanation?: string;
  /** Record the answer for this round. Ignored if already answered. `explanation` is shown after a wrong answer. */
  answer: (isCorrect: boolean, explanation?: string) => void;
  /** Go to the next round; after the last round it finishes the game (the shell shows the finish screen). */
  next: () => void;
}

export interface SessionOptions<R> {
  /** Number of rounds (questions) per play, usually 6-10. */
  rounds: number;
  /** PURE and defined at module level: build round `ctx.index` using only `rng` (see generate.ts). */
  makeRound: (rng: Rng, ctx: RoundContext) => R;
}

/**
 * Runs the rounds of one play. Reads level, seed and the finish callback from <GameShell>.
 * The child gets ONE attempt per round; a wrong answer shows a kind hint plus `explanation`.
 */
export function useGameSession<R>({ rounds, makeRound }: SessionOptions<R>): GameSession<R> {
  const ctx = useGameContext();
  const { level, seed, reportProgress, complete } = ctx;
  const all = useMemo(() => generateRounds(seed, level, rounds, makeRound), [seed, level, rounds, makeRound]);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<RoundStatus>('asking');
  const [correct, setCorrect] = useState(0);
  const [explanation, setExplanation] = useState<string>();

  useEffect(() => {
    reportProgress(index, all.length);
  }, [index, all.length, reportProgress]);

  const answer = useCallback(
    (isCorrect: boolean, why?: string) => {
      if (status !== 'asking') return;
      setStatus(isCorrect ? 'right' : 'wrong');
      setExplanation(why);
      if (isCorrect) setCorrect((c) => c + 1);
      playSound(isCorrect ? 'right' : 'wrong');
    },
    [status],
  );

  const isLast = index >= all.length - 1;
  const next = useCallback(() => {
    if (status === 'asking') return;
    if (isLast) {
      playSound('finish');
      complete({ correct, total: all.length });
      return;
    }
    setIndex((i) => i + 1);
    setStatus('asking');
    setExplanation(undefined);
  }, [status, isLast, complete, correct, all.length]);

  return { round: all[index], index, total: all.length, isLast, level, extraChallenge: ctx.extraChallenge, paused: ctx.paused, status, correct, explanation, answer, next };
}
