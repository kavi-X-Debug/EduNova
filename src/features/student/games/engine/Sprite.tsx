import { useState } from 'react';
import { cn } from '@/components/ui';

export interface SpriteProps {
  /** File name in public/game-sprites without the extension, e.g. "frog". */
  name: string;
  /** Square pixel size (width and height attributes; Tailwind classes may override). */
  size?: number;
  className?: string;
  /** Above the fold: load now instead of lazily. */
  eager?: boolean;
  /** Called once if the picture is missing, so a game can fall back to something else. */
  onMissing?: () => void;
}

/** A decorative Google Flow sprite (transparent PNG). Never carries meaning: alt is empty and it is hidden from screen readers. A missing file just turns invisible (same size, no layout shift). */
export function Sprite({ name, size = 96, className, eager, onMissing }: SpriteProps) {
  const [broken, setBroken] = useState(false);
  return (
    <img
      src={`/game-sprites/${name}.png`}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      onError={() => {
        setBroken(true);
        onMissing?.();
      }}
      className={cn('pointer-events-none inline-block shrink-0 select-none object-contain', broken && 'invisible', className)}
    />
  );
}
