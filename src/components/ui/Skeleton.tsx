import { useTranslation } from 'react-i18next';
import { cn } from './cn';

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-md bg-surface-sunken motion-reduce:animate-none', className)} />;
}

export interface LoadingStateProps {
  /** Translated status text; defaults to ui.common.loading. */
  label?: string;
  lines?: number;
  className?: string;
}

export function LoadingState({ label, lines = 3, className }: LoadingStateProps) {
  const { t } = useTranslation();
  return (
    <div role="status" aria-busy="true" className={cn('flex flex-col gap-3', className)}>
      <span className="sr-only">{label ?? t('ui.common.loading')}</span>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={i === lines - 1 ? 'h-4 w-2/3' : 'h-4 w-full'} />
      ))}
    </div>
  );
}
