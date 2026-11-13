import { useEffect, useId, useLayoutEffect, useRef, useState, type ComponentType } from 'react';
import { CircleHelp, Lightbulb, X } from 'lucide-react';
import { useLocale, type TKey } from '@/i18n';
import { SpeakButton } from './SpeakButton';
import { cn, focusRing } from './cn';

export interface HelpBubbleProps {
  /** Key of the 1-2 short sentences that explain the page (each page supplies its own). */
  textKey: TKey;
  /** Heading key. Default `kids.help.title` ("What is this?"). */
  titleKey?: TKey;
  /** Picture next to the words. Default: a lightbulb. */
  icon?: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  /** Which edge of the "?" the popover lines up with. Pick 'end' when the button sits near the right edge. */
  align?: 'start' | 'end';
  className?: string;
}

/**
 * A small "?" button that opens a friendly "What is this?" popover (non-modal).
 * Escape or the close button closes it and returns focus to the "?"; so does clicking elsewhere.
 * Static text, so no aria-live is needed.
 */
export function HelpBubble({ textKey, titleKey = 'kids.help.title', icon: Icon = Lightbulb, align = 'start', className }: HelpBubbleProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState(0);
  const id = useId();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const text = t(textKey);

  const close = () => {
    setOpen(false);
    btnRef.current?.focus();
  };

  // Keep the panel inside the screen on a 390px phone.
  useLayoutEffect(() => {
    if (!open || !panelRef.current) return;
    setShift(0);
    const r = panelRef.current.getBoundingClientRect();
    const margin = 12;
    if (r.right > window.innerWidth - margin) setShift(window.innerWidth - margin - r.right);
    else if (r.left < margin) setShift(margin - r.left);
  }, [open, align]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  return (
    <span
      ref={wrapRef}
      className={cn('relative inline-flex', className)}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          e.stopPropagation();
          close();
        }
      }}
    >
      <button
        ref={btnRef}
        type="button"
        aria-label={t(titleKey)}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-haspopup="dialog"
        onClick={() => (open ? close() : setOpen(true))}
        className={cn(
          'inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-100 bg-brand-50 text-brand-700 transition-colors duration-fast ease-standard hover:bg-brand-100 active:bg-brand-100',
          focusRing,
        )}
      >
        <CircleHelp aria-hidden className="h-6 w-6" />
      </button>
      {open && (
        <div
          ref={panelRef}
          id={id}
          role="dialog"
          aria-modal="false"
          aria-label={t(titleKey)}
          style={shift ? { transform: `translateX(${shift}px)` } : undefined}
          className={cn(
            'absolute top-full z-40 mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-xl border-2 border-brand-100 bg-surface p-4 shadow-raised',
            align === 'end' ? 'right-0' : 'left-0',
          )}
        >
          <div className={shift ? '' : 'motion-ok:animate-fx-menu-pop'}>
            <div className="flex items-start gap-3">
              <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-500/15 text-accent-600">
                <Icon aria-hidden className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold text-ink">{t(titleKey)}</p>
                <p className="mt-1 text-base text-ink-soft">{text}</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                aria-label={t('a11y.close')}
                onClick={close}
                className={cn('inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-surface-sunken', focusRing)}
              >
                <X aria-hidden className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2 flex justify-end">
              <SpeakButton text={text} size="sm" />
            </div>
          </div>
        </div>
      )}
    </span>
  );
}
