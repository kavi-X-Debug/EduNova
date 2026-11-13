import { useState } from 'react';
import { SubjectIcon } from '@/features/student/learnKit/SubjectIcon';
import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { BigChoiceButton, ChoiceGroup, RoundFeedback, useGameSession, type GameSession } from '../engine';
import { makeMixedRound, ROUNDS_PER_PLAY, type MixedRound } from './mixedChallenge.generator';

const P = 'games.mixed.mixedChallenge';

function RoundView({ session }: { session: GameSession<MixedRound> }) {
  const t = useT();
  const { round } = session;
  const [picked, setPicked] = useState<number | boolean | null>(null);
  const asking = session.status === 'asking';
  const stateOf = (o: number | boolean, right: number | boolean) => (asking ? 'idle' : o === right ? 'right' : o === picked ? 'wrong' : 'dim');

  return (
    <div className="flex flex-col gap-5">
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
