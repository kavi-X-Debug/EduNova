import { useEffect, useState, type ReactNode } from 'react';
import type { ReadinessBand } from '@/types';
import { cn } from './cn';

/** Fixed arcs per band, so the ring cannot encode a precise level. */
const ARC: Record<ReadinessBand, number> = { building: 0.25, developing: 0.5, secure: 0.75, strong: 1 };

function bandFromValue(v: number): ReadinessBand {
  if (v >= 0.75) return 'strong';
  if (v >= 0.5) return 'secure';
  if (v >= 0.25) return 'developing';
  return 'building';
}

export interface MasteryRingProps {
  /** Preferred. Drives a fixed arc (25/50/75/100%). */
  band?: ReadinessBand;
  /** @deprecated Use `band`. A 0-1 value is quantised to a band; it is never shown or drawn precisely. */
  value?: number;
  /** Accessible name (translated). Include the band wording, never a percentage. */
  label: string;
  size?: number;
  /** Centre content: a band label or icon. No automatic number. */
  children?: ReactNode;
  className?: string;
}

export function MasteryRing({ band, value, label, size = 64, children, className }: MasteryRingProps) {
  const b: ReadinessBand = band ?? bandFromValue(Math.max(0, Math.min(1, value ?? 0)));
  const v = ARC[b];
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  // Draw from empty to the band's arc after mount.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);
  return (
    <div role="img" aria-label={label} className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-surface-sunken" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - (ready ? v : 0))} className="stroke-brand-500 transition-[stroke-dashoffset] duration-slow ease-standard motion-reduce:transition-none" />
      </svg>
      <span aria-hidden className="absolute text-xs font-semibold text-ink">{children}</span>
    </div>
  );
}
