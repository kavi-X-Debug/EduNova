import { useEffect, useRef } from 'react';
import { Check, Delete } from 'lucide-react';
import { cn } from '@/components/ui';
import { focusRing } from '@/components/ui/cn';
import { useGt as useT } from '@/features/student/games/useGt';
import { applyKey } from './applyKey';
import { playSound } from './sound';

export interface NumberPadProps {
  /** What has been typed so far (a string, so "-" and "1." work while typing). */
  value: string;
  onChange: (value: string) => void;
  /** Called by the big Check button and by Enter. Not called when `value` is empty or just "-". */
  onSubmit: () => void;
  allowNegative?: boolean;
  allowDecimal?: boolean;
  maxLength?: number;
  disabled?: boolean;
  /** Accessible name of the typed number, e.g. "Your answer". */
  label: string;
}

const keyCls = cn('flex h-16 items-center justify-center rounded-xl border-2 border-brand-100 bg-surface text-2xl font-bold text-ink transition duration-fast ease-standard hover:border-brand-500 hover:bg-brand-50 motion-ok:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50', focusRing);

/**
 * Big on-screen number pad (64px keys) plus the physical keyboard (digits, minus, dot, Backspace, Enter).
 * Controlled: keep `value` in your state, check the answer in `onSubmit`.
 */
export function NumberPad({ value, onChange, onSubmit, allowNegative, allowDecimal, maxLength = 8, disabled, label }: NumberPadProps) {
  const t = useT();
  const latest = useRef({ value, onChange, onSubmit, allowNegative, allowDecimal, maxLength, disabled });
  useEffect(() => {
    latest.current = { value, onChange, onSubmit, allowNegative, allowDecimal, maxLength, disabled };
  });

  // Physical keyboard works without focusing the pad. Enter/Space on a focused button is left to that button.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const c = latest.current;
      if (c.disabled || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) return;
      if (e.key === 'Enter') {
        if (target?.tagName === 'BUTTON') return;
        if (c.value !== '' && c.value !== '-') {
          e.preventDefault();
          c.onSubmit();
        }
        return;
      }
      const next = applyKey(c.value, e.key, c);
      if (e.key === 'Backspace' || /^[0-9.-]$/.test(e.key)) {
        e.preventDefault();
        if (next !== c.value) c.onChange(next);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const press = (key: string) => {
    playSound('tap');
    onChange(applyKey(value, key, { allowNegative, allowDecimal, maxLength }));
  };
  const canSubmit = value !== '' && value !== '-' && !value.endsWith('.');

  return (
    <div className="mx-auto flex w-full max-w-xs flex-col gap-3">
      <div className="rounded-xl border-2 border-line-strong bg-surface-muted px-4 py-3 text-center" role="group" aria-label={label}>
        <p className="text-sm font-bold text-ink-soft">{label}</p>
        <output aria-live="off" className="block min-h-10 text-3xl font-bold tabular-nums text-ink">
          {value === '' ? <span aria-hidden className="text-ink-faint">_</span> : value}
        </output>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => (
          <button key={k} type="button" disabled={disabled} onClick={() => press(k)} className={keyCls}>
            {k}
          </button>
        ))}
        {allowNegative ? (
          <button type="button" disabled={disabled} onClick={() => press('-')} aria-label={t('games.pad.minus')} className={keyCls}>
            <span aria-hidden>-</span>
          </button>
        ) : allowDecimal ? (
          <button type="button" disabled={disabled} onClick={() => press('.')} aria-label={t('games.pad.point')} className={keyCls}>
            <span aria-hidden>.</span>
          </button>
        ) : (
          <span aria-hidden />
        )}
        <button type="button" disabled={disabled} onClick={() => press('0')} className={keyCls}>
          0
        </button>
        <button type="button" disabled={disabled || value === ''} onClick={() => press('Backspace')} aria-label={t('games.pad.delete')} className={keyCls}>
          <Delete aria-hidden className="h-7 w-7" />
        </button>
      </div>
      <button
        type="button"
        disabled={disabled || !canSubmit}
        onClick={onSubmit}
        className={cn('inline-flex min-h-[56px] items-center justify-center gap-3 rounded-xl bg-brand-600 px-7 py-3.5 text-lg font-bold text-surface shadow-raised hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50', focusRing)}
      >
        <Check aria-hidden className="h-6 w-6" />
        {t('games.pad.check')}
      </button>
    </div>
  );
}
