import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { LOCALE_NAMES, LOCALES, useT, type TKey } from '@/i18n';
import { cn } from '@/components/ui';
import type { Locale } from '@/types';
import { SubjectIcon } from '../learnKit/SubjectIcon';

/** A big picture card that is a real radio or checkbox underneath (keyboard and screen reader friendly). */
export function ChoiceCard({
  type,
  name,
  value,
  checked,
  onChange,
  picture,
  flush,
  children,
  className,
}: {
  type: 'radio' | 'checkbox';
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  picture: ReactNode;
  /** The picture brings its own coloured background (artwork), so no tile behind it. */
  flush?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('group relative block cursor-pointer', className)}>
      <input type={type} name={name} value={value} checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={cn(
          'flex min-h-[88px] items-center gap-3 rounded-xl border-2 bg-surface p-3 shadow-card md:gap-4 md:p-4 transition duration-base ease-standard',
          'border-line hover:border-brand-500 motion-ok:hover:-translate-y-0.5',
          'peer-checked:border-brand-600 peer-checked:bg-brand-50 peer-focus-visible:shadow-focus',
        )}
      >
        <span aria-hidden className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-lg md:h-14 md:w-14', !flush && 'bg-brand-100 text-brand-700')}>
          {picture}
        </span>
        <span className="min-w-0 flex-1 text-xl font-bold text-ink">{children}</span>
        <span
          aria-hidden
          className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2', checked ? 'border-brand-600 bg-brand-600 text-surface' : 'border-line-strong text-transparent')}
        >
          <Check className="h-5 w-5" />
        </span>
      </span>
    </label>
  );
}

const SCRIPT: Record<Locale, string> = { en: 'A', si: 'අ', ta: 'த' };

/** Language as three big buttons: a letter from each script and the language's own name. */
export function LanguageChoices({ value, onChange, legend, name = 'language', hideLegend }: { value: Locale; onChange: (l: Locale) => void; legend: string; name?: string; hideLegend?: boolean }) {
  return (
    <fieldset>
      <legend className={cn('text-xl font-bold text-ink', hideLegend ? 'sr-only' : 'mb-3')}>{legend}</legend>
      <div className="flex flex-col gap-3">
        {LOCALES.map((l) => (
          <ChoiceCard
            key={l}
            type="radio"
            name={name}
            value={l}
            checked={value === l}
            onChange={() => onChange(l)}
            picture={<span lang={l} className="text-3xl font-bold leading-none">{SCRIPT[l]}</span>}
          >
            <span lang={l}>{LOCALE_NAMES[l]}</span>
          </ChoiceCard>
        ))}
      </div>
    </fieldset>
  );
}

const SUBJECT_IDS = ['maths', 'science', 'sinhala', 'english', 'ict'] as const;

/** Subjects as big icon cards (pick as many as you like). */
export function SubjectChoices({
  value,
  onChange,
  legend,
  hint,
  error,
  hideLegend,
  wide,
}: {
  hideLegend?: boolean;
  /** Two columns from 834px (use on wide pages, not inside the narrow sign-in card). */
  wide?: boolean;
  value: string[];
  onChange: (next: string[]) => void;
  legend: string;
  hint?: string;
  error?: string;
}) {
  const t = useT();
  return (
    <fieldset aria-describedby={error ? 'subjects-error' : undefined}>
      <legend className={cn('text-xl font-bold text-ink', hideLegend && 'sr-only')}>{legend}</legend>
      {hint && <p className="mb-3 mt-1 text-lg text-ink-soft">{hint}</p>}
      <div className={cn('mt-3 grid gap-3', wide && 'md:grid-cols-2')}>
        {SUBJECT_IDS.map((s) => {
          const checked = value.includes(s);
          return (
            <ChoiceCard
              key={s}
              type="checkbox"
              name="subjects"
              value={s}
              checked={checked}
              onChange={() => onChange(checked ? value.filter((x) => x !== s) : [...value, s])}
              flush
              picture={<SubjectIcon subject={s} size="lg" />}
            >
              {t(`subject.${s}` as TKey)}
            </ChoiceCard>
          );
        })}
      </div>
      {error && (
        <p id="subjects-error" role="alert" className="mt-3 text-lg font-bold text-danger-700">
          {error}
        </p>
      )}
    </fieldset>
  );
}
