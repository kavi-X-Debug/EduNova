import type { BadgeRarity } from '@/types';

// Shared by BadgeArt (vector medal) and BadgeImage (Flow image wrapper): tier colours and sparkle layout.

export interface Tier {
  stop1: string; stop2: string; stop3: string;
  rimStroke: string; face: string; glow: string; sparkle: string; tail: string; tailStroke: string;
}
/** Class strings are written out in full so Tailwind can see them. */
export const TIERS: Record<BadgeRarity | 'locked', Tier> = {
  common: {
    stop1: 'text-badge-sky-200', stop2: 'text-badge-sky-400', stop3: 'text-badge-sky-600', rimStroke: 'stroke-badge-sky-800', face: 'fill-badge-sky-600',
    glow: 'fill-badge-sky-200', sparkle: 'fill-badge-sky-400', tail: 'fill-badge-sky-400', tailStroke: 'stroke-badge-sky-800',
  },
  uncommon: {
    stop1: 'text-badge-leaf-200', stop2: 'text-badge-leaf-400', stop3: 'text-badge-leaf-600', rimStroke: 'stroke-badge-leaf-800', face: 'fill-badge-leaf-600',
    glow: 'fill-badge-leaf-200', sparkle: 'fill-badge-leaf-400', tail: 'fill-badge-leaf-400', tailStroke: 'stroke-badge-leaf-800',
  },
  rare: {
    stop1: 'text-badge-sun-200', stop2: 'text-badge-sun-400', stop3: 'text-badge-sun-600', rimStroke: 'stroke-badge-sun-800', face: 'fill-badge-sun-600',
    glow: 'fill-badge-sun-200', sparkle: 'fill-badge-sun-400', tail: 'fill-badge-sun-400', tailStroke: 'stroke-badge-sun-800',
  },
  epic: {
    stop1: 'text-badge-bloom-200', stop2: 'text-badge-bloom-400', stop3: 'text-badge-bloom-600', rimStroke: 'stroke-badge-bloom-800', face: 'fill-badge-bloom-600',
    glow: 'fill-badge-bloom-200', sparkle: 'fill-badge-bloom-400', tail: 'fill-badge-bloom-400', tailStroke: 'stroke-badge-bloom-800',
  },
  locked: {
    stop1: 'text-badge-lock-200', stop2: 'text-badge-lock-400', stop3: 'text-badge-lock-600', rimStroke: 'stroke-badge-lock-800', face: 'fill-badge-lock-800',
    glow: 'fill-badge-lock-200', sparkle: 'fill-badge-lock-400', tail: 'fill-badge-lock-400', tailStroke: 'stroke-badge-lock-800',
  },
};

export const SPARKLE = 'M0 -6C0.7 -2 2 -0.7 6 0C2 0.7 0.7 2 0 6C-0.7 2 -2 0.7 -6 0C-2 -0.7 -0.7 -2 0 -6Z';
export const SPARKS = [
  { x: 12, y: 22, delay: '0s', s: 1 },
  { x: 90, y: 30, delay: '1.2s', s: 0.8 },
  { x: 86, y: 80, delay: '2.2s', s: 1.1 },
  { x: 10, y: 74, delay: '0.6s', s: 0.7 },
];

export const CENTER = 'origin-center [transform-box:fill-box]';
