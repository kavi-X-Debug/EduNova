import { useState } from 'react';
import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { BigChoiceButton, ChoiceGroup, RoundFeedback, TimerBar, useGameSession, type GameSession } from '../engine';
import { PrepositionScene } from './PrepositionScene';
import { makePrepositionRound, ROUNDS_PER_PLAY, type PrepositionRound } from './pickThePreposition.generator';

function RoundView({ session }: { session: GameSession<PrepositionRound> }) {
  const t = useT();
  const { round, status } = session;
  const asking = status === 'asking';
  const [picked, setPicked] = useState<string | null>(null);
  const full = `${round.before} ${round.answer} ${round.after}`;
  const why =
    round.mode === 'scene'
      ? t('games.english.pickThePreposition.explainScene', { sentence: full })
      : t(`games.english.pickThePreposition.rule.${round.rule}`, { prep: round.answer, example: round.example });
  const question = t(round.mode === 'scene' ? 'games.english.pickThePreposition.questionScene' : 'games.english.pickThePreposition.questionTime');

  return (
    <div className="flex flex-col gap-5">
      {round.scene && <PrepositionScene scene={round.scene} label={t('games.english.pickThePreposition.sceneAlt', { sentence: full })} />}
      <p lang="en" className="text-2xl font-bold text-ink">
        {round.before}{' '}
        {asking ? (
          <>
            <span aria-hidden className="inline-block min-w-20 border-b-4 border-brand-500 text-center text-brand-500">
              ?
            </span>
            <span className="sr-only">{t('games.english.pickThePreposition.blank')}</span>
          </>
        ) : (
          <span className="rounded-lg bg-brand-100 px-2 text-brand-700">{round.answer}</span>
        )}{' '}
        {round.after}
      </p>
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

export default function PickThePreposition(props: GameComponentProps) {
  void props;
  const session = useGameSession<PrepositionRound>({ rounds: ROUNDS_PER_PLAY, makeRound: makePrepositionRound });
  return <RoundView key={session.index} session={session} />;
}
