import { buildChoices, type RoundContext } from '../engine/generate';
import type { Rng } from '../engine/rng';
import { SPELLING_ITEMS, type SpellingItem } from './data/spelling';
import { PICTURE_WORDS, wordOf, type PictureId } from './data/words';

/**
 * One question.
 * 'picture': a picture and several spellings, pick the right one.
 * 'odd' (level 3): four words, one is misspelled; pick the wrong one (`correct` is the misspelled form).
 */
export interface SpellingRound {
  mode: 'picture' | 'odd';
  /** Picture of the word that matters (for 'picture' it is shown). */
  picture: PictureId;
  /** The right spelling of the word that matters. */
  word: string;
  /** The key letter to look at. */
  letter: string;
  options: string[];
  /** The option to tap: the right spelling ('picture') or the misspelled word ('odd'). */
  correct: string;
}

export const OPTION_COUNT: Record<1 | 2 | 3, number> = { 1: 3, 2: 4, 3: 4 };
export const ROUNDS_PER_PLAY = 6;
const LEVEL1_RULES: readonly SpellingItem['rule'][] = ['la', 'prenasal'];

/** PURE: the same rng always gives the same round. */
export function makeSpellingRound(rng: Rng, { level }: RoundContext): SpellingRound {
  if (level === 3) {
    const item = rng.pick(SPELLING_ITEMS.filter((i) => i.errors.some((e) => e.nonword)));
    const wrong = rng.pick(item.errors.filter((e) => e.nonword)).text;
    const rightWord = wordOf(item.id).word;
    const fillers = rng.sample(PICTURE_WORDS.filter((p) => p.id !== item.id).map((p) => p.word), 3);
    return { mode: 'odd', picture: item.id, word: rightWord, letter: item.letter, options: rng.shuffle([wrong, ...fillers]), correct: wrong };
  }
  const items = level === 1 ? SPELLING_ITEMS.filter((i) => LEVEL1_RULES.includes(i.rule)) : SPELLING_ITEMS;
  const item = rng.pick(items);
  const rightWord = wordOf(item.id).word;
  const { options } = buildChoices(rng, rightWord, item.errors.map((e) => e.text), OPTION_COUNT[level]);
  return { mode: 'picture', picture: item.id, word: rightWord, letter: item.letter, options, correct: rightWord };
}
