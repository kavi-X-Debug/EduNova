/** Game preferences kept on this device only (localStorage). Sound is OFF by default. */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GamePrefsState {
  sound: boolean;
  setSound: (on: boolean) => void;
}

export const useGamePrefsStore = create<GamePrefsState>()(
  persist(
    (set) => ({
      sound: false,
      setSound: (on) => set({ sound: on }),
    }),
    { name: 'edunova.games', partialize: (s) => ({ sound: s.sound }) },
  ),
);
