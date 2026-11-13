/**
 * Read-aloud through the browser's Web Speech API (window.speechSynthesis).
 *
 * HONESTY RULE: Sinhala and Tamil voices are NOT installed on most devices. We only report a language as
 * available when the device lists a voice for it (checked again on `voiceschanged`). Never claim or imply
 * si/ta read-aloud support elsewhere in the UI; SpeakButton hides (or disables) itself when there is no voice.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Locale } from '@/types';
import { useLocale } from '@/i18n';

/** BCP-47 tags we ask for, per UI language. A voice for the same primary language (e.g. ta-IN) also counts. */
export const SPEECH_TAGS: Record<Locale, string> = { en: 'en-US', si: 'si-LK', ta: 'ta-LK' };

export const speechApiPresent = (): boolean => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

const norm = (s: string) => s.replace('_', '-').toLowerCase();

/** Best matching voice: exact tag first, then same primary language. */
export function pickVoice(voices: readonly SpeechSynthesisVoice[], locale: Locale): SpeechSynthesisVoice | undefined {
  const tag = norm(SPEECH_TAGS[locale]);
  const primary = tag.split('-')[0];
  return voices.find((v) => norm(v.lang) === tag) ?? voices.find((v) => norm(v.lang).split('-')[0] === primary);
}

function readVoices(): SpeechSynthesisVoice[] {
  return speechApiPresent() ? window.speechSynthesis.getVoices() : [];
}

export interface Speech {
  /** The browser has the API at all. */
  supported: boolean;
  /** There is a usable voice for `locale` on this device (English is allowed while the voice list is still loading). */
  available: boolean;
  speaking: boolean;
  speak: (text: string) => void;
  stop: () => void;
}

/** Speak text in `locale` (default: the current UI language). Stops by itself on unmount. */
export function useSpeech(localeOverride?: Locale): Speech {
  const { locale: uiLocale } = useLocale();
  const locale = localeOverride ?? uiLocale;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => readVoices());
  const [speaking, setSpeaking] = useState(false);
  const current = useRef<SpeechSynthesisUtterance | null>(null);
  const supported = speechApiPresent();

  useEffect(() => {
    if (!supported) return;
    const update = () => setVoices(readVoices());
    update();
    window.speechSynthesis.addEventListener('voiceschanged', update);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', update);
  }, [supported]);

  const voice = pickVoice(voices, locale);
  // Chrome fills the voice list asynchronously: while it is empty, trust the default (English) voice only.
  const available = supported && (voice !== undefined || (voices.length === 0 && locale === 'en'));

  const stop = useCallback(() => {
    if (current.current && speechApiPresent()) window.speechSynthesis.cancel();
    current.current = null;
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!speechApiPresent() || !text.trim()) return;
      window.speechSynthesis.cancel(); // only one voice at a time, across the whole app
      const u = new SpeechSynthesisUtterance(text);
      u.lang = voice?.lang ?? SPEECH_TAGS[locale];
      if (voice) u.voice = voice;
      u.rate = 0.9; // a little slower for young readers
      const done = () => {
        if (current.current === u) {
          current.current = null;
          setSpeaking(false);
        }
      };
      u.onend = done;
      u.onerror = done;
      current.current = u;
      setSpeaking(true);
      window.speechSynthesis.speak(u);
    },
    [locale, voice],
  );

  // Stop when the component goes away (page change) so nothing keeps talking.
  useEffect(
    () => () => {
      if (current.current && speechApiPresent()) window.speechSynthesis.cancel();
      current.current = null;
    },
    [],
  );

  return { supported, available, speaking, speak, stop };
}
