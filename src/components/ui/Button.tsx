import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn, focusRing, touchTarget } from './cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Accessible text announced while loading (already translated by caller). */
  loadingLabel?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-surface hover:bg-brand-700 active:bg-brand-700 border border-transparent',
  secondary: 'bg-surface text-ink border border-line-strong hover:bg-surface-sunken hover:border-ink-faint active:bg-line',
  ghost: 'bg-transparent text-brand-700 border border-transparent hover:bg-brand-50 active:bg-brand-100',
  danger: 'bg-danger-700 text-surface hover:bg-danger-500 active:bg-danger-500 border border-transparent',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, loadingLabel, leftIcon, rightIcon, fullWidth, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition duration-fast ease-standard motion-ok:active:scale-[0.98] motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
        touchTarget,
        focusRing,
        size === 'lg' ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm',
        variants[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 aria-hidden className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : leftIcon}
      {loading && loadingLabel ? <span className="sr-only">{loadingLabel}</span> : null}
      {children}
      {!loading && rightIcon}
    </button>
  );
});
