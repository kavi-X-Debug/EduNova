import { useTranslation } from 'react-i18next';
import type { ReadinessBand } from '@/types';
import { cn } from './cn';

const ORDER: ReadinessBand[] = ['building', 'developing', 'secure', 'strong'];

export interface GrowMeterProps {
  band: ReadinessBand;
  /** Pictures only get bigger; the word is always shown (unless `hideWord`). */
  size?: 'sm' | 'md' | 'lg';
  /** Also show one kind sentence under the word (kids.grow.hint.<band>). */
  showHint?: boolean;
  /** Hide the word when a heading next to it already says it. The accessible name stays. */
  hideWord?: boolean;
  /** Override the visible word (translated). Default kids.grow.<band>. */
  label?: string;
  className?: string;
}

const ICON: Record<NonNullable<GrowMeterProps['size']>, string> = { sm: 'h-8 w-8', md: 'h-11 w-11', lg: 'h-14 w-14' };

/**
 * Friendly readiness meter: seedling, sprout, plant, tree, mapped from the four ReadinessBand values.
 * Shows the band as a picture and a word. It accepts NO numeric props and never shows a mark, rank or percent.
 * The pictures stay put for every band (past stages are filled, later ones are soft), so nothing reads as a "bad" state.
 */
export function GrowMeter({ band, size = 'md', showHint, hideWord, label, className }: GrowMeterProps) {
  const { t } = useTranslation();
  const idx = ORDER.indexOf(band);
  const word = label ?? t(`kids.grow.${band}`);
  return (
    <div className={cn('inline-flex flex-col gap-2', className)} role="img" aria-label={t('kids.grow.label', { band: word })}>
      <div aria-hidden className="flex items-end gap-1.5">
        {ORDER.map((b, i) => (
          <span
            key={b}
            className={cn(
              'flex items-end justify-center rounded-lg p-1 transition-opacity duration-base ease-standard',
              i === idx ? 'bg-success-50 ring-2 ring-success-500' : i < idx ? 'bg-surface-muted' : 'opacity-40',
              i === idx && 'motion-ok:animate-fx-pop-in',
            )}
          >
            <Stage stage={i} className={ICON[size]} />
          </span>
        ))}
      </div>
      {!hideWord && (
        <span aria-hidden className="text-lg font-bold text-ink">
          {word}
        </span>
      )}
      {showHint && (
        <span aria-hidden className="max-w-xs text-base text-ink-soft">
          {t(`kids.grow.hint.${band}`)}
        </span>
      )}
    </div>
  );
}

/** 0 seedling, 1 sprout, 2 plant, 3 tree. Token colours only. */
function Stage({ stage, className }: { stage: number; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" focusable="false" aria-hidden className={className}>
      {stage < 3 && <path d="M8 44 Q24 34 40 44 Z" className="fill-badge-sun-800" />}
      {stage === 0 && (
        <>
          <path d="M24 39 V30" className="fill-none stroke-badge-leaf-600" strokeWidth="3" strokeLinecap="round" />
          <path d="M24 31 Q16 30 15 23 Q23 22 24 31 Z" className="fill-badge-leaf-400" />
          <path d="M24 31 Q32 30 33 23 Q25 22 24 31 Z" className="fill-badge-leaf-400" />
        </>
      )}
      {stage === 1 && (
        <>
          <path d="M24 39 V21" className="fill-none stroke-badge-leaf-600" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M24 28 Q12 28 10 15 Q22 14 24 28 Z" className="fill-badge-leaf-400" />
          <path d="M24 22 Q36 22 38 9 Q26 8 24 22 Z" className="fill-badge-leaf-600" />
        </>
      )}
      {stage === 2 && (
        <>
          <path d="M24 39 V16" className="fill-none stroke-badge-leaf-600" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M24 34 Q11 34 8 22 Q21 21 24 34 Z" className="fill-badge-leaf-400" />
          <path d="M24 30 Q37 30 40 18 Q27 17 24 30 Z" className="fill-badge-leaf-600" />
          <circle cx="24" cy="12" r="6" className="fill-accent-500" />
          <circle cx="24" cy="12" r="2.4" className="fill-surface" />
        </>
      )}
      {stage === 3 && (
        <>
          <path d="M20 45 L21.5 26 H26.5 L28 45 Z" className="fill-badge-sun-800" />
          <circle cx="24" cy="18" r="12" className="fill-badge-leaf-600" />
          <circle cx="14" cy="24" r="8" className="fill-badge-leaf-400" />
          <circle cx="34" cy="24" r="8" className="fill-badge-leaf-400" />
          <circle cx="20" cy="14" r="2" className="fill-accent-500" />
          <circle cx="30" cy="20" r="2" className="fill-accent-500" />
          <circle cx="16" cy="24" r="2" className="fill-accent-500" />
        </>
      )}
    </svg>
  );
}
