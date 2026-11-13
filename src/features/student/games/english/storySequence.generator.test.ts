import { describe, expect, it } from 'vitest';
import { generateRounds } from '../engine/generate';
import { BANKS, makeStoryRound, ROUNDS_PER_PLAY } from './storySequence.generator';

describe('story sequence generator', () => {
  it('is deterministic for a seed and fresh for another', () => {
    expect(generateRounds('x', 2, ROUNDS_PER_PLAY, makeStoryRound)).toEqual(generateRounds('x', 2, ROUNDS_PER_PLAY, makeStoryRound));
    expect(generateRounds('x', 2, ROUNDS_PER_PLAY, makeStoryRound)).not.toEqual(generateRounds('y', 2, ROUNDS_PER_PLAY, makeStoryRound));
  });
  for (const [level, steps] of [[1, 3], [2, 4], [3, 5]] as const) {
    it(`level ${level}: ${steps} steps, a real mix-up, stories differ within a play`, () => {
      for (let s = 0; s < 80; s++) {
        const rounds = generateRounds(`seed${s}`, level, ROUNDS_PER_PLAY, makeStoryRound);
        expect(new Set(rounds.map((r) => r.id)).size).toBe(rounds.length);
        for (const r of rounds) {
          expect(r.steps).toHaveLength(steps);
          expect([...r.order].sort()).toEqual(r.steps.map((_, i) => i));
          expect(r.order.every((v, i) => v === i)).toBe(false);
        }
      }
    });
  }
  it('every bank has enough stories for a play', () => {
    for (const l of [1, 2, 3] as const) expect(BANKS[l].length).toBeGreaterThanOrEqual(ROUNDS_PER_PLAY);
  });
});
