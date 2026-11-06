/** Deterministic seeded PRNG so mock data is stable across reloads. */
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rngFor(seed: string): () => number {
  let a = hashString(seed);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const DAY = 86_400_000;
export const daysAgo = (n: number, now = Date.now()) => new Date(now - n * DAY).toISOString();
export const daysFromNow = (n: number, now = Date.now()) => new Date(now + n * DAY).toISOString();
