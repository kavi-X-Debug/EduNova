import type { ProfileService } from '@/services/profile';
import type { User, UserProfile } from '@/types';
import { clone, simulate } from './config';
import { findUser } from './people';

const KEY = 'edunova.mock.userprofile.';
const AUTH_KEY = 'edunova.mock.user'; // same key as mockAuthService
const store = new Map<string, UserProfile>();

function storedUser(): User | null {
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function defaults(userId: string): UserProfile {
  const u = findUser(userId) ?? (storedUser()?.id === userId ? storedUser() : null);
  return {
    userId,
    displayName: u?.name ?? '',
    avatar: { kind: 'initials', colour: 'brand' },
    notifications: { reminders: true, weeklySummary: true, teacherMessages: true, productNews: false },
  };
}

function load(userId: string): UserProfile {
  const mem = store.get(userId);
  if (mem) return mem;
  let p = defaults(userId);
  try {
    const raw = window.localStorage.getItem(KEY + userId);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<UserProfile>;
      p = { ...p, ...saved, avatar: { ...p.avatar, ...saved.avatar }, notifications: { ...p.notifications, ...saved.notifications }, userId };
    }
  } catch {
    /* storage unavailable or corrupt: fall back to defaults */
  }
  store.set(userId, p);
  return p;
}

function persist(p: UserProfile): void {
  try {
    window.localStorage.setItem(KEY + p.userId, JSON.stringify(p));
    // Keep the mock "signed-in user" name in step with the display name.
    const u = storedUser();
    if (u && u.id === p.userId && p.displayName) window.localStorage.setItem(AUTH_KEY, JSON.stringify({ ...u, name: p.displayName }));
  } catch {
    /* storage unavailable: change lasts for this session only */
  }
}

export const mockProfileService: ProfileService = {
  getProfile: (userId) => simulate(() => clone(load(userId))),

  updateProfile: (userId, patch) =>
    simulate(() => {
      const cur = load(userId);
      const name = patch.displayName?.trim();
      if (patch.displayName !== undefined && !name) throw new Error('missing');
      const next: UserProfile = {
        ...cur,
        ...patch,
        displayName: name ?? cur.displayName,
        avatar: { ...cur.avatar, ...patch.avatar },
        notifications: { ...cur.notifications, ...patch.notifications },
        userId,
      };
      store.set(userId, next);
      persist(next);
      return clone(next);
    }),

  // MOCK ONLY: nothing is stored or verified.
  changePassword: (_userId, change) =>
    simulate(() => {
      if (!change.current || !change.next) throw new Error('missing');
      if (change.next.length < 8) throw new Error('weak');
      if (change.next === change.current) throw new Error('same');
    }),
};
