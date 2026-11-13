import { useEffect, useState } from 'react';
import { BadgeArt, type BadgeArtSize } from './BadgeArt';
import { CENTER, SPARKLE, SPARKS, TIERS } from './badgeTiers';
import { cn } from './cn';

export type BadgeImageSize = BadgeArtSize;

const BOX: Record<BadgeImageSize, string> = { sm: 'h-12 w-12', md: 'h-20 w-20', lg: 'h-32 w-32' };
/** Tried in order. */
const EXTENSIONS = ['png', 'webp'] as const;
/** Result of probing public/badges per badge id for this page session: the working URL, or null when no file exists. */
const found = new Map<string, string | null>();

function probe(badgeId: string, onDone: (url: string | null) => void): () => void {
  let cancelled = false;
  const tryNext = (i: number) => {
    if (i >= EXTENSIONS.length) {
      found.set(badgeId, null);
      if (!cancelled) onDone(null);
      return;
    }
    const url = `/badges/${badgeId}.${EXTENSIONS[i]}`;
    const img = new Image();
    img.onload = () => {
      found.set(badgeId, url);
      if (!cancelled) onDone(url);
    };
    img.onerror = () => tryNext(i + 1);
    img.src = url;
  };
  tryNext(0);
  return () => {
    cancelled = true;
  };
}

export interface BadgeImageProps {
  badgeId: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic';
  size?: BadgeImageSize;
  /** Not earned yet: soft grey look, no animation. */
  locked?: boolean;
  /** Accessible name; leave empty when the surrounding text already names the badge (decorative). */
  alt?: string;
  /** One-time pop for a badge that was just earned. */
  pop?: boolean;
  className?: string;
}

function Inner({ badgeId, rarity = 'common', size = 'md', locked, alt = '', pop, className }: BadgeImageProps) {
  // `found` is a module cache, so a badge is probed at most once per page session.
  const [probed, setProbed] = useState<string | null>(null);
  const url = found.has(badgeId) ? (found.get(badgeId) ?? null) : probed;
  useEffect(() => {
    if (found.has(badgeId)) return;
    return probe(badgeId, setProbed);
  }, [badgeId]);

  if (url) {
    // Flow image with the same life as the vector medal: glow ring, twinkles, hover shine, one-time pop (earned only).
    const tier = TIERS[locked ? 'locked' : rarity];
    const alive = !locked;
    return (
      <span className={cn('group relative inline-flex shrink-0', BOX[size], alive && pop && 'motion-ok:animate-badge-pop', className)}>
        {alive && (
          <svg aria-hidden focusable="false" viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
            <circle cx="50" cy="50" r="48" className={cn(CENTER, tier.glow, 'opacity-40 motion-ok:animate-badge-glow')} />
          </svg>
        )}
        <img
          src={url}
          alt={alt}
          width={128}
          height={128}
          decoding="async"
          className={cn('relative h-full w-full object-contain', locked && 'opacity-40 grayscale')}
        />
        {alive && (
          <>
            <span aria-hidden className="pointer-events-none absolute inset-[8%] overflow-hidden rounded-full">
              <span className="absolute inset-y-0 left-0 w-1/4 -translate-x-[130%] -skew-x-[18deg] bg-surface/45 motion-ok:group-focus-within:animate-fx-sheen motion-ok:group-hover:animate-fx-sheen" />
            </span>
            <svg aria-hidden focusable="false" viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
              {SPARKS.map((p) => (
                <g key={`${p.x}-${p.y}`} transform={`translate(${p.x} ${p.y}) scale(${p.s})`}>
                  <path d={SPARKLE} className={cn(CENTER, tier.sparkle, 'opacity-70 motion-ok:animate-badge-twinkle')} style={{ animationDelay: p.delay }} />
                </g>
              ))}
            </svg>
          </>
        )}
      </span>
    );
  }
  return <BadgeArt badgeId={badgeId} rarity={rarity} size={size} locked={locked} alt={alt} pop={pop} className={className} />;
}

/**
 * Badge artwork. A real image at /badges/<badgeId>.png (then .webp), for example one made in Google Flow, always wins (with glow, twinkles, hover shine and pop like the vector medal, earned badges only; locked ones are soft grey and still);
 * until one exists the built-in vector medal (BadgeArt) is shown, so the app looks finished without any files.
 * See docs/BADGES.md.
 */
export function BadgeImage(props: BadgeImageProps) {
  return <Inner key={props.badgeId} {...props} />;
}
