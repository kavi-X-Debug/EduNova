import { useState } from 'react';
import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { BigChoiceButton, ChoiceGroup, RoundFeedback, useGameSession, type GameSession } from '../engine';
import { makeSpellingRound, ROUNDS_PER_PLAY, type SpellingRound } from './fixSpelling.generator';
import { SinhalaPicture } from './pictures';

function RoundView({ session }: { session: GameSession<SpellingRound> }) {
  const t = useT();
  const { round, status } = session;
  const asking = status === 'asking';
  const [picked, setPicked] = useState<string | null>(null);
  const odd = round.mode === 'odd';
  const question = t(odd ? 'games.sinhala.fixSpelling.qOdd' : 'games.sinhala.fixSpelling.qPicture');
  const why = t(odd ? 'games.sinhala.fixSpelling.explainOdd' : 'games.sinhala.fixSpelling.explain', { word: round.word, letter: round.letter });

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xl font-bold text-ink">{question}</p>
      {!odd && (
        <div className="mx-auto w-40 rounded-xl border-2 border-brand-100 bg-surface p-3 sm:w-48">
          <SinhalaPicture id={round.picture} label={t(`games.sinhala.pic.${round.picture}`)} />
        </div>
      )}
      <ChoiceGroup label={question}>
        {round.options.map((o) => (
          <BigChoiceButton
            key={o}
            lang="si"
            disabled={!asking}
            className="text-3xl"
            state={asking ? 'idle' : o === round.correct ? 'right' : o === picked ? 'wrong' : 'dim'}
            onClick={() => {
              setPicked(o);
              session.answer(o === round.correct, why);
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

export default function FixSpelling(props: GameComponentProps) {
  void props;
  const session = useGameSession<SpellingRound>({ rounds: ROUNDS_PER_PLAY, makeRound: makeSpellingRound });
  return <RoundView key={session.index} session={session} />;
}
