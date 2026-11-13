import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-surface-sunken text-ink-soft border-line',
  brand: 'bg-brand-50 text-brand-700 border-brand-100',
  success: 'bg-success-50 text-success-700 border-success-50',
  warning: 'bg-warning-50 text-warning-700 border-warning-50',
  danger: 'bg-danger-50 text-danger-700 border-danger-50',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  icon?: ReactNode;
}

export function Badge({ tone = 'neutral', icon, className, children, ...rest }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-sm border transition-colors duration-fast ease-standard px-2 py-0.5 text-xs font-semibold', tones[tone], className)} {...rest}>
      {icon && <span aria-hidden className="inline-flex">{icon}</span>}
      {children}
    </span>
  );
}
