import type { ReactElement, ReactNode } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

/**
 * Recharts wrappers. Colours come from Tailwind token classes (stroke-/fill-*), never literals.
 * Charts are opaque to AT; pass `summary` (translated) as the accessible text alternative.
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

const stroke = { brand: 'stroke-brand-500', success: 'stroke-success-500', accent: 'stroke-accent-500' } as const;
const fill = { brand: 'fill-brand-500', success: 'fill-success-500', accent: 'fill-accent-500' } as const;
const axisCls = 'fill-ink-soft text-xs';

function Frame({ summary, height, children, footer }: { summary: string; height: number; children: ReactElement; footer?: ReactNode }) {
  return (
    <figure className="m-0">
      <div role="img" aria-label={summary} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
      {footer}
    </figure>
  );
}

export function LineChartWrapper<T extends object>({ data, xKey, yKey, summary, height = 240, tone = 'brand', footer }: ChartProps<T>) {
  return (
    <Frame summary={summary} height={height} footer={footer}>
      <LineChart data={data}>
        <CartesianGrid className="stroke-line" strokeDasharray="3 3" />
        <XAxis dataKey={xKey as never} className={axisCls} tickLine={false} />
        <YAxis className={axisCls} tickLine={false} axisLine={false} />
        <Tooltip />
        <Line type="monotone" dataKey={yKey as never} strokeWidth={2} dot={false} className={stroke[tone]} />
      </LineChart>
    </Frame>
  );
}

export function BarChartWrapper<T extends object>({ data, xKey, yKey, summary, height = 240, tone = 'brand', footer }: ChartProps<T>) {
  return (
    <Frame summary={summary} height={height} footer={footer}>
      <BarChart data={data}>
        <CartesianGrid className="stroke-line" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={xKey as never} className={axisCls} tickLine={false} />
        <YAxis className={axisCls} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip />
        <Bar dataKey={yKey as never} radius={[6, 6, 0, 0]} className={fill[tone]} />
      </BarChart>
    </Frame>
  );
}
