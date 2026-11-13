import { useEffect, useState } from 'react';
import { Sparkle, Star } from 'lucide-react';
import { cn } from '@/components/ui';
import { usePrefersReducedMotion } from '@/lib/a11y';
import { useGt as useT } from '@/features/student/games/useGt';

/**
 * Shared game motion (gx-* keyframes in tailwind.config.ts). Everything here is decorative (aria-hidden, no pointer events,
 * no focus), finite, gentle, and sits behind `motion-ok:`: with reduced motion (OS or html[data-motion="reduced"]) the
 * extras simply do not appear and the pictures show still.
 */

const SPARKS = [
  { pos: '-left-2 -top-2', delay: '0ms', size: 'h-4 w-4' },
  { pos: '-right-2 -top-3', delay: '180ms', size: 'h-5 w-5' },
  { pos: '-right-1 -bottom-2', delay: '360ms', size: 'h-4 w-4' },
  { pos: '-left-1 -bottom-3', delay: '540ms', size: 'h-3.5 w-3.5' },
] as const;

/** A soft green glow and a few slow sparkles around its (relatively positioned) parent. Invisible without motion. */
export function GxSparkles({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('pointer-events-none absolute inset-0', className)}>
      <span className="absolute inset-0 rounded-xl bg-success-500/20 opacity-0 motion-ok:animate-gx-glow" />
      {SPARKS.map((s) => (
        <Sparkle key={s.pos} className={cn('absolute fill-accent-500 text-accent-600 opacity-0 motion-ok:animate-gx-sparkle', s.pos, s.size)} style={{ animationDelay: s.delay }} />
      ))}
    </span>
  );
}

/** Progress as stars: done = filled (a small pop as each one fills), current = ringed, later = outline. The text says it too. */
export function RoundStars({ current, total, label, className }: { current: number; total: number; label: string; className?: string }) {
  const max = Math.min(total, 20);
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <p className="text-lg font-bold text-ink">{label}</p>
      <div role="progressbar" aria-label={label} aria-valuemin={1} aria-valuemax={total} aria-valuenow={current} aria-valuetext={label} className="flex flex-wrap gap-1.5">
        {Array.from({ length: max }, (_, i) => {
          const done = i + 1 < current;
          const now = i + 1 === current;
          return (
            <Star
              key={i}
              aria-hidden
              className={cn(
                'h-6 w-6 shrink-0',
                done && 'fill-accent-500 text-accent-600 motion-ok:animate-gx-star-pop',
                now && 'fill-surface text-brand-600',
                !done && !now && 'fill-surface-sunken text-line-strong',
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

/** The stars earned, filling in one after another (calm count-up). With reduced motion they are all shown at once. */
export function StarsCountUp({ stars, max = 3, className }: { stars: number; max?: number; className?: string }) {
  const t = useT();
  const reduced = usePrefersReducedMotion();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setCount((n) => (n >= stars ? n : n + 1)), 550);
    return () => window.clearInterval(id);
  }, [stars, reduced]);
  const shown = reduced ? stars : count;
  return (
    <span role="img" aria-label={t('games.stars.label', { count: stars, max })} className={cn('inline-flex items-center gap-2', className)}>
      {Array.from({ length: max }, (_, i) => {
        const on = i < shown;
        return <Star key={i} aria-hidden className={cn('h-14 w-14', on ? 'fill-accent-500 text-accent-600 motion-ok:animate-gx-star-pop' : 'fill-transparent text-line-strong')} />;
      })}
    </span>
  );
}

const FLOATERS = [
  { pos: 'left-[5%] top-[4%]', size: 'h-6 w-6', delay: '0ms' },
  { pos: 'left-[13%] top-[26%]', size: 'h-4 w-4', delay: '900ms' },
  { pos: 'right-[6%] top-[6%]', size: 'h-5 w-5', delay: '400ms' },
  { pos: 'right-[14%] top-[28%]', size: 'h-7 w-7', delay: '1300ms' },
] as const;

/** A few stars drifting slowly behind the finish picture (static when motion is reduced). */
export function FloatingStars() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {FLOATERS.map((f) => (
        <Star key={f.pos} className={cn('absolute fill-accent-500 text-accent-600 opacity-80 motion-ok:animate-gx-star-float', f.pos, f.size)} style={{ animationDelay: f.delay }} />
      ))}
    </span>
  );
}

/** A scene picture (alt-less, decorative). If it fails to load nothing is drawn. `zoom` = a very slow gentle zoom. */
export function ScenePicture({ src, width = 640, height = 400, zoom, className, imgClassName, eager }: { src: string; width?: number; height?: number; zoom?: boolean; className?: string; imgClassName?: string; eager?: boolean }) {
  const [broken, setBroken] = useState(false);
  if (broken) return null;
  return (
    <span aria-hidden className={cn('block overflow-hidden', className)}>
      <img
        src={src}
        alt=""
        width={width}
        height={height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        onError={() => setBroken(true)}
        className={cn('h-full w-full select-none object-cover', zoom && 'motion-ok:animate-gx-zoom', imgClassName)}
      />
    </span>
  );
}
