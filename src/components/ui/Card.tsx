import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  as?: 'div' | 'section' | 'article';
  title?: ReactNode;
  actions?: ReactNode;
  padded?: boolean;
  raised?: boolean;
  /** Hover/focus-within affordance for cards that are (or contain) a link or button. Adds a subtle lift. */
  interactive?: boolean;
}

export function Card({ as: Tag = 'div', title, actions, padded = true, raised, interactive, className, children, ...rest }: CardProps) {
  return (
    <Tag className={cn('rounded-lg border border-line bg-surface', raised ? 'shadow-raised' : 'shadow-card', interactive && 'transition duration-base ease-standard hover:border-line-strong hover:shadow-raised focus-within:border-line-strong motion-ok:hover:-translate-y-0.5', padded && 'p-4 md:p-6', className)} {...rest}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h3 className="text-lg font-semibold text-ink">{title}</h3>}
          {actions}
        </div>
      )}
      {children}
    </Tag>
  );
}
