import { useId, type ReactNode } from 'react';
import { cn } from './cn';

export interface FieldShellProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  children: (a: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
}

/** Shared label + hint + error wrapper used by Input, Select, Textarea. */
export function FieldShell({ label, hint, error, required, className, children }: FieldShellProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {required && <span aria-hidden className="ml-0.5 text-danger-700">*</span>}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && <p id={hintId} className="text-xs text-ink-soft">{hint}</p>}
      {error && <p id={errId} role="alert" className="text-xs font-semibold text-danger-700">{error}</p>}
    </div>
  );
}
