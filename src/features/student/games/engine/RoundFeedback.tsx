import { useEffect, useRef } from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { BigActionButton, Mascot } from '@/components/ui';
import { useGt as useT } from '@/features/student/games/useGt';
import { GxSparkles } from './GameFx';
import type { GameSession } from './useGameSession';

/**
 * Kind feedback after each answer, plus the one big "Next" button. Put it under the question.
 *  - right: a short cheer (three variants, rotated by round);
 *  - wrong: "Nice try! Look again." and the right answer explained in one short sentence (`session.explanation`).
 * It is a polite live region (screen readers hear it) and moves focus to "Next" so keyboard play flows.
 * No lives, no penalties, no shame words.
 */
export function RoundFeedback({ session }: { session: Pick<GameSession<unknown>, 'status' | 'explanation' | 'isLast' | 'next' | 'index'> }) {
  const t = useT();
  const { status, explanation, isLast, next, index } = session;
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (status !== 'asking') wrap.current?.querySelector<HTMLElement>('button')?.focus();
  }, [status]);

  return (
    <div ref={wrap} className="mt-5">
      <div role="status" aria-live="polite" className="min-h-0">
        {status === 'right' && (
          <div className="flex items-center gap-4 rounded-xl border-2 border-success-700 bg-success-50 p-4 motion-ok:animate-fx-pop-in">
            <GxSparkles />
            <Mascot mood="cheer" size="sm" />
            <p className="min-w-0 break-words text-xl font-bold text-success-700">{t(`games.feedback.right.${index % 3}`)}</p>
          </div>
        )}
        {status === 'wrong' && (
          <div className="flex items-start gap-4 rounded-xl border-2 border-warning-700 bg-warning-50 p-4 motion-ok:animate-gx-fade-up">
            <Mascot mood="happy" size="sm" />
            <div className="min-w-0">
              <p className="break-words text-xl font-bold text-warning-700">{t('games.feedback.wrong')}</p>
              {explanation && <p className="mt-1 break-words text-lg text-ink">{explanation}</p>}
            </div>
          </div>
        )}
      </div>
      {status !== 'asking' && (
        <div className="mt-4 flex justify-center">
          <BigActionButton icon={isLast ? <Star /> : <ArrowRight />} onClick={next}>
            {isLast ? t('games.feedback.finish') : t('games.feedback.next')}
          </BigActionButton>
        </div>
      )}
    </div>
  );
}
