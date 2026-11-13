import type { ComponentType } from 'react';
import { Bird, BookOpen, Cat, Dog, Fish, Leaf, Rabbit, Rocket, Star, Sun, Turtle, Waves } from 'lucide-react';

type IconType = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

/** Preset avatars (no uploads). Ids are stored in the profile; labels live in i18n as profile.avatar.preset.<id>. */
export const AVATAR_PRESETS: { id: string; icon: IconType }[] = [
  { id: 'rocket', icon: Rocket }, { id: 'star', icon: Star }, { id: 'leaf', icon: Leaf },
  { id: 'book', icon: BookOpen }, { id: 'sun', icon: Sun }, { id: 'wave', icon: Waves },
  // Friendly animals for the student "Me" page (labels: kidsplay.avatar.<id>).
  { id: 'cat', icon: Cat }, { id: 'dog', icon: Dog }, { id: 'fish', icon: Fish },
  { id: 'bird', icon: Bird }, { id: 'rabbit', icon: Rabbit }, { id: 'turtle', icon: Turtle },
];
/** The original six presets (shown on the teacher and admin profile). Animals are student-only. */
export const CLASSIC_AVATAR_IDS = ['rocket', 'star', 'leaf', 'book', 'sun', 'wave'];
/** Ids whose label is kidsplay.avatar.<id> instead of profile.avatar.preset.<id>. */
export const ANIMAL_AVATAR_IDS = ['cat', 'dog', 'fish', 'bird', 'rabbit', 'turtle'];
/** The five picture avatars a child can choose (a cute round picture each, public/avatars/<id>.png). Same ids as before, so saved profiles keep working. */
export const KID_AVATAR_IDS = ['cat', 'dog', 'rabbit', 'turtle', 'bird'] as const;
/** Picture for a preset id, if it has one (the older fish, rocket, star... have only an icon). */
export const avatarImage = (id: string | undefined): string | undefined => (id && (KID_AVATAR_IDS as readonly string[]).includes(id) ? `/avatars/${id}.png` : undefined);
/** Colour keys -> token classes. Labels live in i18n as profile.avatar.colour.<key>. */
export const AVATAR_COLOURS: Record<string, string> = {
  brand: 'bg-brand-100 text-brand-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  neutral: 'bg-surface-sunken text-ink-soft',
};
