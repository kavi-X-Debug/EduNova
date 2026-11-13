import { useState } from 'react';
import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { BigChoiceButton, ChoiceGroup, RoundFeedback, useGameSession, type GameSession } from '../engine';
import { wordOf, type PictureId } from './data/words';
import { makeMatchRound, ROUNDS_PER_PLAY, type MatchRound } from './matchWordPicture.generator';
import { SinhalaPicture } from './pictures';

function RoundView({ session }: { session: GameSession<MatchRound> }) {
  const t = useT();
  const { round, status } = session;
  const asking = status === 'asking';
  const [picked, setPicked] = useState<PictureId | null>(null);
  const target = wordOf(round.target);
  const name = (id: PictureId) => t(`games.sinhala.pic.${id}`);
  const why = t('games.sinhala.matchWordPicture.explain', { word: target.word, name: name(round.target) });
  const stateOf = (id: PictureId) => (asking ? 'idle' : id === round.target ? 'right' : id === picked ? 'wrong' : 'dim');
  const pick = (id: PictureId) => {
    setPicked(id);
    session.answer(id === round.target, why);
  };
  const question = t(round.mode === 'word' ? 'games.sinhala.matchWordPicture.qWord' : 'games.sinhala.matchWordPicture.qPicture');

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xl font-bold text-ink">{question}</p>
      {round.mode === 'word' ? (
        <div className="mx-auto w-44 rounded-xl border-2 border-brand-100 bg-surface p-3 sm:w-52">
          <SinhalaPicture id={round.target} label={name(round.target)} />
        </div>
      ) : (
        <p lang="si" className="text-center text-4xl font-bold text-ink">
          {target.word}
        </p>
      )}
      <ChoiceGroup label={question}>
        {round.options.map((id) => (
          <BigChoiceButton key={id} lang={round.mode === 'word' ? 'si' : undefined} disabled={!asking} state={stateOf(id)} onClick={() => pick(id)} className={round.mode === 'word' ? 'text-3xl' : 'min-h-32'}>
            {round.mode === 'word' ? wordOf(id).word : <SinhalaPicture id={id} label={name(id)} className="h-20 w-20" />}
          </BigChoiceButton>
        ))}
      </ChoiceGroup>
      <RoundFeedback session={session} />
    </div>
  );
}

export default function MatchWordPicture(props: GameComponentProps) {
  void props;
  const session = useGameSession<MatchRound>({ rounds: ROUNDS_PER_PLAY, makeRound: makeMatchRound });
  return <RoundView key={session.index} session={session} />;
}
