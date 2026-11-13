import { useId, type ComponentType } from 'react';
import {
  Award, Boxes, Brain, CalendarCheck, Flag, Flame, GraduationCap, Layers, Lightbulb, MessageCircleQuestion, Mountain, PenLine, SearchCheck, Sprout, Sunrise, Target,
} from 'lucide-react';
import { badgeById } from '@/lib/rewards';
import type { BadgeCategory, BadgeRarity } from '@/types';
import { cn } from './cn';

/**
 * Built-in vector badge medal. Drawn in code so the app looks finished without any artwork file; a real image at
 * /badges/<id>.png|webp (see BadgeImage and docs/BADGES.md) replaces it automatically.
 *
 * Shape comes from the badge category, colours from the rarity tier (Everyday, Growing, Bright, Shining), the glyph
 * is unique per badge. Every colour is a Tailwind token class (tailwind.config.ts `badge.*`); gradient stops use
 * stop-color: currentColor so no colour literal lives in this file. Motion uses the `badge-*` keyframe tokens behind
 * the `motion-ok:` variant, so reduced motion (OS or html[data-motion="reduced"]) gets a calm static medal.
 */
export type BadgeArtSize = 'sm' | 'md' | 'lg';

type IconType = ComponentType<{ x?: number; y?: number; width?: number; height?: number; strokeWidth?: number; className?: string; 'aria-hidden'?: boolean }>;

const GLYPHS: Record<string, IconType> = {
  'first-lesson': Sprout, 'practice-pal': PenLine, 'unit-complete': Layers, 'unit-trio': Boxes, 'term-complete': GraduationCap,
  'strong-quiz': Target, 'strong-quiz-3': Award, 'streak-3': Flame, 'streak-7': CalendarCheck, 'first-review': Lightbulb, 'revision-streak': Brain,
  'welcome-back': Sunrise, 'first-question': MessageCircleQuestion, 'source-checker': SearchCheck, 'quest-finisher': Flag, 'quest-trio': Mountain,
};

interface Tier {
  stop1: string; stop2: string; stop3: string;
  rimStroke: string; face: string; glow: string; sparkle: string; tail: string; tailStroke: string;
}
/** Class strings are written out in full so Tailwind can see them. */
const TIERS: Record<BadgeRarity | 'locked', Tier> = {
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

const r2 = (n: number) => Math.round(n * 100) / 100;
/** Closed polar path around (50,50): radius(angle) in 0..360 steps. */
function polar(steps: number, radius: (a: number, i: number) => number): string {
  let d = '';
  for (let i = 0; i < steps; i += 1) {
    const a = (i / steps) * Math.PI * 2 - Math.PI / 2;
    const r = radius(a, i);
    d += `${i === 0 ? 'M' : 'L'}${r2(50 + r * Math.cos(a))} ${r2(50 + r * Math.sin(a))}`;
  }
  return `${d}Z`;
}

/** Medal outline per category: learning = shield, mastery = scalloped rosette, habits = hexagon, curiosity = round, quests = 8-point star. */
const SHAPES: Record<BadgeCategory, string> = {
  learning: 'M50 6L86 19V50C86 72 70 86 50 94C30 86 14 72 14 50V19Z',
  mastery: polar(160, (a) => 41 + 3 * Math.cos(12 * (a + Math.PI / 2))),
  habits: 'M50 7L87.5 28.5V71.5L50 93L12.5 71.5V28.5Z',
  curiosity: 'M50 7A43 43 0 1 1 49.99 7Z',
  quests: polar(16, (_a, i) => (i % 2 === 0 ? 45 : 35)),
};

const SPARKLE = 'M0 -6C0.7 -2 2 -0.7 6 0C2 0.7 0.7 2 0 6C-0.7 2 -2 0.7 -6 0C-2 -0.7 -0.7 -2 0 -6Z';
const SPARKS = [
  { x: 12, y: 22, delay: '0s', s: 1 },
  { x: 90, y: 30, delay: '1.2s', s: 0.8 },
  { x: 86, y: 80, delay: '2.2s', s: 1.1 },
  { x: 10, y: 74, delay: '0.6s', s: 0.7 },
];

const BOX: Record<BadgeArtSize, string> = { sm: 'h-12 w-12', md: 'h-20 w-20', lg: 'h-32 w-32' };
const FALLBACK_GLYPH: IconType = Award;
const CENTER = 'origin-center [transform-box:fill-box]';

export interface BadgeArtProps {
  badgeId: string;
  rarity?: BadgeRarity;
  size?: BadgeArtSize;
  /** Not earned yet: a soft grey silhouette, no animation. */
  locked?: boolean;
  /** Accessible name; leave empty when the surrounding text already names the badge (decorative). */
  alt?: string;
  /** One-time pop-in for a badge that was just earned (skipped when motion is reduced). */
  pop?: boolean;
  className?: string;
}

export function BadgeArt({ badgeId, rarity = 'common', size = 'md', locked, alt = '', pop, className }: BadgeArtProps) {
  const uid = useId().replace(/:/g, '');
  const gradId = `bg${uid}`;
  const clipId = `bc${uid}`;
  const tier = TIERS[locked ? 'locked' : rarity];
  const category: BadgeCategory = badgeById(badgeId)?.category ?? 'learning';
  const shape = SHAPES[category];
  const Glyph = GLYPHS[badgeId] ?? FALLBACK_GLYPH;
  const ribbon = !locked && (rarity === 'rare' || rarity === 'epic');
  const alive = !locked;
  const label = alt || undefined;

  return (
    <span className={cn('group relative inline-flex shrink-0', BOX[size], alive && pop && 'motion-ok:animate-badge-pop', className)}>
      <svg
        viewBox="0 0 100 100"
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        focusable="false"
        className="h-full w-full overflow-visible"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="currentColor" className={tier.stop1} />
            <stop offset="0.5" stopColor="currentColor" className={tier.stop2} />
            <stop offset="1" stopColor="currentColor" className={tier.stop3} />
          </linearGradient>
          <clipPath id={clipId}>
            <path d={shape} />
          </clipPath>
        </defs>

        {alive && <circle aria-hidden cx="50" cy="50" r="48" className={cn(CENTER, tier.glow, 'opacity-40 motion-ok:animate-badge-glow')} />}

        <g aria-hidden>
          {ribbon && (
            <g className={cn(tier.tail, tier.tailStroke)} strokeWidth="2.5" strokeLinejoin="round">
              <path d="M33 70L25 97L38 91L45 99L50 74Z" />
              <path d="M67 70L75 97L62 91L55 99L50 74Z" />
            </g>
          )}
          <g transform="translate(50 46) scale(0.84) translate(-50 -50)">
            <path d={shape} fill={`url(#${gradId})`} className={tier.rimStroke} strokeWidth="3.5" strokeLinejoin="round" />
            <g transform="translate(50 50) scale(0.74) translate(-50 -50)">
              <path d={shape} className={cn(tier.face, 'stroke-surface/60')} strokeWidth="3" strokeLinejoin="round" />
            </g>
            <path d="M24 30C34 16 66 14 78 28" fill="none" className="stroke-surface/50" strokeWidth="3.5" strokeLinecap="round" />
            {alive && (
              <g clipPath={`url(#${clipId})`}>
                <polygon
                  points="34,0 48,0 28,100 14,100"
                  className="-translate-x-[70px] fill-surface/45 motion-ok:group-focus-within:animate-badge-shine motion-ok:group-hover:animate-badge-shine"
                />
              </g>
            )}
            <Glyph x={29} y={29} width={42} height={42} strokeWidth={2.2} className="text-surface" aria-hidden />
          </g>
          {ribbon && rarity === 'epic' && <path d={SPARKLE} transform="translate(50 6) scale(1.1)" className="fill-badge-bloom-200 stroke-badge-bloom-800" strokeWidth="1" />}
          {alive && size !== 'sm' && SPARKS.map((p) => (
            <g key={`${p.x}-${p.y}`} transform={`translate(${p.x} ${p.y}) scale(${p.s})`}>
              <path d={SPARKLE} className={cn(CENTER, tier.sparkle, 'opacity-70 motion-ok:animate-badge-twinkle')} style={{ animationDelay: p.delay }} />
            </g>
          ))}
        </g>
      </svg>
    </span>
  );
}
