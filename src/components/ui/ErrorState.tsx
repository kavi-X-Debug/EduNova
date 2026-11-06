import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { cn } from './cn';

export interface ErrorStateProps {
  title?: ReactNode;
  description?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({ title, description, onRetry, retryLabel, className }: ErrorStateProps) {
  const { t } = useTranslation();
  return (
    <div role="alert" className={cn('flex flex-col items-center gap-3 rounded-lg border border-danger-500 bg-danger-50 p-8 text-center', className)}>
      <AlertTriangle aria-hidden className="h-8 w-8 text-danger-700" />
      <h3 className="text-lg font-semibold text-danger-700">{title ?? t('ui.error.title')}</h3>
      {description && <p className="max-w-md text-sm text-ink-soft">{description}</p>}
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          {retryLabel ?? t('ui.error.retry')}
        </Button>
      )}
    </div>
  );
}
