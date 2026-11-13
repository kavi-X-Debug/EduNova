import { cloneElement, useId, useState, type ReactElement } from 'react';
import { cn } from './cn';

export interface TooltipProps {
  content: string;
  children: ReactElement<Record<string, unknown>>;
}

/** Hover and keyboard-focus tooltip. Esc dismisses. Child must accept aria-describedby. */
export function Tooltip({ content, children }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
    >
      {cloneElement(children, { 'aria-describedby': id })}
      <span
        id={id}
        role="tooltip"
        className={cn('pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 w-max max-w-xs -translate-x-1/2 rounded-sm bg-ink px-2 py-1 text-xs text-surface shadow-raised transition-[opacity,visibility] duration-fast ease-standard', open ? 'visible opacity-100' : 'invisible opacity-0')}
      >
        {content}
      </span>
    </span>
  );
}
