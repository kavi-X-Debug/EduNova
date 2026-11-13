import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ToastContext, type ToastApi, type ToastOptions, type ToastTone } from './toastContext';
import { IconButton } from './IconButton';
import { cn } from './cn';

interface Item extends ToastOptions {
  id: number;
  leaving?: boolean;
}

const tones: Record<ToastTone, string> = {
  info: 'border-brand-500 bg-brand-50 text-brand-700',
  success: 'border-success-500 bg-success-50 text-success-700',
  warning: 'border-warning-500 bg-warning-50 text-warning-700',
  danger: 'border-danger-500 bg-danger-50 text-danger-700',
};

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [items, setItems] = useState<Item[]>([]);
  const timers = useRef(new Map<number, number>());
  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((tid) => window.clearTimeout(tid));
      map.clear();
    };
  }, []);
  const dismiss = useCallback((id: number) => {
    const tid = timers.current.get(id);
    if (tid !== undefined) window.clearTimeout(tid);
    timers.current.delete(id);
    // Fade out first, then remove.
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, leaving: true } : x)));
    window.setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 160);
  }, []);
  const show = useCallback(
    (opts: ToastOptions) => {
      const id = ++counter;
      setItems((xs) => [...xs, { ...opts, id }]);
      const d = opts.duration ?? 5000;
      if (d > 0) timers.current.set(id, window.setTimeout(() => dismiss(id), d));
    },
    [dismiss],
  );
  const api = useMemo<ToastApi>(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed bottom-20 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 md:bottom-4">
        {items.map((it) => (
          <div key={it.id} aria-hidden={it.leaving || undefined} className={cn('flex items-start gap-2 rounded-md border-l-4 p-3 shadow-raised', it.leaving ? 'pointer-events-none animate-fade-out' : 'pointer-events-auto animate-slide-up', tones[it.tone ?? 'info'])}>
            <p className="flex-1 text-sm font-semibold">{it.message}</p>
            <IconButton label={t('ui.common.dismiss')} icon={<X className="h-4 w-4" />} onClick={() => dismiss(it.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
