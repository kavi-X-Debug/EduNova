import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from './cn';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> {
  label: ReactNode;
}

/** The whole row is the <label>, so the entire 44px-tall row is the click target. */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio({ label, className, ...rest }, ref) {
  return (
    <label className={cn('flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md px-1 py-2', className)}>
      <input ref={ref} type="radio" className="h-5 w-5 shrink-0 cursor-pointer accent-brand-600" {...rest} />
      <span className="text-sm text-ink">{label}</span>
    </label>
  );
});

export interface RadioGroupOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  legend: ReactNode;
  options: RadioGroupOption[];
  value: string;
  onChange: (value: string) => void;
  error?: ReactNode;
  className?: string;
}

export function RadioGroup({ name, legend, options, value, onChange, error, className }: RadioGroupProps) {
  const errId = useId();
  return (
    <fieldset className={cn('flex flex-col', className)} aria-describedby={error ? errId : undefined} aria-invalid={error ? true : undefined}>
      <legend className="mb-1 text-sm font-semibold text-ink">{legend}</legend>
      {options.map((o) => (
        <Radio key={o.value} name={name} value={o.value} label={o.label} disabled={o.disabled} checked={value === o.value} onChange={() => onChange(o.value)} />
      ))}
      {error && <p id={errId} role="alert" className="text-xs font-semibold text-danger-700">{error}</p>}
    </fieldset>
  );
}
