/**
 * MOCK ONLY: the user and role persisted in localStorage here are a demo convenience and are NOT
 * authenticated. At go-live replace them with real session verification (server-validated session /
 * Supabase auth); route guards must then trust the verified session, never this persisted state.
 * UI language lives in useUiStore, not here.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services';
import type { Role, User } from '@/types';
import { useUiStore } from './useUiStore';

interface SessionState {
  user: User | null;
  role: Role | null;
  signIn: (email: string, role: Role) => Promise<User>;
  signOut: () => Promise<void>;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      signIn: async (email, role) => {
        const user = await authService.signIn(email, role);
        useUiStore.getState().applyProfileLocale(user.locale); // no-op if the person already chose a language
        set({ user, role: user.role });
        return user;
      },
      signOut: async () => {
        await authService.signOut();
        set({ user: null, role: null });
      },
    }),
    {
      name: 'edunova.session',
      partialize: (s) => ({ user: s.user, role: s.role }),
    },
  ),
);
