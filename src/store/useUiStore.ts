import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@/types';

export type ToastKind = 'info' | 'success' | 'error';
export interface Toast {
  id: string;
  kind: ToastKind;
  /** i18n key or plain message; the Toast UI decides how to render. */
  message: string;
  durationMs: number;
}

interface UiState {
  /** Source of truth for the UI language (i18n should follow this). */
  locale: Locale;
  /** True once the person has explicitly picked a language (profile locale then never overrides it). */
  localeChosen: boolean;
  toasts: Toast[];
  /** Explicit user choice. */
  setLocale: (locale: Locale) => void;
  /** Profile default; applied only if the user never chose a language. */
  applyProfileLocale: (locale: Locale) => void;
  pushToast: (message: string, kind?: ToastKind, durationMs?: number) => string;
  dismissToast: (id: string) => void;
}

let seq = 0;

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      locale: 'en',
      localeChosen: false,
      toasts: [],
      setLocale: (locale) => set({ locale, localeChosen: true }),
      applyProfileLocale: (locale) => {
        if (!get().localeChosen) set({ locale });
      },
      pushToast: (message, kind = 'info', durationMs = 5000) => {
        const id = `toast-${++seq}`;
        set((s) => ({ toasts: [...s.toasts, { id, kind, message, durationMs }] }));
        if (durationMs > 0) setTimeout(() => get().dismissToast(id), durationMs);
        return id;
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    { name: 'edunova.ui', partialize: (s) => ({ locale: s.locale, localeChosen: s.localeChosen }) },
  ),
);
