import type { HTMLAttributes, PointerEvent, ReactNode } from 'react';
import { cn } from './cn';

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  as?: 'div' | 'section' | 'article';
  title?: ReactNode;
  actions?: ReactNode;
  padded?: boolean;
  raised?: boolean;
  /** Hover/focus-within affordance for cards that are (or contain) a link or button. Adds a subtle lift. */
  interactive?: boolean;
  /** Soft cursor-follow glow for hero cards. Mouse pointers only; never hides content. */
  spotlight?: boolean;
}

export function Card({ as: Tag = 'div', title, actions, padded = true, raised, interactive, spotlight, className, children, onPointerMove, ...rest }: CardProps) {
  const follow = (e: PointerEvent<HTMLElement>) => {
    onPointerMove?.(e);
    if (!spotlight || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <Tag className={cn('rounded-lg border border-line bg-surface', raised ? 'shadow-raised' : 'shadow-card', interactive && 'group/card transition duration-base ease-standard hover:border-line-strong hover:shadow-fx-glow focus-within:border-line-strong focus-within:shadow-fx-glow motion-ok:hover:-translate-y-1 motion-ok:focus-within:-translate-y-1', spotlight && 'relative isolate before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:opacity-0 before:transition-opacity before:duration-slow before:ease-standard before:bg-[radial-gradient(260px_circle_at_var(--mx,50%)_var(--my,50%),theme(colors.brand.500/0.10),transparent_70%)] motion-ok:hover:before:opacity-100', padded && 'p-4 md:p-6', className)} onPointerMove={spotlight ? follow : onPointerMove} {...rest}>
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
