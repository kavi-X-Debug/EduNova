import { useEffect, useState } from 'react';
import { useCountUp } from '@/lib/useCountUp';
import { cn } from './cn';

export interface ProgressBarProps {
  /** 0-100 */
  value: number;
  /** Accessible name (translated). */
  label: string;
  tone?: 'brand' | 'success' | 'warning';
  showValue?: boolean;
  className?: string;
}

const toneCls = { brand: 'bg-brand-500', success: 'bg-success-500', warning: 'bg-warning-500' };

export function ProgressBar({ value, label, tone = 'brand', showValue, className }: ProgressBarProps) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  // Mount at 0 then grow to the value, so the bar animates in (transform only, no layout shift).
  const shown = useCountUp(v);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={v} className="h-2 flex-1 overflow-hidden rounded-sm bg-surface-sunken">
        <div className={cn('relative h-full w-full origin-left overflow-hidden rounded-sm transition-transform duration-slow ease-standard motion-reduce:transition-none', toneCls[tone])} style={{ transform: `scaleX(${ready ? v / 100 : 0})` }}>
          {/* Soft light sweep across the fill (decorative, two passes then rests). */}
          {v > 0 && <span aria-hidden className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent motion-ok:animate-fx-fill-shimmer" />}
        </div>
      </div>
      {showValue && <span className="text-xs font-semibold tabular-nums text-ink-soft">{shown}%</span>}
    </div>
  );
}
