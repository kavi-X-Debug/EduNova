import { useState, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/components/ui';

/**
 * A decorative Flow sprite from `public/game-sprites/<name>.png` (256px, transparent). Always `alt=""` and `aria-hidden`:
 * names and meaning stay in real text next to it. If the file fails to load, `fallback` is drawn, else an empty box of the same size stays (no layout shift).
 */
export function Sprite({ name, size = 64, className, eager, style, fallback }: { name: string; size?: number; className?: string; eager?: boolean; style?: CSSProperties; fallback?: ReactNode }) {
  const [broken, setBroken] = useState(false);
  const box: CSSProperties = { width: size, height: size, ...style };
  if (broken && fallback) return <>{fallback}</>;
  if (broken) return <span aria-hidden className={cn('inline-block shrink-0', className)} style={box} />;
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
      className={cn('inline-block shrink-0 select-none object-contain', className)}
      style={box}
    />
  );
}
