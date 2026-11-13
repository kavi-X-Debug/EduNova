import { describe, expect, it } from 'vitest';
import { generateRounds } from '../engine/generate';
import { makePrepositionRound, ROUNDS_PER_PLAY } from './pickThePreposition.generator';

describe('pick the preposition generator', () => {
  it('is deterministic for a seed and fresh for another', () => {
    expect(generateRounds('x', 3, ROUNDS_PER_PLAY, makePrepositionRound)).toEqual(generateRounds('x', 3, ROUNDS_PER_PLAY, makePrepositionRound));
    expect(generateRounds('x', 3, ROUNDS_PER_PLAY, makePrepositionRound)).not.toEqual(generateRounds('y', 3, ROUNDS_PER_PLAY, makePrepositionRound));
  });
  for (const level of [1, 2, 3] as const) {
    it(`level ${level}: exactly one right option, no duplicates, answer among the options`, () => {
      for (let s = 0; s < 120; s++) {
        for (const r of generateRounds(`seed${s}`, level, ROUNDS_PER_PLAY, makePrepositionRound)) {
          expect(r.options.filter((o) => o === r.answer)).toHaveLength(1);
          expect(new Set(r.options).size).toBe(r.options.length);
          expect(r.options.length).toBeGreaterThanOrEqual(3);
          if (r.mode === 'scene') expect(r.scene).toBe(r.answer);
          else {
            expect(level).toBe(3);
            expect(r.rule).toBe(r.answer);
            expect(r.example).toBeTruthy();
          }
        }
      }
    });
  }
  it('level 1 only asks in / on / under and cycles through them', () => {
    const rounds = generateRounds('l1', 1, 6, makePrepositionRound);
    expect(new Set(rounds.map((r) => r.answer))).toEqual(new Set(['in', 'on', 'under']));
  });
  it('look-alike pictures are never offered together (near / behind / in front of)', () => {
    const alike = ['near', 'behind', 'in front of'];
    for (let s = 0; s < 200; s++) {
      for (const r of generateRounds(`c${s}`, 2, 7, makePrepositionRound)) {
        if (alike.includes(r.answer)) expect(r.options.filter((o) => alike.includes(o))).toEqual([r.answer]);
      }
    }
  });
  it('level 3 mixes pictures and on / in / at time sentences', () => {
    const rounds = generateRounds('mix', 3, 40, makePrepositionRound);
    expect(rounds.some((r) => r.mode === 'time')).toBe(true);
    expect(rounds.some((r) => r.mode === 'scene')).toBe(true);
  });
});
