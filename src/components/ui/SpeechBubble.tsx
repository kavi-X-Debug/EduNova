import type { ReactNode } from 'react';
import type { Locale } from '@/types';
import { Mascot, type MascotMood, type MascotSize } from './Mascot';
import { SpeakButton } from './SpeakButton';
import { cn } from './cn';

export interface SpeechBubbleProps {
  children: ReactNode;
  /** Plain text to read aloud. When set, a speaker button appears (and hides itself if the device has no voice). */
  speakText?: string;
  /** Language of `speakText` when it is not the UI language. */
  speakLocale?: Locale;
  /**
   * Where the little tail points. 'auto' (default): up on small screens (mascot above) and left from 834px (mascot beside).
   * 'start' always points left, 'top' always points up, 'none' hides it.
   */
  tail?: 'auto' | 'start' | 'top' | 'none';
  className?: string;
}

const tailBase = 'pointer-events-none absolute h-4 w-4 rotate-45 border-brand-100 bg-surface';
const tailStart = '-left-[9px] top-7 border-b-2 border-l-2';
const tailTop = '-top-[9px] left-8 border-l-2 border-t-2';

/** A friendly message bubble with a tail. Text is body size (>= 18px). Put the actual message in children. */
export function SpeechBubble({ children, speakText, speakLocale, tail = 'auto', className }: SpeechBubbleProps) {
  return (
    <div className={cn('relative flex min-w-0 items-start gap-3 rounded-xl border-2 border-brand-100 bg-surface px-4 py-3 shadow-card motion-ok:animate-fx-pop-in', className)}>
      {tail === 'auto' && (
        <>
          <span aria-hidden className={cn(tailBase, tailTop, 'md:hidden')} />
          <span aria-hidden className={cn(tailBase, tailStart, 'hidden md:block')} />
        </>
      )}
      {tail === 'start' && <span aria-hidden className={cn(tailBase, tailStart)} />}
      {tail === 'top' && <span aria-hidden className={cn(tailBase, tailTop)} />}
      <div className="min-w-0 flex-1 text-lg font-semibold text-ink">{children}</div>
      {speakText && <SpeakButton text={speakText} locale={speakLocale} size="sm" />}
    </div>
  );
}

export interface MascotMessageProps {
  mood?: MascotMood;
  size?: MascotSize;
  children: ReactNode;
  speakText?: string;
  speakLocale?: Locale;
  className?: string;
}

/** Nova plus a bubble, laid out to stack on phones and sit side by side from 834px. The usual way to show Nova talking. */
export function MascotMessage({ mood = 'happy', size = 'md', children, speakText, speakLocale, className }: MascotMessageProps) {
  return (
    <div className={cn('flex flex-col items-start gap-3 md:flex-row md:items-center md:gap-4', className)}>
      <Mascot mood={mood} size={size} />
      <SpeechBubble speakText={speakText} speakLocale={speakLocale} className="w-full md:w-auto md:flex-1">
        {children}
      </SpeechBubble>
    </div>
  );
}
