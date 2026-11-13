import { useState, type ComponentType } from 'react';
import {
  BookOpen, Flag, Flame, GraduationCap, Layers, Lock, Medal, MessageCircle, PenLine, Repeat, RotateCcw, SearchCheck, Sunrise, Target, Trophy,
} from 'lucide-react';
import { cn } from './cn';

type IconType = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
export type BadgeImageSize = 'sm' | 'md' | 'lg';

/** Fallback icon per badge id (used until the artwork in public/badges/<id>.png exists). */
const ICONS: Record<string, IconType> = {
  'first-lesson': BookOpen, 'practice-pal': PenLine, 'unit-complete': Layers, 'unit-trio': Layers, 'term-complete': GraduationCap,
  'strong-quiz': Target, 'strong-quiz-3': Medal, 'streak-3': Flame, 'streak-7': Flame, 'first-review': RotateCcw, 'revision-streak': Repeat,
  'welcome-back': Sunrise, 'first-question': MessageCircle, 'source-checker': SearchCheck, 'quest-finisher': Flag, 'quest-trio': Trophy,
};

const RING: Record<string, string> = {
  common: 'border-brand-500 bg-brand-50 text-brand-700',
  uncommon: 'border-success-500 bg-success-50 text-success-700',
  rare: 'border-accent-600 bg-warning-50 text-warning-700',
  epic: 'border-brand-700 bg-brand-100 text-brand-700',
};
const BOX: Record<BadgeImageSize, string> = { sm: 'h-12 w-12', md: 'h-20 w-20', lg: 'h-32 w-32' };
const ICON: Record<BadgeImageSize, string> = { sm: 'h-6 w-6', md: 'h-9 w-9', lg: 'h-14 w-14' };
/** Tried in order; when none exists the icon ring is shown. */
const EXTENSIONS = ['png', 'webp'] as const;

export interface BadgeImageProps {
  badgeId: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic';
  size?: BadgeImageSize;
  /** Greyed out (not earned yet). */
  locked?: boolean;
  /** Accessible name; leave empty when the surrounding text already names the badge (decorative). */
  alt?: string;
  className?: string;
}

function Inner({ badgeId, rarity = 'common', size = 'md', locked, alt = '', className }: BadgeImageProps) {
  const [attempt, setAttempt] = useState(0);
  const Icon = ICONS[badgeId] ?? Medal;
  const label = alt || undefined;
  if (attempt < EXTENSIONS.length) {
    return (
      <img
        src={`/badges/${badgeId}.${EXTENSIONS[attempt]}`}
        alt={alt}
        onError={() => setAttempt((n) => n + 1)}
        className={cn('shrink-0 object-contain', BOX[size], locked && 'opacity-40 grayscale', className)}
      />
    );
  }
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn('relative inline-flex shrink-0 items-center justify-center rounded-full border-4', BOX[size], locked ? 'border-line-strong bg-surface-sunken text-ink-faint' : RING[rarity], className)}
    >
      <Icon aria-hidden className={ICON[size]} />
      {locked && <Lock aria-hidden className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-surface p-0.5 text-ink-soft" />}
    </span>
  );
}

/**
 * Badge artwork. Loads /badges/<badgeId>.png (then .webp); if neither file exists it falls back to a
 * token-coloured icon inside a ring, so the app works before the artwork is added (see docs/BADGES.md).
 */
export function BadgeImage(props: BadgeImageProps) {
  return <Inner key={props.badgeId} {...props} />;
}
