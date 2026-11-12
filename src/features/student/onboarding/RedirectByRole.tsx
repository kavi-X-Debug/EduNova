import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ErrorState, LoadingState } from '@/components/ui';
import { useAsync } from '@/lib';
import type { Role } from '@/types';
import { destinationFor } from './destination';

/** Resolves the right landing page (profile lookup for students) and redirects there. */
export function RedirectByRole({ role, userId, from }: { role: Role; userId: string; from?: unknown }) {
  const { t } = useTranslation();
  const dest = useAsync(() => destinationFor(role, userId, from), [role, userId, from]);
  if (dest.error) return <ErrorState description={t('errors.generic')} onRetry={dest.reload} retryLabel={t('common.action.retry')} />;
  if (dest.data === undefined) return <LoadingState label={t('a11y.loading')} lines={3} />;
  return <Navigate to={dest.data} replace />;
}
