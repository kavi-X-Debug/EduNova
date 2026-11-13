import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn, focusRing, touchTarget } from './cn';

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  /** Accessible name for the tablist (translated). */
  label: string;
  defaultId?: string;
  value?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export function Tabs({ items, label, defaultId, value, onChange, className }: TabsProps) {
  const base = useId();
  const [inner, setInner] = useState(defaultId ?? items[0]?.id);
  const current = value ?? inner;
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const enabled = items.filter((i) => !i.disabled);

  const select = (id: string) => {
    setInner(id);
    onChange?.(id);
    refs.current[id]?.focus();
  };

  const onKey = (e: KeyboardEvent, id: string) => {
    const i = enabled.findIndex((x) => x.id === id);
    let next: number | null = null;
    if (e.key === 'ArrowRight') next = (i + 1) % enabled.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + enabled.length) % enabled.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = enabled.length - 1;
    if (next !== null) {
      e.preventDefault();
      select(enabled[next].id);
    }
  };

  return (
    <div className={className}>
      <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-line">
        {items.map((it) => {
          const active = it.id === current;
          return (
            <button
              key={it.id}
              ref={(el) => {
                refs.current[it.id] = el;
              }}
              role="tab"
              type="button"
              id={`${base}-tab-${it.id}`}
              aria-selected={active}
              aria-controls={`${base}-panel-${it.id}`}
              tabIndex={active ? 0 : -1}
              disabled={it.disabled}
              onClick={() => select(it.id)}
              onKeyDown={(e) => onKey(e, it.id)}
              className={cn('-mb-px whitespace-nowrap border-b-2 px-4 text-sm font-semibold transition-colors duration-fast ease-standard disabled:opacity-50', touchTarget, focusRing, active ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-soft hover:border-line-strong hover:text-ink')}
            >
              {it.label}
            </button>
          );
        })}
      </div>
      {items.map((it) => (
        <div key={it.id} role="tabpanel" id={`${base}-panel-${it.id}`} aria-labelledby={`${base}-tab-${it.id}`} hidden={it.id !== current} tabIndex={0} className={cn('pt-4 animate-fade-in', focusRing)}>
          {it.id === current && it.content}
        </div>
      ))}
    </div>
  );
}
