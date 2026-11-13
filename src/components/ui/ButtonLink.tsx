import { forwardRef, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import type { ButtonSize, ButtonVariant } from './Button';
import { cn, focusRing, touchTarget } from './cn';

export interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'fx-shine bg-brand-600 text-surface hover:bg-brand-700 active:bg-brand-700 border border-transparent',
  secondary: 'bg-surface text-ink border border-line-strong hover:bg-surface-sunken hover:border-ink-faint active:bg-line',
  ghost: 'bg-transparent text-brand-700 border border-transparent hover:bg-brand-50 active:bg-brand-100',
  danger: 'bg-danger-700 text-surface hover:bg-danger-500 active:bg-danger-500 border border-transparent',
};

/** A router <Link> styled like Button: real link semantics, 44px target, focus ring. */
export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink(
  { variant = 'primary', size = 'md', leftIcon, rightIcon, fullWidth, className, children, ...rest },
  ref,
) {
  return (
    <Link
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition duration-fast ease-standard motion-ok:active:scale-[0.98] motion-reduce:transition-none',
        touchTarget,
        focusRing,
        size === 'lg' ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm',
        variants[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {leftIcon && <span aria-hidden className="inline-flex">{leftIcon}</span>}
      {children}
      {rightIcon && <span aria-hidden className="inline-flex">{rightIcon}</span>}
    </Link>
  );
});
