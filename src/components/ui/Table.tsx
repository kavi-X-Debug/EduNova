import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from './cn';

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** Required: describes the table to assistive tech (translated). */
  caption: string;
  captionHidden?: boolean;
  children: ReactNode;
}

export function Table({ caption, captionHidden, className, children, ...rest }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface">
      <table className={cn('w-full border-collapse text-left text-sm', className)} {...rest}>
        <caption className={captionHidden ? 'sr-only' : 'p-3 text-left text-sm font-semibold text-ink'}>{caption}</caption>
        {children}
      </table>
    </div>
  );
}

export const THead = ({ className, ...p }: HTMLAttributes<HTMLTableSectionElement>) => <thead className={cn('bg-surface-muted', className)} {...p} />;
export const TBody = ({ className, ...p }: HTMLAttributes<HTMLTableSectionElement>) => <tbody className={cn('[&>tr:hover]:bg-surface-muted [&>tr:focus-within]:bg-surface-muted', className)} {...p} />;
export const Tr = ({ className, ...p }: HTMLAttributes<HTMLTableRowElement>) => <tr className={cn('border-t border-line transition-colors duration-fast ease-standard', className)} {...p} />;
export const Th = ({ className, scope = 'col', ...p }: ThHTMLAttributes<HTMLTableCellElement>) => <th scope={scope} className={cn('px-4 py-3 font-semibold text-ink-soft', className)} {...p} />;
export const Td = ({ className, ...p }: TdHTMLAttributes<HTMLTableCellElement>) => <td className={cn('px-4 py-3 text-ink', className)} {...p} />;
