import { useState } from 'react';
import { cn } from '@/components/ui';

/**
 * A decorative Flow sprite from /game-sprites/<name>.png (transparent, 256px). Always aria-hidden with an empty alt:
 * nothing is said only by the art. If the file is missing it is simply not drawn (nothing else changes).
 */
export function Sprite({ name, size = 96, className }: { name: string; size?: number; className?: string }) {
  const [broken, setBroken] = useState(false);
  if (broken) return null;
  return (
    <img
      src={`/game-sprites/${name}.png`}
      alt=""
      aria-hidden
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setBroken(true)}
      style={{ width: size, height: size }}
      className={cn('pointer-events-none inline-block shrink-0 select-none object-contain', className)}
    />
  );
}
