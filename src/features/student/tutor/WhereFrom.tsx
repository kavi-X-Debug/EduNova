import { BookOpen, Info } from 'lucide-react';
import { useT } from '@/i18n';
import type { TutorMessage } from '@/types';
import { pagesOf } from './pagesOf';

/**
 * "Where this comes from": the book name and pages in simple words.
 * It is ALWAYS shown for a tutor answer; with no sources it says to ask the teacher.
 */
export function WhereFrom({ message }: { message: Pick<TutorMessage, 'id' | 'sources' | 'locale'> }) {
  const t = useT();
  const none = message.sources.length === 0;
  const headingId = `from-${message.id}`;
  return (
    <section
      aria-labelledby={headingId}
      className={`mt-3 rounded-lg border-2 p-3 md:p-4 ${none ? 'border-warning-500 bg-warning-50' : 'border-success-500 bg-success-50'}`}
    >
      <h3 id={headingId} className="flex items-center gap-2 text-lg font-bold text-ink">
        {none ? <Info aria-hidden className="h-6 w-6 shrink-0 text-warning-700" /> : <BookOpen aria-hidden className="h-6 w-6 shrink-0 text-success-700" />}
        {t('kidsplay.ask.from.title')}
      </h3>
      {none ? (
        <p className="mt-2 text-lg font-semibold text-ink">{t('kidsplay.ask.from.none')}</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2">
          {message.sources.map((s, i) => {
            const pages = pagesOf(s.ref);
            return (
              <li key={`${s.ref}-${i}`} className="flex items-start gap-3">
                <BookOpen aria-hidden className="mt-1 h-5 w-5 shrink-0 text-success-700" />
                <span className="min-w-0 text-lg text-ink">
                  <span lang={message.locale} className="font-semibold">{s.title}</span>
                  {pages && <span className="block text-base text-ink-soft">{t('kidsplay.ask.from.pages', { pages })}</span>}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
