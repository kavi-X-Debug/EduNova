import type { ReactNode, ThHTMLAttributes } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn, focusRing, touchTarget } from './cn';

export type SortDirection = 'asc' | 'desc';

export interface SortableThProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'onClick' | 'aria-sort'> {
  children: ReactNode;
  /** Current direction if this column is the sorted one, otherwise null/undefined. */
  direction?: SortDirection | null;
  onSort: () => void;
  /** Accessible button name (translated), e.g. "Sort by Name". Defaults to the visible text. */
  buttonLabel?: string;
}

/** Column header with a sort button; sets aria-sort on the th and keeps a 44px target. */
export function SortableTh({ children, direction, onSort, buttonLabel, className, ...rest }: SortableThProps) {
  const sort = direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none';
  const Icon = direction === 'asc' ? ArrowUp : direction === 'desc' ? ArrowDown : ArrowUpDown;
  return (
    <th scope="col" aria-sort={sort} className={cn('px-4 py-1 font-semibold text-ink-soft', className)} {...rest}>
      <button type="button" onClick={onSort} aria-label={buttonLabel} className={cn('inline-flex items-center gap-1 rounded-sm font-semibold', touchTarget, focusRing)}>
        {children}
        <Icon aria-hidden className="h-4 w-4" />
      </button>
    </th>
  );
}
