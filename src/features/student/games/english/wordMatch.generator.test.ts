import { describe, expect, it } from 'vitest';
import { generateRounds } from '../engine/generate';
import { KINDS, makeWordMatchRound, PAIR_COUNT, ROUNDS_PER_PLAY } from './wordMatch.generator';

describe('word match generator', () => {
  it('is deterministic for a seed and fresh for another', () => {
    expect(generateRounds('x', 2, ROUNDS_PER_PLAY, makeWordMatchRound)).toEqual(generateRounds('x', 2, ROUNDS_PER_PLAY, makeWordMatchRound));
    expect(generateRounds('x', 2, ROUNDS_PER_PLAY, makeWordMatchRound)).not.toEqual(generateRounds('y', 2, ROUNDS_PER_PLAY, makeWordMatchRound));
  });
  for (const level of [1, 2, 3] as const) {
    it(`level ${level}: right number of pairs, every word once, right column mixed up`, () => {
      for (let s = 0; s < 80; s++) {
        for (const r of generateRounds(`seed${s}`, level, ROUNDS_PER_PLAY, makeWordMatchRound)) {
          expect(KINDS[level]).toContain(r.kind);
          expect(r.pairs).toHaveLength(PAIR_COUNT[level]);
          const words = r.pairs.flatMap((p) => [p.a, p.b]);
          expect(new Set(words).size).toBe(words.length);
          expect([...r.rightOrder].sort()).toEqual(r.pairs.map((_, i) => i));
          expect(r.rightOrder.every((v, i) => v === i)).toBe(false);
        }
      }
    });
  }
  it('level 3 uses the tricky words', () => {
    const rounds = generateRounds('t', 3, 5, makeWordMatchRound);
    expect(rounds.some((r) => r.kind === 'plural' && r.pairs.some((p) => ['children', 'feet', 'teeth', 'mice', 'men', 'women', 'oxen', 'geese'].includes(p.b)))).toBe(true);
  });
  it('rounds of one play do not repeat the same pairs of a kind straight away', () => {
    const r = generateRounds('rep', 1, 5, makeWordMatchRound);
    expect(r[0].pairs).not.toEqual(r[2].pairs);
  });
});
