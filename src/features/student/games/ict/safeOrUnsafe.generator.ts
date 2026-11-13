// PURE generator: see docs/GAMES-AUTHORING.md.
import type { RoundContext } from '../engine/generate';
import type { Rng } from '../engine/rng';

/** Behaviours (texts live in the locale files: games.ict.safeOrUnsafe.item.<id> and .why.<id>). true = safe. */
export const BEHAVIOURS: Record<string, boolean> = {
  tellAdult: true, strongPw: true, keepSecret: true, askPhoto: true, kind: true, logout: true,
  address: false, sharePw: false, strangerLink: false, pw1234: false, mean: false, meet: false,
};
export const IDS = Object.keys(BEHAVIOURS);

/** True when a password is long and mixes capitals, small letters, digits and a symbol. */
export const isStrongPassword = (p: string): boolean => p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p);

const WORDS = ['Tiger', 'Mango', 'Lotus', 'River', 'Cloud', 'Rocket', 'Panda', 'Coral'];
export const WEAK = ['1234', '12345678', 'password', 'abc123', 'qwerty', 'mango', 'iloveyou', 'Tiger', 'sunny99', 'Hello1'];
const SYMBOLS = ['#', '!', '@', '$', '%', '&'];

export type SafeRound =
  | { mode: 'one'; item: string; safe: boolean }
  | { mode: 'sort'; items: string[] }
  | { mode: 'password'; options: string[]; answer: string };

export const SORT_SIZE: Record<2 | 3, number> = { 2: 4, 3: 6 };

function pickSorted(rng: Rng, n: number): string[] {
  const half = n / 2;
  const safe = rng.sample(IDS.filter((i) => BEHAVIOURS[i]), half);
  const unsafe = rng.sample(IDS.filter((i) => !BEHAVIOURS[i]), n - half);
  return rng.shuffle([...safe, ...unsafe]);
}

export function makeSafeRound(rng: Rng, { level, index }: RoundContext): SafeRound {
  if (level === 1) {
    const item = rng.pick(IDS);
    return { mode: 'one', item, safe: BEHAVIOURS[item] };
  }
  if (level === 2) return { mode: 'sort', items: pickSorted(rng, SORT_SIZE[2]) };
  if (index % 3 === 2) {
    const answer = `${rng.pick(WORDS)}${rng.pick(SYMBOLS)}${rng.int(10, 99)}${rng.pick(WORDS).toLowerCase()}`;
    const weak = rng.sample(WEAK, 2);
    return { mode: 'password', options: rng.shuffle([answer, ...weak]), answer };
  }
  return { mode: 'sort', items: pickSorted(rng, SORT_SIZE[3]) };
}

export const ROUNDS_PER_PLAY = 6;
