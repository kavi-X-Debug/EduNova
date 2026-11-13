import { useState, type CSSProperties } from 'react';
import { cn } from '@/components/ui';

/**
 * A Google Flow sprite (public/game-sprites/<name>.png, transparent, 256 px). Purely decorative: alt="", aria-hidden,
 * not draggable, no pointer events. If the file is missing or fails to load it renders nothing (the game never
 * depends on the picture). Put motion classes (gated with `motion-ok:`) on `className`.
 */
export function Sprite({ name, size = 64, className, style, eager }: { name: string; size?: number; className?: string; style?: CSSProperties; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      src={`/game-sprites/${name}.png`}
      alt=""
      aria-hidden
      width={size}
      height={size}
      decoding="async"
      loading={eager ? 'eager' : 'lazy'}
      draggable={false}
      className={cn('pointer-events-none max-w-none select-none object-contain', className)}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}
