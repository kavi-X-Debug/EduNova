/**
 * Welcome-tour state. "Done" is remembered per student on this device (localStorage), like the other
 * display prefs. MOCK: a real backend would keep a `tourDone` flag on the student profile.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TourState {
  /** userId -> true once the tour was finished or skipped. */
  doneBy: Record<string, true>;
  /** The dialog is showing. Not persisted. */
  open: boolean;
  openTour: () => void;
  /** Close the dialog and remember it as done for this student. */
  finish: (userId: string) => void;
}

export const useTourStore = create<TourState>()(
  persist(
    (set) => ({
      doneBy: {},
      open: false,
      openTour: () => set({ open: true }),
      finish: (userId) => set((s) => ({ open: false, doneBy: { ...s.doneBy, [userId]: true } })),
    }),
    { name: 'edunova.tour', partialize: (s) => ({ doneBy: s.doneBy }) },
  ),
);
