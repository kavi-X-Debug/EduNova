import { useState, type CSSProperties } from 'react';
import { cn } from '@/components/ui';

/**
 * A decorative Flow sprite from public/game-sprites/<name>.png (transparent, 256px). Always alt="" and aria-hidden: the text
 * next to it carries the meaning. If the file is missing it renders nothing, so a game never breaks. It reserves its box
 * (width/height) so there is no layout shift; lazy by default (`eager` for pictures above the fold).
 */
export function Sprite({ name, size = 96, className, eager, style }: { name: string; size?: number; className?: string; eager?: boolean; style?: CSSProperties }) {
  const [broken, setBroken] = useState(false);
  if (broken) return null;
  return (
    <img
      src={`/game-sprites/${name}.png`}
      alt=""
      aria-hidden
      width={size}
      height={size}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      onError={() => setBroken(true)}
      style={style}
      className={cn('pointer-events-none inline-block shrink-0 select-none object-contain', className)}
    />
  );
}
