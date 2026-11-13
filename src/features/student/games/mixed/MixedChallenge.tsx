import { useState } from 'react';
import { SubjectIcon } from '@/features/student/learnKit/SubjectIcon';
import { cn } from '@/components/ui';
import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { Sprite } from '../engine/Sprite';
import { BigChoiceButton, ChoiceGroup, RoundFeedback, useGameSession, type GameSession } from '../engine';
import { makeMixedRound, ROUNDS_PER_PLAY, type MixedRound } from './mixedChallenge.generator';

const P = 'games.mixed.mixedChallenge';

const SUBJECTS = ['maths', 'science', 'ict', 'english', 'sinhala'] as const;

/**
 * Trophy stage (decorative; the subject name is in the pill and the question below). The trophy shines slowly, the five subject
 * pictures sit under it and the current round's subject pulses softly. A right answer pops a star; after any answer a rocket
 * flies up once; on the last round the trophy grows a little. Still under reduced motion; missing sprites just vanish.
 */
function TrophyStage({ subject, status, isLast }: { subject: string; status: GameSession<MixedRound>['status']; isLast: boolean }) {
  const answered = status !== 'asking';
  return (
    <div aria-hidden className="relative flex h-44 flex-col items-center justify-end gap-2 overflow-hidden rounded-2xl border-2 border-brand-100 bg-gradient-to-b from-brand-50 to-success-50 pb-3">
      <div className="relative h-24 w-24">
        <span className={cn('absolute inset-0 origin-bottom', answered && isLast && 'motion-ok:animate-gx-maths-grow')}>
          <Sprite name="trophy" size={96} eager className="h-full w-full motion-ok:animate-gx-maths-shine" />
        </span>
        {status === 'right' && <Sprite name="star" size={32} className="absolute -right-5 -top-1 h-8 w-8 motion-ok:animate-gx-star-pop" />}
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {SUBJECTS.map((s) => (
          <span key={s} className={cn('inline-flex rounded-xl', s === subject ? 'bg-surface shadow-sm ring-2 ring-brand-600 motion-ok:animate-gx-maths-pulse' : 'opacity-80')}>
            <SubjectIcon subject={s} size="sm" />
          </span>
        ))}
      </div>
      {answered && <Sprite key={status + String(isLast)} name="rocket" size={48} className="absolute bottom-2 right-3 h-12 w-12 opacity-0 motion-ok:animate-gx-fly-up" />}
    </div>
  );
}

function RoundView({ session }: { session: GameSession<MixedRound> }) {
  const t = useT();
  const { round } = session;
  const [picked, setPicked] = useState<number | boolean | null>(null);
  const asking = session.status === 'asking';
  const stateOf = (o: number | boolean, right: number | boolean) => (asking ? 'idle' : o === right ? 'right' : o === picked ? 'wrong' : 'dim');

  return (
    <div className="flex flex-col gap-5">
      <TrophyStage subject={round.subject} status={session.status} isLast={session.isLast} />
      <p className="inline-flex w-fit items-center gap-2 rounded-full border-2 border-brand-100 bg-brand-50 py-1 pl-1 pr-4 text-lg font-bold text-brand-700">
        <SubjectIcon subject={round.subject} size="sm" />
        {t(`subject.${round.subject}`)}
      </p>
      {round.subject === 'maths' ? (
        <>
          <p className="text-2xl font-bold text-ink">{t(`${P}.qMath`, { sum: round.sum })}</p>
          <ChoiceGroup label={t(`${P}.qMath`, { sum: round.sum })}>
            {round.options.map((o) => (
              <BigChoiceButton
                key={o}
                disabled={!asking}
                state={stateOf(o, round.answer)}
                onClick={() => {
                  setPicked(o);
                  session.answer(o === round.answer, round.working);
                }}
              >
                {o}
              </BigChoiceButton>
            ))}
          </ChoiceGroup>
        </>
      ) : (
        <>
          <p className="rounded-xl border-2 border-brand-600 bg-surface px-4 py-5 text-center text-2xl font-bold text-ink">{t(`${P}.fact.${round.fact}`)}</p>
          <p className="text-xl font-bold text-ink">{t(`${P}.qFact`)}</p>
          <ChoiceGroup label={t(`${P}.qFact`)}>
            {[true, false].map((v) => (
              <BigChoiceButton
                key={String(v)}
                disabled={!asking}
                state={stateOf(v, round.isTrue)}
                onClick={() => {
                  setPicked(v);
                  session.answer(v === round.isTrue, t(`${P}.why.${round.fact}`));
                }}
              >
                {t(`${P}.${v ? 'true' : 'false'}`)}
              </BigChoiceButton>
            ))}
          </ChoiceGroup>
        </>
      )}
      <RoundFeedback session={session} />
    </div>
  );
}

/** Mixed Challenge: quick questions from Maths, Science and ICT in turn. See docs/GAMES-AUTHORING.md. */
export default function MixedChallenge(props: GameComponentProps) {
  void props;
  const session = useGameSession<MixedRound>({ rounds: ROUNDS_PER_PLAY, makeRound: makeMixedRound });
  return <RoundView key={session.index} session={session} />;
}
