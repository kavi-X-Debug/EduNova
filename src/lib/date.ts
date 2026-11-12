import type { Locale } from '@/types';

const TAGS: Record<Locale, string> = { en: 'en-LK', si: 'si-LK', ta: 'ta-LK' };

export function localeTag(locale: Locale): string {
  return TAGS[locale];
}

export function formatDate(
  iso: string,
  locale: Locale,
  opts: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
): string {
  return new Intl.DateTimeFormat(localeTag(locale), opts).format(new Date(iso));
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
  const rtf = new Intl.RelativeTimeFormat(localeTag(locale), { numeric: 'auto' });
  for (const [unit, secs] of UNITS) {
    if (Math.abs(diffSec) >= secs) return rtf.format(Math.round(diffSec / secs), unit);
  }
  return rtf.format(0, 'second');
}
