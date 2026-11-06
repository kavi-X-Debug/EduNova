import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react';
import { FieldShell } from './Field';
import { controlBorder, controlCls } from './fieldStyles';
import { cn } from './cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: ReactNode;
  options: SelectOption[];
  placeholder?: string;
  hint?: ReactNode;
  error?: ReactNode;
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ label, options, placeholder, hint, error, required, className, wrapperClassName, ...rest }, ref) {
  return (
    <FieldShell label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      {({ id, describedBy, invalid }) => (
        <select ref={ref} id={id} required={required} aria-invalid={invalid || undefined} aria-describedby={describedBy} className={cn(controlCls, controlBorder(invalid), className)} {...rest}>
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
          ))}
        </select>
      )}
    </FieldShell>
  );
});
