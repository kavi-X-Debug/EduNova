import { useState, type CSSProperties } from 'react';
import { cn } from '@/components/ui';

export interface SpriteProps {
  /** File name in public/game-sprites without the extension, e.g. "frog". */
  name: string;
  /** Square pixel size (width and height; Tailwind classes or `style` may override). */
  size?: number;
  className?: string;
  style?: CSSProperties;
  /** Above the fold: load now instead of lazily. */
  eager?: boolean;
  /** Called once if the picture is missing, so a game can fall back to something else. */
  onMissing?: () => void;
}

/**
 * A decorative Google Flow sprite (public/game-sprites/<name>.png, transparent, 256 px). Never carries meaning:
 * alt is empty, hidden from screen readers, not draggable, no pointer events. A missing file just turns invisible
 * (same size, so no layout shift) and calls `onMissing`; the game never depends on the picture.
 * Put motion classes (gated with `motion-ok:`) on `className`.
 */
export function Sprite({ name, size = 64, className, style, eager, onMissing }: SpriteProps) {
  const [broken, setBroken] = useState(false);
  return (
    <img
      src={`/game-sprites/${name}.png`}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      decoding="async"
      loading={eager ? 'eager' : 'lazy'}
      draggable={false}
      onError={() => {
        setBroken(true);
        onMissing?.();
      }}
      className={cn('pointer-events-none inline-block max-w-none shrink-0 select-none object-contain', broken && 'invisible', className)}
      style={{ width: size, height: size, ...style }}
    />
  );
}
