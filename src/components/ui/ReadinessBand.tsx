import { useTranslation } from 'react-i18next';
import type { ReadinessBand as Band } from '@/types';
import { cn } from './cn';

const ORDER: Band[] = ['building', 'developing', 'secure', 'strong'];
const fills: Record<Band, string> = {
  building: 'bg-warning-500',
  developing: 'bg-accent-500',
  secure: 'bg-brand-500',
  strong: 'bg-success-500',
};

export interface ReadinessBandProps {
  band: Band;
  /** Optional override of the visible label (translated). Defaults to ui.band.<band>. */
  label?: string;
  /** Hide the four-segment graphic and show label only. */
  compact?: boolean;
  className?: string;
}

/** Shows readiness as a labelled band. Deliberately accepts no numeric props. */
export function ReadinessBand({ band, label, compact, className }: ReadinessBandProps) {
  const { t } = useTranslation();
  const text = label ?? t(`ui.band.${band}`);
  const idx = ORDER.indexOf(band);
  return (
    <div className={cn('inline-flex flex-col gap-1.5', className)} role="img" aria-label={`${t('ui.band.title')}: ${text}`}>
      {!compact && (
        <div className="flex gap-1" aria-hidden>
          {ORDER.map((b, i) => (
            <span key={b} className={cn('h-2 w-10 rounded-sm', i <= idx ? fills[band] : 'bg-surface-sunken')} />
          ))}
        </div>
      )}
      <span aria-hidden className="text-sm font-semibold text-ink">{text}</span>
    </div>
  );
}
