import { forwardRef, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { FieldShell } from './Field';
import { controlBorder, controlCls } from './fieldStyles';
import { cn } from './cn';

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ label, hint, error, required, rows = 4, className, wrapperClassName, ...rest }, ref) {
  return (
    <FieldShell label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      {({ id, describedBy, invalid }) => (
        <textarea ref={ref} id={id} rows={rows} required={required} aria-invalid={invalid || undefined} aria-describedby={describedBy} className={cn(controlCls, controlBorder(invalid), className)} {...rest} />
      )}
    </FieldShell>
  );
});
