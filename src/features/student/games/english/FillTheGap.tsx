import { useState } from 'react';
import { SpeakButton } from '@/components/ui';
import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { BigChoiceButton, ChoiceGroup, RoundFeedback, TimerBar, useGameSession, type GameSession } from '../engine';
import { makeGapRound, ROUNDS_PER_PLAY, sentenceOf, type GapRound } from './fillTheGap.generator';

function RoundView({ session }: { session: GameSession<GapRound> }) {
  const t = useT();
  const { round, status } = session;
  const asking = status === 'asking';
  const [picked, setPicked] = useState<string | null>(null);
  const why = t(`games.english.fillTheGap.rule.${round.rule}`, round.vars);
  const question = t('games.english.fillTheGap.question');

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <p lang="en" className="flex-1 text-2xl font-bold text-ink">
          {round.before}{' '}
          {asking ? (
            <>
              <span aria-hidden className="inline-block min-w-20 border-b-4 border-brand-500 text-center text-brand-500">
                ?
              </span>
              <span className="sr-only">{t('games.english.fillTheGap.blank')}</span>
            </>
          ) : (
            <span className="rounded-lg bg-brand-100 px-2 text-brand-700">{round.answer}</span>
          )}{' '}
          {round.after}
        </p>
        {!asking && <SpeakButton text={sentenceOf(round)} locale="en" />}
      </div>
      {session.extraChallenge && asking && <TimerBar key={session.index} seconds={20} onElapsed={() => session.answer(false, why)} />}
      <p className="text-xl font-bold text-ink">{question}</p>
      <ChoiceGroup label={question}>
        {round.options.map((o) => (
          <BigChoiceButton
            key={o}
            lang="en"
            disabled={!asking}
            state={asking ? 'idle' : o === round.answer ? 'right' : o === picked ? 'wrong' : 'dim'}
            onClick={() => {
              setPicked(o);
              session.answer(o === round.answer, why);
            }}
          >
            {o}
          </BigChoiceButton>
        ))}
      </ChoiceGroup>
      <RoundFeedback session={session} />
    </div>
  );
}

export default function FillTheGap(props: GameComponentProps) {
  void props;
  const session = useGameSession<GapRound>({ rounds: ROUNDS_PER_PLAY, makeRound: makeGapRound });
  return <RoundView key={session.index} session={session} />;
}
