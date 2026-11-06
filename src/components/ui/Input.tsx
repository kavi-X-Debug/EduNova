import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { FieldShell } from './Field';
import { controlBorder, controlCls } from './fieldStyles';
import { cn } from './cn';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, hint, error, required, className, wrapperClassName, ...rest }, ref) {
  return (
    <FieldShell label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      {({ id, describedBy, invalid }) => (
        <input ref={ref} id={id} required={required} aria-invalid={invalid || undefined} aria-describedby={describedBy} className={cn(controlCls, controlBorder(invalid), className)} {...rest} />
      )}
    </FieldShell>
  );
});
