import { useEffect, useState } from 'react';
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
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={v} className="h-2 flex-1 overflow-hidden rounded-sm bg-surface-sunken">
        <div className={cn('h-full w-full origin-left rounded-sm transition-transform duration-slow ease-standard motion-reduce:transition-none', toneCls[tone])} style={{ transform: `scaleX(${ready ? v / 100 : 0})` }} />
      </div>
      {showValue && <span className="text-xs font-semibold text-ink-soft">{v}%</span>}
    </div>
  );
}
