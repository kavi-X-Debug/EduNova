import type { Locale } from '@/types';

const KEY = 'edunova.onboarding';

export interface OnboardingPrefs {
  grade: number;
  subjects: string[];
  locale: Locale;
}

export function readOnboarding(userId: string): OnboardingPrefs | null {
  try {
    const raw = window.localStorage.getItem(`${KEY}.${userId}`);
    return raw ? (JSON.parse(raw) as OnboardingPrefs) : null;
  } catch {
    return null;
  }
}

export function writeOnboarding(userId: string, prefs: OnboardingPrefs): void {
  try {
    window.localStorage.setItem(`${KEY}.${userId}`, JSON.stringify(prefs));
  } catch {
    /* storage unavailable: onboarding will simply be offered again */
  }
}
