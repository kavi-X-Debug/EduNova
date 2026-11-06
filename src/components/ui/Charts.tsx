import { lazy, Suspense, type ReactNode } from 'react';
import { Skeleton } from './Skeleton';

// Recharts is only downloaded when a chart is actually rendered.
const ChartImpl = lazy(() => import('./ChartsImpl'));

/**
 * Chart wrappers. Colours come from Tailwind token classes (stroke-/fill-*), never literals.
 * Charts are opaque to AT; `summary` (translated) is the accessible text alternative and is
 * always rendered (as the img label and as a screen-reader caption), also while loading.
 */
export interface ChartProps<T extends object> {
  data: T[];
  xKey: keyof T & string;
  yKey: keyof T & string;
  /** Accessible text alternative describing the chart. */
  summary: string;
  height?: number;
  tone?: 'brand' | 'success' | 'accent';
  footer?: ReactNode;
}

function Frame<T extends object>({ kind, data, xKey, yKey, summary, height = 240, tone = 'brand', footer }: ChartProps<T> & { kind: 'line' | 'bar' }) {
  return (
    <figure className="m-0">
      <div role="img" aria-label={summary} style={{ height }}>
        <Suspense fallback={<Skeleton className="h-full w-full" />}>
          <ChartImpl kind={kind} data={data} xKey={xKey} yKey={yKey} tone={tone} />
        </Suspense>
      </div>
      <figcaption className="sr-only">{summary}</figcaption>
      {footer}
    </figure>
  );
}

export function LineChartWrapper<T extends object>(props: ChartProps<T>) {
  return <Frame {...props} kind="line" />;
}

export function BarChartWrapper<T extends object>(props: ChartProps<T>) {
  return <Frame {...props} kind="bar" />;
}
