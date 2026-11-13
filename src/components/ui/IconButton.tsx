import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn, focusRing, touchTarget } from './cn';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required accessible name (translated by caller). */
  label: string;
  icon: ReactNode;
  variant?: 'ghost' | 'secondary';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, icon, variant = 'ghost', className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-ink-soft transition duration-fast ease-standard hover:bg-surface-sunken hover:text-ink active:bg-line motion-ok:active:scale-95 motion-reduce:transition-none disabled:opacity-50 disabled:active:scale-100',
        variant === 'secondary' && 'border border-line-strong bg-surface',
        touchTarget,
        focusRing,
        className,
      )}
      {...rest}
    >
      <span aria-hidden className="inline-flex">{icon}</span>
    </button>
  );
});
