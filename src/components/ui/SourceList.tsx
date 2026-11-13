import { BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from './cn';

export interface SourceItem {
  id: string;
  title: string;
  /** e.g. page or section reference (already formatted). */
  detail?: string;
  href?: string;
  /** language of `title` when it differs from the UI language (BCP 47) */
  lang?: string;
}

export interface SourceListProps {
  sources: SourceItem[];
  /** Heading override (translated); defaults to ui.sources.title. */
  title?: string;
  className?: string;
}

/** Allow only http(s) and relative/hash URLs; anything else (javascript:, data:) is dropped. */
function safeHref(href?: string): string | undefined {
  if (!href) return undefined;
  if (/^(\/|#|\.)/.test(href)) return href;
  try {
    const u = new URL(href);
    return u.protocol === 'http:' || u.protocol === 'https:' ? href : undefined;
  } catch {
    return undefined;
  }
}

export function SourceList({ sources, title, className }: SourceListProps) {
  const { t } = useTranslation();
  const heading = title ?? t('ui.sources.title');
  return (
    <section aria-label={heading} className={cn('rounded-md border border-line bg-surface-muted p-3', className)}>
      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
        <BookOpen aria-hidden className="h-4 w-4 text-brand-600" />
        {heading}
      </h4>
      {sources.length === 0 ? (
        <p className="text-sm text-ink-soft">{t('ui.sources.none')}</p>
      ) : (
        <ol className="flex flex-col gap-1 text-sm">
          {sources.map((s, i) => (
            <li key={s.id} className="flex gap-2">
              <span aria-hidden className="text-ink-faint">{i + 1}.</span>
              <span>
                {safeHref(s.href) ? (
                  <a href={safeHref(s.href)} rel="noopener noreferrer" lang={s.lang} className="font-semibold text-brand-700 underline outline-none focus-visible:shadow-focus">{s.title}</a>
                ) : (
                  <span lang={s.lang} className="font-semibold text-ink">{s.title}</span>
                )}
                {s.detail && <span className="text-ink-soft"> · {s.detail}</span>}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
