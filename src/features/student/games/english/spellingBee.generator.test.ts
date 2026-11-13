import { describe, expect, it } from 'vitest';
import { generateRounds } from '../engine/generate';
import { BANKS, EXTRA_LETTERS, makeSpellingRound, ROUNDS_PER_PLAY } from './spellingBee.generator';

const sorted = (a: string[]) => [...a].sort().join('');

describe('spelling bee generator', () => {
  it('is deterministic for a seed and fresh for another', () => {
    expect(generateRounds('x', 1, ROUNDS_PER_PLAY, makeSpellingRound)).toEqual(generateRounds('x', 1, ROUNDS_PER_PLAY, makeSpellingRound));
    expect(generateRounds('x', 1, ROUNDS_PER_PLAY, makeSpellingRound)).not.toEqual(generateRounds('y', 1, ROUNDS_PER_PLAY, makeSpellingRound));
  });
  for (const level of [1, 2, 3] as const) {
    it(`level ${level}: tiles can spell the word, the words never repeat in a play`, () => {
      for (let s = 0; s < 80; s++) {
        const rounds = generateRounds(`seed${s}`, level, ROUNDS_PER_PLAY, makeSpellingRound);
        expect(new Set(rounds.map((r) => r.word)).size).toBe(rounds.length);
        for (const r of rounds) {
          expect(BANKS[level].some((w) => w.word === r.word && w.clue === r.clue)).toBe(true);
          expect(r.spelled.replace(/-/g, '')).toBe(r.word);
          if (r.mode === 'tap') {
            expect(r.letters).toHaveLength(r.word.length + EXTRA_LETTERS[level]);
            const pool = [...r.letters];
            for (const ch of r.word) {
              const at = pool.indexOf(ch);
              expect(at).toBeGreaterThanOrEqual(0);
              pool.splice(at, 1);
            }
            expect(pool).toHaveLength(EXTRA_LETTERS[level]);
            if (level === 1) {
              expect(sorted(r.letters)).toBe(sorted(r.word.split('')));
              expect(r.letters.join('')).not.toBe(r.word);
            }
          } else expect(r.letters).toEqual([]);
        }
      }
    });
  }
  it('level 3 is typed, levels 1 and 2 are tapped', () => {
    expect(generateRounds('m', 3, 6, makeSpellingRound).every((r) => r.mode === 'type')).toBe(true);
    expect(generateRounds('m', 2, 6, makeSpellingRound).every((r) => r.mode === 'tap')).toBe(true);
  });
  it('level 3 words are long enough to be a challenge', () => {
    for (const w of BANKS[3]) expect(w.word.length).toBeGreaterThanOrEqual(7);
  });
});
