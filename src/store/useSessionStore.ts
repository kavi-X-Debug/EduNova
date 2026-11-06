import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services';
import type { Locale, Role, User } from '@/types';
import { useUiStore } from './useUiStore';

interface SessionState {
  user: User | null;
  role: Role | null;
  locale: Locale;
  signIn: (email: string, role: Role) => Promise<User>;
  signOut: () => Promise<void>;
  setLocale: (locale: Locale) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      locale: 'en',
      signIn: async (email, role) => {
        const user = await authService.signIn(email, role);
        set({ user, role: user.role, locale: user.locale });
        useUiStore.getState().setLocale(user.locale);
        return user;
      },
      signOut: async () => {
        await authService.signOut();
        set({ user: null, role: null });
      },
      setLocale: (locale) => {
        set((s) => ({ locale, user: s.user ? { ...s.user, locale } : s.user }));
        useUiStore.getState().setLocale(locale);
      },
    }),
    {
      name: 'edunova.session',
      partialize: (s) => ({ user: s.user, role: s.role, locale: s.locale }),
    },
  ),
);
