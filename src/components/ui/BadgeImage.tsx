import { useEffect, useState } from 'react';
import { BadgeArt, type BadgeArtSize } from './BadgeArt';
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
    return <img src={url} alt={alt} className={cn('shrink-0 object-contain', BOX[size], locked && 'opacity-40 grayscale', className)} />;
  }
  return <BadgeArt badgeId={badgeId} rarity={rarity} size={size} locked={locked} alt={alt} pop={pop} className={className} />;
}

/**
 * Badge artwork. A real image at /badges/<badgeId>.png (then .webp), for example one made in Google Flow, always wins;
 * until one exists the built-in vector medal (BadgeArt) is shown, so the app looks finished without any files.
 * See docs/BADGES.md.
 */
export function BadgeImage(props: BadgeImageProps) {
  return <Inner key={props.badgeId} {...props} />;
}
