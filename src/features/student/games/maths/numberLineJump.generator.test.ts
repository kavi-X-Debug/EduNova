import { describe, expect, it } from 'vitest';
import { generateRounds } from '../engine/generate';
import { LEVEL_SPEC, makeNumberLineRound, ROUNDS_PER_PLAY, workingOut } from './numberLineJump.generator';

describe('number line jump generator', () => {
  it('is deterministic for a seed', () => {
    expect(generateRounds('x', 2, ROUNDS_PER_PLAY, makeNumberLineRound)).toEqual(generateRounds('x', 2, ROUNDS_PER_PLAY, makeNumberLineRound));
  });
  it('gives fresh rounds for another seed', () => {
    expect(generateRounds('x', 2, ROUNDS_PER_PLAY, makeNumberLineRound)).not.toEqual(generateRounds('y', 2, ROUNDS_PER_PLAY, makeNumberLineRound));
  });
  for (const level of [1, 2, 3] as const) {
    it(`level ${level}: the frog stays on the line, the answer is right and unique`, () => {
      const spec = LEVEL_SPEC[level];
      for (let s = 0; s < 150; s++) {
        for (const r of generateRounds(`seed${s}`, level, 4, makeNumberLineRound)) {
          let pos = r.start;
          expect(pos).toBeGreaterThanOrEqual(spec.min);
          for (const j of r.jumps) {
            expect(j).not.toBe(0);
            pos += j;
            expect(pos).toBeGreaterThanOrEqual(spec.min);
            expect(pos).toBeLessThanOrEqual(spec.max);
          }
          expect(pos).toBe(r.answer);
          expect(r.sum.endsWith(`= ${r.answer}`)).toBe(true);
          expect(r.jumps.length).toBeGreaterThanOrEqual(spec.jumps[0]);
          expect(r.jumps.length).toBeLessThanOrEqual(spec.jumps[1]);
          if (r.mode === 'choose') {
            expect(r.options.filter((o) => o === r.answer)).toHaveLength(1);
            expect(new Set(r.options).size).toBe(r.options.length);
            expect(r.options.length).toBeGreaterThanOrEqual(3);
          } else expect(r.options).toEqual([]);
        }
      }
    });
  }
  it('level 3 crosses zero and is typed', () => {
    const rounds = generateRounds('z', 3, 40, makeNumberLineRound);
    expect(rounds.every((r) => r.mode === 'type')).toBe(true);
    const crossing = rounds.filter((r) => {
      const path = r.jumps.reduce<number[]>((a, j) => [...a, a[a.length - 1] + j], [r.start]);
      return path.some((p) => p < 0) && path.some((p) => p > 0);
    });
    expect(crossing.length).toBeGreaterThan(30);
  });
  it('workingOut writes language-neutral sums', () => {
    expect(workingOut(5, [3, -2])).toBe('5 + 3 - 2 = 6');
  });
});
