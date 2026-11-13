import { useState } from 'react';
import { cn } from '@/components/ui';
import { hashSeed } from './engine/rng';
import { SubjectIcon } from '../learnKit/SubjectIcon';
import type { GameDefinition, GameTone } from '@/types';

/** Full literal class names (Tailwind cannot build them from strings). All colours are tokens. */
const TONES: Record<GameTone, { bg: string; soft: string; strong: string }> = {
  brand: { bg: 'fill-brand-50', soft: 'fill-brand-100', strong: 'fill-brand-500' },
  leaf: { bg: 'fill-badge-leaf-200', soft: 'fill-badge-leaf-400', strong: 'fill-badge-leaf-600' },
  sun: { bg: 'fill-badge-sun-200', soft: 'fill-badge-sun-400', strong: 'fill-badge-sun-600' },
  bloom: { bg: 'fill-badge-bloom-200', soft: 'fill-badge-bloom-400', strong: 'fill-badge-bloom-600' },
  sky: { bg: 'fill-badge-sky-200', soft: 'fill-badge-sky-400', strong: 'fill-badge-sky-600' },
};

/**
 * Game picture. Always drawn as a token-coloured SVG (soft shapes, varied per game id) with the subject icon on top.
 * If `thumbnail.image` (e.g. /games/<id>.png) is set and loads, it replaces the SVG; if it fails the SVG stays. Decorative.
 */
export function GameThumb({ game, className }: { game: GameDefinition; className?: string }) {
  const [broken, setBroken] = useState(false);
  const tone = TONES[game.thumbnail.tone];
  const h = hashSeed(game.id);
  const a = 20 + (h % 50);
  const b = 100 + ((h >> 3) % 50);
  const c = 30 + ((h >> 6) % 40);
  return (
    <div aria-hidden className={cn('relative aspect-[8/5] w-full overflow-hidden rounded-lg', className)}>
      {game.thumbnail.image && !broken ? (
        <img src={game.thumbnail.image} alt="" loading="lazy" decoding="async" draggable={false} className="h-full w-full object-cover" onError={() => setBroken(true)} />
      ) : (
        <svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" focusable="false" className="h-full w-full">
          <rect width="160" height="100" className={tone.bg} />
          <circle cx={a} cy={c} r="34" className={tone.soft} opacity="0.7" />
          <circle cx={b} cy={100 - c / 2} r="42" className={tone.soft} opacity="0.55" />
          <path d={`M0 ${70 + (h % 10)} Q 40 ${50 + (h % 20)} 80 ${72} T 160 ${64 + (h % 12)} V100 H0 Z`} className={tone.strong} opacity="0.35" />
          <circle cx={b - 20} cy={22} r="7" className={tone.strong} opacity="0.5" />
        </svg>
      )}
      {!(game.thumbnail.image && !broken) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <SubjectIcon subject={game.subject} size="lg" />
        </div>
      )}
    </div>
  );
}
