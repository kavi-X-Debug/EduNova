import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import type { Locale } from '@/types';
import en from './locales/en.json';
import si from './locales/si.json';
import ta from './locales/ta.json';

export const LOCALES: readonly Locale[] = ['en', 'si', 'ta'];
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_STORAGE_KEY = 'edunova.locale';

/** Native names, shown in the language switcher (never translated). */
export const LOCALE_NAMES: Record<Locale, string> = { en: 'English', si: 'සිංහල', ta: 'தமிழ்' };

/** Every valid translation key, derived from en.json. */
export type TKey = keyof typeof en;

/** Identity helper giving compile-time checking of a key (use for keys held in data). */
export const tk = <K extends TKey>(key: K): K => key;

function isLocale(v: unknown): v is Locale {
  return typeof v === 'string' && (LOCALES as readonly string[]).includes(v);
}

function readStoredLocale(): Locale | null {
  try {
    const v = localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(v) ? v : null;
  } catch {
    return null;
  }
}

function detectLocale(): Locale {
  const stored = readStoredLocale();
  if (stored) return stored;
  const nav = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2).toLowerCase() : '';
  return isLocale(nav) ? nav : DEFAULT_LOCALE;
}

function applyDocumentLang(lng: string) {
  if (typeof document !== 'undefined') document.documentElement.lang = lng;
}

let initialised = false;

/** Call once in main.tsx before rendering. Safe to call repeatedly. */
export function initI18n(): typeof i18n {
  if (initialised) return i18n;
  initialised = true;
  void i18n.use(initReactI18next).init({
    resources: { en: { translation: en }, si: { translation: si }, ta: { translation: ta } },
    lng: detectLocale(),
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...LOCALES],
    keySeparator: false, // keys are flat: "feature.section.key"
    nsSeparator: false,
    interpolation: { escapeValue: false }, // React escapes
    returnNull: false,
    initAsync: false,
  });
  applyDocumentLang(i18n.language);
  i18n.on('languageChanged', (lng) => {
    applyDocumentLang(lng);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, lng);
    } catch {
      /* storage unavailable: language still applies for this session */
    }
  });
  return i18n;
}

/** Minimal shape of a zustand store holding `locale` (e.g. useUiStore from '@/store'). */
interface LocaleStore {
  getState: () => { locale: Locale; setLocale: (l: Locale) => void };
  subscribe: (listener: (s: { locale: Locale }, prev: { locale: Locale }) => void) => () => void;
}

/**
 * Makes the store's `locale` the source of truth for the UI language.
 * Call once in main.tsx after initI18n(): `bindLocaleStore(useUiStore)`.
 * Store -> i18n on every change; i18n -> store when changed directly.
 */
export function bindLocaleStore(store: LocaleStore): () => void {
  const apply = (l: Locale) => {
    if (isLocale(l) && i18n.language !== l) void i18n.changeLanguage(l);
  };
  apply(store.getState().locale);
  const unsub = store.subscribe((s, prev) => {
    if (s.locale !== prev.locale) apply(s.locale);
  });
  const onLang = (lng: string) => {
    if (isLocale(lng) && store.getState().locale !== lng) store.getState().setLocale(lng);
  };
  i18n.on('languageChanged', onLang);
  return () => {
    unsub();
    i18n.off('languageChanged', onLang);
  };
}

/** Typed translate function: only valid keys compile. */
export type TFn = (key: TKey, options?: Record<string, unknown>) => string;

/**
 * useLocale(): current locale, setter, list of options and typed `t`.
 * The language switcher UI (Agent A) is built on this hook.
 */
export function useLocale() {
  const { t, i18n: inst } = useTranslation();
  const locale: Locale = isLocale(inst.language) ? inst.language : DEFAULT_LOCALE;
  const setLocale = useCallback((next: Locale) => inst.changeLanguage(next), [inst]);
  const typedT = t as unknown as TFn;
  return {
    locale,
    setLocale,
    t: typedT,
    locales: LOCALES,
    names: LOCALE_NAMES,
    /** Sinhala/Tamil need generous line-height; use this to pick a class. */
    isIndic: locale !== 'en',
  };
}

/** Typed `t` for components that do not need the locale. */
export function useT(): TFn {
  return useTranslation().t as unknown as TFn;
}

export { i18n };
