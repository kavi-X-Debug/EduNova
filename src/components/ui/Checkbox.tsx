import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from './cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> {
  label: ReactNode;
  hint?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ label, hint, className, ...rest }, ref) {
  const id = useId();
  return (
    <div className={cn('flex min-h-[44px] items-start gap-3 py-2', className)}>
      <input ref={ref} id={id} type="checkbox" aria-describedby={hint ? `${id}-hint` : undefined} className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded-sm border-line-strong accent-brand-600 outline-none focus-visible:shadow-focus" {...rest} />
      <label htmlFor={id} className="cursor-pointer text-sm text-ink">
        {label}
        {hint && <span id={`${id}-hint`} className="block text-xs text-ink-soft">{hint}</span>}
      </label>
    </div>
  );
});
