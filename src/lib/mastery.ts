import type { Mastery, ReadinessBand } from '@/types';

/** Single source of truth: mastery level (0-1) -> readiness band. Never a predicted mark. */
export const BAND_THRESHOLDS = { developing: 0.35, secure: 0.6, strong: 0.82 } as const;
export const BAND_ORDER: ReadinessBand[] = ['building', 'developing', 'secure', 'strong'];

export function bandFromLevel(level: number): ReadinessBand {
  const l = Math.min(1, Math.max(0, level));
  if (l >= BAND_THRESHOLDS.strong) return 'strong';
  if (l >= BAND_THRESHOLDS.secure) return 'secure';
  if (l >= BAND_THRESHOLDS.developing) return 'developing';
  return 'building';
}

export function averageLevel(items: Pick<Mastery, 'level'>[]): number {
  if (items.length === 0) return 0;
  return items.reduce((s, m) => s + m.level, 0) / items.length;
}

export function bandFromMastery(items: Pick<Mastery, 'level'>[]): ReadinessBand {
  return bandFromLevel(averageLevel(items));
}

export function bandRank(band: ReadinessBand): number {
  return BAND_ORDER.indexOf(band);
}

export function makeMastery(conceptId: string, level: number, updatedAt: string): Mastery {
  const l = Math.min(1, Math.max(0, level));
  return { conceptId, level: l, band: bandFromLevel(l), updatedAt };
}
