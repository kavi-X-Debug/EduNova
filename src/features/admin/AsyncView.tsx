import type { ReactNode } from 'react';
import { ErrorState, LoadingState } from '@/components/ui';
import type { AsyncState } from '@/lib';

interface Props<T> {
  state: AsyncState<T>;
  errorText: string;
  children: (data: T) => ReactNode;
}

/** Renders loading / error / data for a useAsync result. */
export function AsyncView<T>({ state, errorText, children }: Props<T>) {
  if (state.error) return <ErrorState description={errorText} onRetry={state.reload} />;
  if (state.data === undefined) return <LoadingState lines={5} />;
  return <>{children(state.data)}</>;
}
