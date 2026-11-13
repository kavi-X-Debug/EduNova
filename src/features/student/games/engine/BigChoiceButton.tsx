import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { Check, Heart } from 'lucide-react';
import { cn } from '@/components/ui';
import { focusRing } from '@/components/ui/cn';
import { useGt as useT } from '@/features/student/games/useGt';
import { playSound } from './sound';

export type ChoiceState = 'idle' | 'right' | 'wrong' | 'dim';

export interface BigChoiceButtonProps {
  children: ReactNode;
  onClick: () => void;
  /** After answering: `right` (this is the answer) or `wrong` (the child picked this); the rest `dim`. Never colour alone: an icon and hidden text come with it. */
  state?: ChoiceState;
  disabled?: boolean;
  /** Language of the label when it differs from the page (e.g. a Sinhala word in an English game). */
  lang?: string;
  className?: string;
}

/** A big tap target (64px+, 20px text) for "choose one" games. Use inside <ChoiceGroup>. */
export function BigChoiceButton({ children, onClick, state = 'idle', disabled, lang, className }: BigChoiceButtonProps) {
  const t = useT();
  return (
    <button
      type="button"
      lang={lang}
      disabled={disabled}
      onClick={() => {
        playSound('tap');
        onClick();
      }}
      className={cn(
        'flex min-h-16 w-full items-center justify-center gap-3 rounded-xl border-2 px-5 py-3 text-center text-xl font-bold transition duration-fast ease-standard motion-ok:active:scale-[0.98] motion-reduce:transition-none',
        focusRing,
        state === 'idle' && 'border-brand-100 bg-surface text-ink hover:border-brand-500 hover:bg-brand-50',
        state === 'right' && 'border-success-700 bg-success-50 text-success-700',
        state === 'wrong' && 'border-warning-700 bg-warning-50 text-warning-700',
        state === 'dim' && 'border-line bg-surface-muted text-ink-soft',
        disabled && state === 'idle' && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      {state === 'right' && <Check aria-hidden className="h-6 w-6 shrink-0" />}
      {state === 'wrong' && <Heart aria-hidden className="h-6 w-6 shrink-0" />}
      <span className="min-w-0 break-words">{children}</span>
      {state === 'right' && <span className="sr-only">{t('games.choice.right')}</span>}
      {state === 'wrong' && <span className="sr-only">{t('games.choice.wrong')}</span>}
    </button>
  );
}

/**
 * Wraps choice buttons: a labelled group, a responsive grid (2 columns from 390px), and arrow keys that move
 * focus between the buttons (Tab still works). `label` is the question, already translated.
 */
export function ChoiceGroup({ label, children, columns = 2, className }: { label: string; children: ReactNode; columns?: 1 | 2; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    const items = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? []);
    if (items.length === 0) return;
    const at = items.indexOf(document.activeElement as HTMLButtonElement);
    let to: number;
    if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = items.length - 1;
    else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = at < 0 ? 0 : (at + 1) % items.length;
    else to = at <= 0 ? items.length - 1 : at - 1;
    e.preventDefault();
    items[to].focus();
  };
  return (
    <div ref={ref} role="group" aria-label={label} onKeyDown={onKeyDown} className={cn('grid gap-3', columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1', className)}>
      {children}
    </div>
  );
}
