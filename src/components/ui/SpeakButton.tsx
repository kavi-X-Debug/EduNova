import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Square, Volume2 } from 'lucide-react';
import { useLocale } from '@/i18n';
import { useSpeech } from '@/lib/speech';
import type { Locale } from '@/types';
import { cn, focusRing } from './cn';

export interface SpeakButtonProps {
  /** The text to read, already translated (plain text, no markup). */
  text: string;
  /** Language of `text` if it differs from the UI language (e.g. a tutor answer written in another language). */
  locale?: Locale;
  /** Override the accessible name (translated). Defaults to "Read aloud" / "Stop reading". */
  label?: string;
  size?: 'sm' | 'md';
  /** No voice on this device for the language: 'hide' (default) renders nothing, 'disable' shows a disabled button with an explanation. */
  whenUnavailable?: 'hide' | 'disable';
  className?: string;
}

/**
 * Read-aloud with the browser's speech voices. Appears only when the device has a voice for the language
 * (many devices have no Sinhala or Tamil voice: we never pretend otherwise). Pressing it again stops;
 * it also stops on page change and when removed.
 */
export function SpeakButton({ text, locale, label, size = 'md', whenUnavailable = 'hide', className }: SpeakButtonProps) {
  const { t } = useLocale();
  const { available, speaking, speak, stop } = useSpeech(locale);
  const { pathname } = useLocation();
  useEffect(() => stop, [pathname, stop]); // route change: stop talking

  if (!available && whenUnavailable === 'hide') return null;
  const name = label ?? (speaking ? t('kids.speak.stop') : t('kids.speak.label'));
  const Icon = speaking ? Square : Volume2;
  return (
    <button
      type="button"
      disabled={!available}
      aria-label={name}
      title={available ? name : t('kids.speak.unavailable')}
      onClick={() => (speaking ? stop() : speak(text))}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface text-brand-700 transition-colors duration-fast ease-standard hover:bg-brand-50 active:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-50',
        focusRing,
        size === 'sm' ? 'h-11 w-11' : 'h-12 w-12',
        speaking && 'bg-brand-50',
        className,
      )}
    >
      <Icon aria-hidden className={cn('h-5 w-5', speaking && 'h-4 w-4 fill-current')} />
    </button>
  );
}
