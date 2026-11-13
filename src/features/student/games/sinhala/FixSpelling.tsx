import { useState } from 'react';
import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { BigChoiceButton, ChoiceGroup, RoundFeedback, useGameSession, type GameSession } from '../engine';
import { makeSpellingRound, ROUNDS_PER_PLAY, type SpellingRound } from './fixSpelling.generator';
import { Sprite } from '../engine/Sprite';
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
      {/* The magnifier sweeps over the picture (or over the pencil card in the odd-one-out round). Decorative. */}
      <div className="relative mx-auto w-40 overflow-hidden rounded-xl border-2 border-brand-100 bg-surface p-3 sm:w-48">
        {odd ? (
          <div className="flex aspect-square items-center justify-center">
            <Sprite name="pencil" size={96} />
          </div>
        ) : (
          <SinhalaPicture id={round.picture} label={t(`games.sinhala.pic.${round.picture}`)} />
        )}
        {asking && (
          <span aria-hidden className="absolute bottom-2 left-2 motion-ok:animate-gx-sinhala-sweep">
            <Sprite name="magnifier" size={48} />
          </span>
        )}
      </div>
      <ChoiceGroup label={question}>
        {round.options.map((o) => {
          const isRight = !asking && o === round.correct;
          const isWrong = !asking && o === picked && o !== round.correct;
          return (
            <div key={o} className="relative">
              <BigChoiceButton
                lang="si"
                disabled={!asking}
                className="text-3xl"
                state={asking ? 'idle' : isRight ? 'right' : isWrong ? 'wrong' : 'dim'}
                onClick={() => {
                  setPicked(o);
                  session.answer(o === round.correct, why);
                }}
              >
                {o}
              </BigChoiceButton>
              {isRight && (
                <span aria-hidden className="absolute -right-2 -top-3 z-10 motion-ok:animate-gx-star-pop">
                  <Sprite name="check" size={40} />
                </span>
              )}
              {isWrong && (
                <span aria-hidden className="absolute -right-2 -top-3 z-10 motion-ok:animate-gx-sinhala-rub">
                  <Sprite name="eraser" size={44} />
                </span>
              )}
            </div>
          );
        })}
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
