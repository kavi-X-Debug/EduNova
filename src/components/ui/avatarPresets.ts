import type { ComponentType } from 'react';
import { BookOpen, Leaf, Rocket, Star, Sun, Waves } from 'lucide-react';

type IconType = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

/** Preset avatars (no uploads). Ids are stored in the profile; labels live in i18n as profile.avatar.preset.<id>. */
export const AVATAR_PRESETS: { id: string; icon: IconType }[] = [
  { id: 'rocket', icon: Rocket }, { id: 'star', icon: Star }, { id: 'leaf', icon: Leaf },
  { id: 'book', icon: BookOpen }, { id: 'sun', icon: Sun }, { id: 'wave', icon: Waves },
];
/** Colour keys -> token classes. Labels live in i18n as profile.avatar.colour.<key>. */
export const AVATAR_COLOURS: Record<string, string> = {
  brand: 'bg-brand-100 text-brand-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  neutral: 'bg-surface-sunken text-ink-soft',
};
