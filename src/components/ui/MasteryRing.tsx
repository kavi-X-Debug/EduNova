import type { ReactNode } from 'react';
import { cn } from './cn';

export interface MasteryRingProps {
  /** Mastery 0-1 (concept mastery, not an exam prediction). */
  value: number;
  label: string;
  size?: number;
  children?: ReactNode;
  className?: string;
}

export function MasteryRing({ value, label, size = 64, children, className }: MasteryRingProps) {
  const v = Math.max(0, Math.min(1, value));
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div role="img" aria-label={`${label}: ${Math.round(v * 100)}%`} className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-surface-sunken" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v)} className="stroke-brand-500 transition-all motion-reduce:transition-none" />
      </svg>
      <span aria-hidden className="absolute text-xs font-semibold text-ink">{children ?? `${Math.round(v * 100)}%`}</span>
    </div>
  );
}
