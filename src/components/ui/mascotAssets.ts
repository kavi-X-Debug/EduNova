import type { MascotMood } from './Mascot';

export const MASCOT_MOODS: readonly MascotMood[] = ['happy', 'thinking', 'cheer', 'oops', 'sleepy', 'wave'];
export const mascotSrc = (mood: MascotMood) => `/mascot/nova-${mood}.png`;

/** Warm the browser cache for all six poses so Nova never pops in late (call from a hub page). */
export function preloadMascots(): void {
  MASCOT_MOODS.forEach((m) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = mascotSrc(m);
  });
}
