import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from './cn';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> {
  label: ReactNode;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio({ label, className, ...rest }, ref) {
  const id = useId();
  return (
    <div className={cn('flex min-h-[44px] items-center gap-3 py-2', className)}>
      <input ref={ref} id={id} type="radio" className="h-5 w-5 shrink-0 cursor-pointer accent-brand-600 outline-none focus-visible:shadow-focus" {...rest} />
      <label htmlFor={id} className="cursor-pointer text-sm text-ink">{label}</label>
    </div>
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
  return (
    <fieldset className={cn('flex flex-col', className)}>
      <legend className="mb-1 text-sm font-semibold text-ink">{legend}</legend>
      {options.map((o) => (
        <Radio key={o.value} name={name} value={o.value} label={o.label} disabled={o.disabled} checked={value === o.value} onChange={() => onChange(o.value)} />
      ))}
      {error && <p role="alert" className="text-xs font-semibold text-danger-700">{error}</p>}
    </fieldset>
  );
}
