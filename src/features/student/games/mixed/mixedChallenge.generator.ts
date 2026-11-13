// PURE generator: see docs/GAMES-AUTHORING.md. A small own set of cross-subject quick questions:
// Maths is generated; Science and ICT are true/false facts whose texts live in the locale files
// (games.mixed.mixedChallenge.fact.<id> and .why.<id>).
import { buildChoices, numericDistractors, type RoundContext } from '../engine/generate';
import type { Rng } from '../engine/rng';

export type MixedSubject = 'maths' | 'science' | 'ict';
export const SUBJECT_ORDER: MixedSubject[] = ['maths', 'science', 'ict'];
/** Real Grade 6 concept ids each kind of question practises. */
export const MIXED_CONCEPTS = ['m6-whole-number-operations', 's6-things-around-us', 'ict6-computer-basics'] as const;

export interface Fact { id: string; subject: 'science' | 'ict'; level: 1 | 2 | 3; isTrue: boolean }
export const FACTS: Fact[] = [
  { id: 'ice', subject: 'science', level: 1, isTrue: true },
  { id: 'magnetIron', subject: 'science', level: 1, isTrue: true },
  { id: 'waterStates', subject: 'science', level: 1, isTrue: true },
  { id: 'steam', subject: 'science', level: 2, isTrue: false },
  { id: 'magnetPaper', subject: 'science', level: 2, isTrue: false },
  { id: 'shadow', subject: 'science', level: 3, isTrue: true },
  { id: 'mouseInput', subject: 'ict', level: 1, isTrue: true },
  { id: 'passwordShare', subject: 'ict', level: 1, isTrue: false },
  { id: 'monitorShows', subject: 'ict', level: 1, isTrue: true },
  { id: 'printerInput', subject: 'ict', level: 2, isTrue: false },
  { id: 'folderHolds', subject: 'ict', level: 2, isTrue: true },
  { id: 'ovalStart', subject: 'ict', level: 3, isTrue: true },
];

export type MixedRound =
  | { subject: 'maths'; /** e.g. "7 + 8" */ sum: string; answer: number; options: number[]; /** language-neutral working, e.g. "7 + 8 = 15" */ working: string }
  | { subject: 'science' | 'ict'; fact: string; isTrue: boolean };

function mathsRound(rng: Rng, level: 1 | 2 | 3): Extract<MixedRound, { subject: 'maths' }> {
  let sum: string;
  let answer: number;
  if (level === 1) {
    const a = rng.int(3, 12);
    const b = rng.int(2, 9);
    if (rng.chance()) { sum = `${a} + ${b}`; answer = a + b; } else { sum = `${a + b} - ${b}`; answer = a; }
  } else if (level === 2) {
    const a = rng.int(3, 9);
    const b = rng.int(3, 9);
    sum = `${a} × ${b}`;
    answer = a * b;
  } else {
    const a = rng.int(4, 9);
    const b = rng.int(4, 9);
    const c = rng.int(5, 30);
    if (rng.chance()) { sum = `${a} × ${b} + ${c}`; answer = a * b + c; } else { sum = `${a * b + c} - ${c}`; answer = a * b; }
  }
  const options = buildChoices(rng, answer, numericDistractors(rng, answer, 5, { spread: 4, min: 0 }), 4).options;
  return { subject: 'maths', sum, answer, options, working: `${sum} = ${answer}` };
}

/** Round i is Maths, Science, ICT, Maths... Rounds 0-2 use facts at even places of the level's list, rounds 3-5 odd places, so a play never repeats a fact (up to 6 rounds). */
export function makeMixedRound(rng: Rng, { level, index }: RoundContext): MixedRound {
  const subject = SUBJECT_ORDER[index % 3];
  if (subject === 'maths') return mathsRound(rng, level);
  const pool = FACTS.filter((f) => f.subject === subject && f.level <= level);
  const half = pool.filter((_, i) => i % 2 === (Math.floor(index / 3) % 2));
  const fact = rng.pick(half.length ? half : pool);
  return { subject, fact: fact.id, isTrue: fact.isTrue };
}

export const ROUNDS_PER_PLAY = 6;
