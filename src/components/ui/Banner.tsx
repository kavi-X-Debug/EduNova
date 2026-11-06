import type { ReactNode } from 'react';
import { HeartHandshake, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from './cn';

export type BannerTone = 'info' | 'success' | 'warning' | 'danger' | 'wellbeing';

const styles: Record<BannerTone, string> = {
  info: 'border-brand-500 bg-brand-50',
  success: 'border-success-500 bg-success-50',
  warning: 'border-warning-500 bg-warning-50',
  danger: 'border-danger-500 bg-danger-50',
  wellbeing: 'border-brand-100 bg-brand-50',
};
const icons: Record<BannerTone, ReactNode> = {
  info: <Info className="h-5 w-5 text-brand-700" />,
  success: <CheckCircle2 className="h-5 w-5 text-success-700" />,
  warning: <AlertTriangle className="h-5 w-5 text-warning-700" />,
  danger: <AlertTriangle className="h-5 w-5 text-danger-700" />,
  wellbeing: <HeartHandshake className="h-5 w-5 text-brand-700" />,
};

export interface BannerProps {
  tone?: BannerTone;
  title?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/** Use tone="wellbeing" for gentle private check-in prompts (role=note, not an alert). Never diagnostic wording. */
export function Banner({ tone = 'info', title, children, actions, className }: BannerProps) {
  const urgent = tone === 'danger' || tone === 'warning';
  return (
    <div role={urgent ? 'alert' : 'note'} className={cn('flex gap-3 rounded-lg border p-4', styles[tone], className)}>
      <span aria-hidden className="mt-0.5 shrink-0">{icons[tone]}</span>
      <div className="flex-1">
        {title && <p className="font-semibold text-ink">{title}</p>}
        <div className="text-sm text-ink-soft">{children}</div>
        {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}
