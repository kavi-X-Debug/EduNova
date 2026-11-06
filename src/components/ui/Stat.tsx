import type { ReactNode } from 'react';
import { cn } from './cn';

export interface StatProps {
  label: ReactNode;
  value: ReactNode;
  helper?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function Stat({ label, value, helper, icon, className }: StatProps) {
  return (
    <div className={cn('rounded-lg border border-line bg-surface p-4 shadow-card', className)}>
      <dl>
        <dt className="flex items-center gap-2 text-sm text-ink-soft">
          {icon && <span aria-hidden className="inline-flex text-brand-600">{icon}</span>}
          {label}
        </dt>
        <dd className="mt-1 text-2xl font-bold text-ink">{value}</dd>
        {helper && <dd className="mt-1 text-xs text-ink-soft">{helper}</dd>}
      </dl>
    </div>
  );
}
