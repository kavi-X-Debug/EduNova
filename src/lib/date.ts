import i18next from 'i18next';
import type { Locale } from '@/types';

const TAGS: Record<Locale, string> = { en: 'en-LK', si: 'si-LK', ta: 'ta-LK' };

export function localeTag(locale: Locale): string {
  return TAGS[locale];
}

/**
 * Some runtimes ship a reduced ICU without Sinhala/Tamil (Electron builds, small-icu Node, some WebViews);
 * `Intl` then silently formats in English. Detect that with a strict (lookup) match and fall back to the
 * translated month names and relative-time phrases in the locale files (`common.date.*`, `common.relative.*`).
 */
const nativeCache = new Map<Locale, boolean>();
function hasNativeIntl(locale: Locale): boolean {
  let ok = nativeCache.get(locale);
  if (ok === undefined) {
    try {
      const lang = localeTag(locale).split('-')[0];
      ok =
        Intl.DateTimeFormat.supportedLocalesOf([lang], { localeMatcher: 'lookup' }).length > 0 &&
        Intl.RelativeTimeFormat.supportedLocalesOf([lang], { localeMatcher: 'lookup' }).length > 0;
    } catch {
      ok = false;
    }
    nativeCache.set(locale, ok);
  }
  return ok;
}

const tr = (locale: Locale, key: string, opts?: Record<string, unknown>) =>
  i18next.t(key, { lng: locale, ...opts }) as string;
const pad = (n: number) => String(n).padStart(2, '0');

function fallbackDate(d: Date, locale: Locale, withTime: boolean): string {
  const date = tr(locale, 'common.date.medium', {
    day: d.getDate(),
    month: tr(locale, `common.date.month.${d.getMonth() + 1}`),
    year: d.getFullYear(),
  });
  return withTime ? `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}` : date;
}

export function formatDate(
  iso: string,
  locale: Locale,
  opts: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
): string {
  const d = new Date(iso);
  if (!hasNativeIntl(locale)) return fallbackDate(d, locale, Boolean(opts.timeStyle));
  return new Intl.DateTimeFormat(localeTag(locale), opts).format(d);
}

export function formatDateTime(iso: string, locale: Locale): string {
  return formatDate(iso, locale, { dateStyle: 'medium', timeStyle: 'short' });
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
];

/** "3 days ago" / "in 2 days", localised. */
export function formatRelative(iso: string, locale: Locale, now: number = Date.now()): string {
  const diffSec = Math.round((new Date(iso).getTime() - now) / 1000);
  if (!hasNativeIntl(locale)) {
    for (const [unit, secs] of UNITS) {
      if (Math.abs(diffSec) >= secs) {
        const value = Math.round(diffSec / secs);
        if (unit === 'day' && Math.abs(value) === 1) return tr(locale, value < 0 ? 'common.relative.yesterday' : 'common.relative.tomorrow');
        return tr(locale, `common.relative.${unit}.${value < 0 ? 'past' : 'future'}`, { count: Math.abs(value) });
      }
    }
    return tr(locale, 'common.relative.now');
  }
  const rtf = new Intl.RelativeTimeFormat(localeTag(locale), { numeric: 'auto' });
  for (const [unit, secs] of UNITS) {
    if (Math.abs(diffSec) >= secs) return rtf.format(Math.round(diffSec / secs), unit);
  }
  return rtf.format(0, 'second');
}
