import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

/** Recharts internals. Loaded lazily by Charts.tsx; do not import from the barrel. */
export interface ChartImplProps {
  kind: 'line' | 'bar';
  data: object[];
  xKey: string;
  yKey: string;
  tone: 'brand' | 'success' | 'accent';
}

const stroke = { brand: 'stroke-brand-500', success: 'stroke-success-500', accent: 'stroke-accent-500' } as const;
const fill = { brand: 'fill-brand-500', success: 'fill-success-500', accent: 'fill-accent-500' } as const;
const axisCls = 'fill-ink-soft text-xs';

// The default Recharts tooltip is mouse-only and shows raw English dataKeys, so it is omitted;
// the visible/AT text summary carries the values.
export default function ChartImpl({ kind, data, xKey, yKey, tone }: ChartImplProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      {kind === 'line' ? (
        <LineChart data={data}>
          <CartesianGrid className="stroke-line" strokeDasharray="3 3" />
          <XAxis dataKey={xKey} className={axisCls} tickLine={false} />
          <YAxis className={axisCls} tickLine={false} axisLine={false} />
          <Line type="monotone" dataKey={yKey} strokeWidth={2} dot={false} className={stroke[tone]} />
        </LineChart>
      ) : (
        <BarChart data={data}>
          <CartesianGrid className="stroke-line" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xKey} className={axisCls} tickLine={false} />
          <YAxis className={axisCls} tickLine={false} axisLine={false} allowDecimals={false} />
          <Bar dataKey={yKey} radius={[6, 6, 0, 0]} className={fill[tone]} />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}
