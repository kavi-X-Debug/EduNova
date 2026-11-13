import { describe, expect, it } from 'vitest';
import { generateRounds } from '../engine/generate';
import { PASSAGES } from './data/passages';
import { SPELLING_ITEMS } from './data/spelling';
import { PICTURE_WORDS, wordOf } from './data/words';
import { makeSpellingRound, ROUNDS_PER_PLAY as SPELL_ROUNDS } from './fixSpelling.generator';
import { makeMatchRound, OPTION_COUNT as MATCH_COUNT, ROUNDS_PER_PLAY as MATCH_ROUNDS } from './matchWordPicture.generator';
import { makeReadingRound, ROUNDS_PER_PLAY as READ_ROUNDS } from './readingRace.generator';
import { isSentenceRight, makeSentenceRound, ROUNDS_PER_PLAY as SENT_ROUNDS } from './sentenceOrder.generator';
import { startsWithCombining } from './sinhalaText';
import { isWordBuilt, makeWordBuilderRound, ROUNDS_PER_PLAY as BUILD_ROUNDS, SPARE_TILES } from './wordBuilder.generator';

const levels = [1, 2, 3] as const;
const realWords = new Set(PICTURE_WORDS.map((p) => p.word));

describe('seeded and fresh', () => {
  const games = [
    ['word builder', makeWordBuilderRound, BUILD_ROUNDS],
    ['match', makeMatchRound, MATCH_ROUNDS],
    ['sentence order', makeSentenceRound, SENT_ROUNDS],
    ['fix the spelling', makeSpellingRound, SPELL_ROUNDS],
    ['reading race', makeReadingRound, READ_ROUNDS],
  ] as const;
  for (const [name, make, n] of games) {
    for (const level of levels) {
      it(`${name} level ${level}: deterministic per seed, different for another seed`, () => {
        const g = generateRounds as (s: string, l: 1 | 2 | 3, c: number, m: unknown) => unknown[];
        expect(g('a', level, n, make)).toEqual(g('a', level, n, make));
        expect(g('a', level, n, make)).not.toEqual(g('b', level, n, make));
      });
    }
  }
});

describe('word builder generator', () => {
  for (const level of levels) {
    it(`level ${level}: exactly one way to build the word, no tile cut, spare tiles never needed`, () => {
      for (let s = 0; s < 150; s++) {
        for (const r of generateRounds(`wb${s}`, level, 4, makeWordBuilderRound)) {
          expect(r.answer.join('')).toBe(r.word);
          expect(r.answer.join('')).toBe(wordOf(r.picture).word);
          expect(isWordBuilt(r, r.answer)).toBe(true);
          expect(isWordBuilt(r, [...r.answer].reverse().concat(['x']))).toBe(false);
          expect(r.tiles).toHaveLength(r.answer.length + SPARE_TILES[level]);
          expect(new Set(r.tiles.map((t) => t.id)).size).toBe(r.tiles.length);
          const texts = r.tiles.map((t) => t.text);
          expect(new Set(texts).size, 'tile texts differ unless the word repeats a piece').toBeGreaterThanOrEqual(new Set(r.answer).size + SPARE_TILES[level]);
          for (const a of r.answer) expect(texts).toContain(a);
          for (const t of r.tiles) expect(startsWithCombining(t.text)).toBe(false);
          if (level === 1) expect(r.answer).toHaveLength(2);
          if (level === 2) expect(r.answer).toHaveLength(3);
          if (level === 3) expect(r.answer.length).toBeGreaterThanOrEqual(3);
        }
      }
    });
  }
});

describe('match word and picture generator', () => {
  for (const level of levels) {
    it(`level ${level}: one right option, no duplicates, mode as designed`, () => {
      for (let s = 0; s < 150; s++) {
        for (const r of generateRounds(`mp${s}`, level, 4, makeMatchRound)) {
          expect(r.options).toHaveLength(MATCH_COUNT[level]);
          expect(r.options.filter((o) => o === r.target)).toHaveLength(1);
          expect(new Set(r.options).size).toBe(r.options.length);
          expect(r.mode).toBe(level === 3 ? 'picture' : 'word');
          if (level === 2) {
            const n = wordOf(r.target).syllables.length;
            const alike = PICTURE_WORDS.filter((p) => p.id !== r.target && p.syllables.length === n).length;
            const sameLen = r.options.filter((o) => o !== r.target && wordOf(o).syllables.length === n).length;
            expect(sameLen).toBe(Math.min(3, alike));
          }
        }
      }
    });
  }
});

describe('sentence order generator', () => {
  for (const level of levels) {
    it(`level ${level}: tiles are the words, shuffled, and the natural order is accepted`, () => {
      for (let s = 0; s < 150; s++) {
        for (const r of generateRounds(`so${s}`, level, 4, makeSentenceRound)) {
          expect(r.answer).toHaveLength(level + 2);
          expect(r.tiles.map((t) => t.text).sort()).toEqual([...r.answer].sort());
          expect(isSentenceRight(r, r.answer)).toBe(true);
          expect(isSentenceRight(r, r.tiles.map((t) => t.text))).toBe(false); // never starts solved
          expect(isSentenceRight(r, [...r.answer].reverse())).toBe(false);
          if (r.alternative) {
            expect(isSentenceRight(r, r.alternative)).toBe(true);
            expect(r.alternative[0]).toBe(r.answer[0]);
            expect(r.alternative[3]).toBe(r.answer[3]);
          }
        }
      }
    });
  }
});

describe('fix the spelling generator', () => {
  for (const level of levels) {
    it(`level ${level}: exactly one right tap, no duplicate options`, () => {
      for (let s = 0; s < 150; s++) {
        for (const r of generateRounds(`fs${s}`, level, 4, makeSpellingRound)) {
          expect(r.options.filter((o) => o === r.correct)).toHaveLength(1);
          expect(new Set(r.options).size).toBe(r.options.length);
          expect(r.word).toBe(wordOf(r.picture).word);
          if (r.mode === 'picture') {
            expect(level).not.toBe(3);
            expect(r.correct).toBe(r.word);
            expect(r.options.length).toBeGreaterThanOrEqual(3);
            expect(r.options.length).toBeLessThanOrEqual(level === 1 ? 3 : 4);
          } else {
            // find the mistake: exactly one option is not a real word of the bank, and it is a known non-word error
            expect(level).toBe(3);
            expect(r.options).toHaveLength(4);
            const item = SPELLING_ITEMS.find((i) => i.id === r.picture)!;
            expect(item.errors.find((e) => e.text === r.correct)?.nonword).toBe(true);
            expect(r.options.filter((o) => !realWords.has(o))).toEqual([r.correct]);
            expect(r.options).not.toContain(r.word);
          }
        }
      }
    });
  }
});

describe('reading race generator', () => {
  for (const level of levels) {
    it(`level ${level}: one right answer among 3 different options, from a known passage`, () => {
      for (let s = 0; s < 150; s++) {
        for (const r of generateRounds(`rr${s}`, level, 4, makeReadingRound)) {
          const passage = PASSAGES[level].find((p) => p.id === r.passageId)!;
          expect(passage).toBeTruthy();
          expect(r.sentences).toEqual(passage.sentences);
          expect(passage.questions.some((q) => q.question === r.question && q.right === r.answer)).toBe(true);
          expect(r.options).toHaveLength(3);
          expect(r.options.filter((o) => o === r.answer)).toHaveLength(1);
          expect(new Set(r.options).size).toBe(3);
        }
      }
    });
  }
  it('passages get longer with the level', () => {
    const avg = (l: 1 | 2 | 3) => PASSAGES[l].reduce((a, p) => a + p.sentences.length, 0) / PASSAGES[l].length;
    expect(avg(1)).toBeLessThan(avg(2));
    expect(avg(2)).toBeLessThan(avg(3));
  });
});
