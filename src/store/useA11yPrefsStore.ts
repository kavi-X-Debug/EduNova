/**
 * Display preferences kept on this device only (localStorage). They are applied as attributes on <html>:
 *   data-reduce-motion="true"  -> animations/transitions are cut (see styles/index.css and usePrefersReducedMotion)
 *   data-large-text="true"     -> root font size is increased (everything is rem based)
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AccessibilityPrefs } from '@/types';

interface A11yPrefsState extends AccessibilityPrefs {
  setPref: <K extends keyof AccessibilityPrefs>(key: K, value: AccessibilityPrefs[K]) => void;
}

export function applyA11yPrefs(p: AccessibilityPrefs): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.reduceMotion = String(p.reduceMotion);
  root.dataset.largeText = String(p.largeText);
}

export const useA11yPrefsStore = create<A11yPrefsState>()(
  persist(
    (set, get) => ({
      reduceMotion: false,
      largeText: false,
      setPref: (key, value) => {
        set({ [key]: value } as Partial<A11yPrefsState>);
        const { reduceMotion, largeText } = get();
        applyA11yPrefs({ reduceMotion, largeText });
      },
    }),
    {
      name: 'edunova.a11y',
      partialize: (s) => ({ reduceMotion: s.reduceMotion, largeText: s.largeText }),
      onRehydrateStorage: () => (state) => {
        if (state) applyA11yPrefs({ reduceMotion: state.reduceMotion, largeText: state.largeText });
      },
    },
  ),
);

/** Call once at startup so saved preferences apply before the first paint of the app. */
export function initA11yPrefs(): void {
  const { reduceMotion, largeText } = useA11yPrefsStore.getState();
  applyA11yPrefs({ reduceMotion, largeText });
}
