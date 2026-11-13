import { useGamePrefsStore } from '@/store/useGamePrefsStore';

export type GameSound = 'tap' | 'right' | 'wrong' | 'finish';

/** Notes in Hz (each sound is one or two soft sine notes). Original, tiny, quiet; nothing sudden or loud. */
const NOTES: Record<GameSound, number[]> = {
  tap: [440],
  right: [523, 659],
  wrong: [330, 294],
  finish: [523, 659, 784],
};
const VOLUME = 0.06;
const NOTE_SECONDS = 0.16;

let ctx: AudioContext | null = null;

/**
 * Plays a short generated sound, only when the child turned Sound on in Me (default OFF).
 * Silent when the browser has no Web Audio. Call from a click/tap handler (browsers need a gesture).
 */
export function playSound(sound: GameSound): void {
  if (!useGamePrefsStore.getState().sound) return;
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    ctx ??= new Ctor();
    if (ctx.state === 'suspended') void ctx.resume();
    const start = ctx.currentTime;
    NOTES[sound].forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      const t0 = start + i * NOTE_SECONDS;
      osc.type = 'sine';
      osc.frequency.value = freq;
      // fade in and out so there is never a click or a sudden start
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(VOLUME, t0 + 0.03);
      gain.gain.linearRampToValueAtTime(0.0001, t0 + NOTE_SECONDS);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(t0);
      osc.stop(t0 + NOTE_SECONDS + 0.02);
    });
  } catch {
    /* sound is a bonus: ignore any audio failure */
  }
}
