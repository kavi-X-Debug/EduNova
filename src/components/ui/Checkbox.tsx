import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from './cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> {
  label: ReactNode;
  hint?: ReactNode;
}

/** The whole row is the <label>, so the entire 44px-tall row is the click target. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ label, hint, className, ...rest }, ref) {
  const id = useId();
  return (
    <label className={cn('flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md px-1 py-2', className)}>
      <input ref={ref} type="checkbox" aria-describedby={hint ? `${id}-hint` : undefined} className="h-5 w-5 shrink-0 cursor-pointer rounded-sm border-line-strong accent-brand-600" {...rest} />
      <span className="text-sm text-ink">
        {label}
        {hint && <span id={`${id}-hint`} className="block text-xs text-ink-soft">{hint}</span>}
      </span>
    </label>
  );
});
