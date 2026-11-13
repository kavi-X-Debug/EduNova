// PURE generator (no React, no Math.random): see docs/GAMES-AUTHORING.md.
import { buildChoices, type RoundContext } from '../engine/generate';
import type { Rng } from '../engine/rng';

export type KeyQuestion = 'group' | 'job' | 'finger';
export type KeyGroup = 'letters' | 'numbers' | 'arrows' | 'helper';
export type KeyJob = 'newLine' | 'space' | 'eraseBack' | 'capital' | 'capsLock' | 'erase';
export type Finger = 'lPinky' | 'lRing' | 'lMiddle' | 'lIndex' | 'rIndex' | 'rMiddle' | 'rRing' | 'rPinky';

export interface KeyRound {
  question: KeyQuestion;
  /** Latin key label drawn on the key cap (key names stay Latin everywhere). */
  key: string;
  /** Id of the right option (a KeyGroup, KeyJob or Finger). */
  answer: string;
  options: string[];
}

export const GROUPS: KeyGroup[] = ['letters', 'numbers', 'arrows', 'helper'];
export const FINGERS: Finger[] = ['lPinky', 'lRing', 'lMiddle', 'lIndex', 'rIndex', 'rMiddle', 'rRing', 'rPinky'];
export const HELPER_KEYS = ['Enter', 'Space', 'Backspace', 'Shift', 'Tab', 'Caps Lock', 'Delete'];
export const ARROW_KEYS = ['↑', '↓', '←', '→'];
/** Key -> job, for the "what does it do" level. */
export const JOB_OF: Record<string, KeyJob> = { Enter: 'newLine', Space: 'space', Backspace: 'eraseBack', Shift: 'capital', 'Caps Lock': 'capsLock', Delete: 'erase' };

const fingerKeys = (keys: string, f: Finger): [string, Finger][] => keys.split('').map((k) => [k, f]);
/** Standard touch-typing finger for each letter or digit key. */
export const FINGER_OF: Record<string, Finger> = Object.fromEntries([
  ...fingerKeys('1QAZ', 'lPinky'),
  ...fingerKeys('2WSX', 'lRing'),
  ...fingerKeys('3EDC', 'lMiddle'),
  ...fingerKeys('45RTFGVB', 'lIndex'),
  ...fingerKeys('67YUHJNM', 'rIndex'),
  ...fingerKeys('8IK', 'rMiddle'),
  ...fingerKeys('9OL', 'rRing'),
  ...fingerKeys('0P', 'rPinky'),
]);
export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const DIGITS = '0123456789'.split('');
/** Rows of the little keyboard picture (level 3). */
export const KEY_ROWS = ['1234567890', 'QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

export const groupOf = (key: string): KeyGroup => (DIGITS.includes(key) ? 'numbers' : LETTERS.includes(key) ? 'letters' : ARROW_KEYS.includes(key) ? 'arrows' : 'helper');

export function makeKeyRound(rng: Rng, { level }: RoundContext): KeyRound {
  if (level === 1) {
    const key = rng.pick(rng.pick([LETTERS, DIGITS, ARROW_KEYS, HELPER_KEYS]));
    return { question: 'group', key, answer: groupOf(key), options: GROUPS };
  }
  if (level === 2) {
    const key = rng.pick(Object.keys(JOB_OF));
    const answer: string = JOB_OF[key];
    const others = (Object.values(JOB_OF) as string[]).filter((j) => j !== answer);
    return { question: 'job', key, answer, options: buildChoices<string>(rng, answer, others, 4).options };
  }
  const key = rng.pick(Object.keys(FINGER_OF));
  const answer: string = FINGER_OF[key];
  return { question: 'finger', key, answer, options: buildChoices<string>(rng, answer, FINGERS, 4).options };
}

export const ROUNDS_PER_PLAY = 8;
