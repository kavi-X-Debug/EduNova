import { useState } from 'react';
import type { AvatarChoice } from '@/types';
import { AVATAR_COLOURS, AVATAR_PRESETS, avatarImage } from './avatarPresets';
import { cn } from './cn';

const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg', xl: 'h-24 w-24 text-3xl' };
const iconSizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-7 w-7', xl: 'h-12 w-12' };

export interface ProfileAvatarProps {
  name: string;
  avatar: AvatarChoice;
  size?: keyof typeof sizes;
  className?: string;
}

/**
 * Avatar from a stored choice: a cute picture (cat, dog, rabbit, turtle, bird), another preset icon, or the person's
 * initials, on a token colour (the colour shows as a thin rim round the picture). If the picture fails to load the
 * preset's icon is drawn instead. Decorative inside; the name is on the wrapper.
 */
export function ProfileAvatar({ name, avatar, size = 'md', className }: ProfileAvatarProps) {
  const preset = avatar.kind === 'preset' ? AVATAR_PRESETS.find((p) => p.id === avatar.presetId) : undefined;
  const initials = name.trim().split(/\s+/).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('');
  const Icon = preset?.icon;
  const image = preset ? avatarImage(preset.id) : undefined;
  const [broken, setBroken] = useState<string>();
  const showImage = image && broken !== image;
  return (
    <span
      role="img"
      aria-label={name}
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-semibold', showImage && 'p-[3px]', AVATAR_COLOURS[avatar.colour] ?? AVATAR_COLOURS.brand, sizes[size], className)}
    >
      {showImage ? (
        <img src={image} alt="" width={256} height={256} loading="lazy" decoding="async" draggable={false} onError={() => setBroken(image)} className="h-full w-full select-none rounded-full object-cover" />
      ) : Icon ? (
        <Icon aria-hidden className={iconSizes[size]} />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </span>
  );
}
