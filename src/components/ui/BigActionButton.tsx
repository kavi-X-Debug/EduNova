import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn, focusRing } from './cn';

export interface BigActionButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /** Picture before the words (a lucide icon; sized to 24px). */
  icon?: ReactNode;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  /** Render a router link (real link semantics) instead of a <button>. */
  to?: string;
  /** Router location state, only used with `to`. */
  state?: unknown;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
}

const base =
  'fx-shine inline-flex min-h-[56px] items-center justify-center gap-3 rounded-xl px-7 py-3.5 text-lg font-bold transition duration-fast ease-standard motion-ok:active:scale-[0.98] motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50';
const variants = {
  primary: 'border border-transparent bg-brand-600 text-surface shadow-raised hover:bg-brand-700 active:bg-brand-700',
  secondary: 'border-2 border-brand-600 bg-surface text-brand-700 hover:bg-brand-50 active:bg-brand-100',
};

/**
 * The one big primary action on a student screen (56px+ tall, 18px+ text, icon + a few words).
 * Pass `to` to render a router link; otherwise it is a <button>.
 */
export function BigActionButton({ icon, variant = 'primary', fullWidth, to, state, className, children, onClick, type = 'button', ...rest }: BigActionButtonProps) {
  const cls = cn(base, focusRing, variants[variant], fullWidth && 'w-full', className);
  const content = (
    <>
      {icon && (
        <span aria-hidden className="inline-flex shrink-0 [&>svg]:h-6 [&>svg]:w-6">
          {icon}
        </span>
      )}
      <span>{children}</span>
    </>
  );
  if (to !== undefined) {
    return (
      <Link to={to} state={state} className={cls} onClick={onClick} aria-label={rest['aria-label']} aria-describedby={rest['aria-describedby']}>
        {content}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} onClick={onClick} {...rest}>
      {content}
    </button>
  );
}
