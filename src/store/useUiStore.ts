import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@/types';

interface UiState {
  /** Source of truth for the UI language (i18n is bound to this store). */
  locale: Locale;
  /** True once the person has explicitly picked a language (profile locale then never overrides it). */
  localeChosen: boolean;
  /** Explicit user choice. */
  setLocale: (locale: Locale) => void;
  /** Profile default; applied only if the user never chose a language. */
  applyProfileLocale: (locale: Locale) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      locale: 'en',
      localeChosen: false,
      setLocale: (locale) => set({ locale, localeChosen: true }),
      applyProfileLocale: (locale) => {
        if (!get().localeChosen) set({ locale });
      },
    }),
    { name: 'edunova.ui', partialize: (s) => ({ locale: s.locale, localeChosen: s.localeChosen }) },
  ),
);
