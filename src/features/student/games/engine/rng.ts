/**
 * Seeded random numbers for game generators. PURE: the same seed always gives the same numbers, so every
 * generator is unit-testable and a round can be replayed. Never call Math.random() in a generator.
 */
export interface Rng {
  /** Float in [0, 1). */
  next(): number;
  /** Integer in [min, max] (both included). */
  int(min: number, max: number): number;
  /** One item of a non-empty array. */
  pick<T>(items: readonly T[]): T;
  /** A new shuffled copy (Fisher-Yates). */
  shuffle<T>(items: readonly T[]): T[];
  /** `count` different items, in random order. */
  sample<T>(items: readonly T[], count: number): T[];
  /** True with probability p (default 0.5). */
  chance(p?: number): boolean;
}

/** FNV-1a string hash to a 32-bit unsigned integer. */
export function hashSeed(seed: string | number): number {
  const s = String(seed);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 generator over a hashed seed. */
export function createRng(seed: string | number): Rng {
  let a = hashSeed(seed);
  const next = (): number => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number): number => {
    const lo = Math.ceil(Math.min(min, max));
    const hi = Math.floor(Math.max(min, max));
    return lo + Math.floor(next() * (hi - lo + 1));
  };
  const shuffle = <T,>(items: readonly T[]): T[] => {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
      const j = int(0, i);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  return {
    next,
    int,
    pick: (items) => items[int(0, items.length - 1)],
    shuffle,
    sample: (items, count) => shuffle(items).slice(0, Math.max(0, count)),
    chance: (p = 0.5) => next() < p,
  };
}

/** A fresh seed for a new play. The only place that may use the clock/Math.random; generators receive the result. */
export function newSeed(gameId: string): string {
  return `${gameId}:${Date.now().toString(36)}:${Math.floor(Math.random() * 1e6).toString(36)}`;
}
