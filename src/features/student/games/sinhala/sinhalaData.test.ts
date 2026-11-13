import { describe, expect, it } from 'vitest';
import { PASSAGES } from './data/passages';
import { SENTENCES } from './data/sentences';
import { SPELLING_ITEMS } from './data/spelling';
import { BUILDER_POOLS, PICTURE_WORDS, wordOf } from './data/words';
import { graphemeBoundaries, graphemes, isCombiningSign, startsWithCombining } from './sinhalaText';

const SINHALA_ONLY = /^[඀-෿‍\s.,?!'"-]+$/; // Sinhala block (+ ZWJ, space, punctuation): no Latin, no legacy-font text
const allText = (): string[] => {
  const out: string[] = [];
  for (const p of PICTURE_WORDS) out.push(p.word, ...p.syllables);
  for (const s of SPELLING_ITEMS) out.push(s.letter, ...s.errors.map((e) => e.text));
  for (const level of [1, 2, 3] as const) {
    for (const s of SENTENCES[level]) out.push(...s.words);
    for (const p of PASSAGES[level]) for (const q of p.questions) out.push(...p.sentences, q.question, q.right, ...q.wrong);
  }
  return out;
};

describe('sinhala text helpers', () => {
  it('knows combining signs', () => {
    expect(isCombiningSign('ා')).toBe(true); // aela-pilla
    expect(isCombiningSign('්')).toBe(true); // hal kirima
    expect(isCombiningSign('ක')).toBe(false);
    expect(startsWithCombining('ාක')).toBe(true);
  });
  it('keeps a letter with its signs', () => {
    expect(graphemes('බළලා').join('')).toBe('බළලා');
    expect(graphemes('ලා')).toEqual(['ලා']);
  });
});

describe('sinhala word banks are clean Unicode', () => {
  it('uses only Sinhala-block text (no legacy font text, no Latin)', () => {
    for (const s of allText()) expect(SINHALA_ONLY.test(s), `not clean Sinhala: ${s}`).toBe(true);
  });
  it('has no leading combining sign and no cut letters anywhere', () => {
    for (const s of allText()) {
      for (const w of s.split(/\s+/)) {
        expect(startsWithCombining(w), `word starts with a combining sign: ${w}`).toBe(false);
      }
    }
  });
  it('splits every word only between letters (no word is cut through a vowel sign)', () => {
    for (const p of PICTURE_WORDS) {
      expect(p.syllables.join(''), p.id).toBe(p.word);
      const ok = graphemeBoundaries(p.word);
      let at = 0;
      for (const tile of p.syllables) {
        expect(startsWithCombining(tile), `tile ${tile} of ${p.word} starts with a sign`).toBe(false);
        expect(ok.has(at), `${p.word}: boundary at ${at} cuts a letter`).toBe(true);
        at += tile.length;
      }
      expect(ok.has(at)).toBe(true);
      // every tile is made of whole letters
      for (const tile of p.syllables) expect(graphemes(tile).join('')).toBe(tile);
    }
  });
  it('has unique ids and words', () => {
    expect(new Set(PICTURE_WORDS.map((p) => p.id)).size).toBe(PICTURE_WORDS.length);
    expect(new Set(PICTURE_WORDS.map((p) => p.word)).size).toBe(PICTURE_WORDS.length);
  });
  it('builder pools only use known words and have the right piece counts per level', () => {
    for (const level of [1, 2, 3] as const) {
      expect(BUILDER_POOLS[level].length).toBeGreaterThanOrEqual(5);
      for (const id of BUILDER_POOLS[level]) {
        const n = wordOf(id).syllables.length;
        if (level === 1) expect(n).toBe(2);
        if (level === 2) expect(n).toBe(3);
        if (level === 3) expect(n).toBeGreaterThanOrEqual(3);
      }
    }
  });
  it('spelling errors are different from the right word and from each other', () => {
    const real = new Set(PICTURE_WORDS.map((p) => p.word));
    for (const item of SPELLING_ITEMS) {
      const word = wordOf(item.id).word;
      expect(word.includes(item.letter), `${word} has ${item.letter}`).toBe(true);
      expect(new Set(item.errors.map((e) => e.text)).size).toBe(item.errors.length);
      expect(item.errors.length).toBeGreaterThanOrEqual(2);
      for (const e of item.errors) {
        expect(e.text).not.toBe(word);
        if (e.nonword) expect(real.has(e.text), `${e.text} is a bank word`).toBe(false);
      }
    }
  });
  it('sentences have distinct words and the right length per level', () => {
    for (const level of [1, 2, 3] as const) {
      for (const s of SENTENCES[level]) {
        expect(s.words.length).toBe(level + 2);
        expect(new Set(s.words).size).toBe(s.words.length);
        if (s.swapMiddle) expect(s.words.length).toBe(4);
      }
    }
  });
  it('passages have 2 questions with 3 different options', () => {
    for (const level of [1, 2, 3] as const) {
      for (const p of PASSAGES[level]) {
        expect(p.questions.length).toBeGreaterThanOrEqual(1);
        for (const q of p.questions) expect(new Set([q.right, ...q.wrong]).size).toBe(3);
      }
    }
  });
});
