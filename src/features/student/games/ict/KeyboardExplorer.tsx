import { useState } from 'react';
import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { BigChoiceButton, ChoiceGroup, RoundFeedback, useGameSession, type GameSession } from '../engine';
import { KeyCap, MiniKeyboard } from './ictArt';
import { Coach, ScreenBuddy } from './ictSprites';
import { makeKeyRound, ROUNDS_PER_PLAY, type KeyRound } from './keyboardExplorer.generator';

const P = 'games.ict.keyboardExplorer';

function RoundView({ session }: { session: GameSession<KeyRound> }) {
  const t = useT();
  const { round, status } = session;
  const [picked, setPicked] = useState<string | null>(null);
  const asking = status === 'asking';
  const optionText = (id: string) => t(`${P}.${round.question}.${id}`);
  const why = t(`${P}.explain.${round.question}`, { key: round.key, answer: optionText(round.answer) });
  const question = t(`${P}.q.${round.question}`);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-2 rounded-xl border-2 border-brand-100 bg-brand-50 p-4">
        <Coach status={status} size={80} />
        <div className="flex min-w-0 flex-1 flex-col items-center gap-3">
          <KeyCap label={round.key} />
          <p className="text-center text-lg font-bold text-ink">{t(`${P}.keyLabel`, { key: round.key })}</p>
          {round.question === 'finger' && <MiniKeyboard target={round.key} />}
        </div>
        <ScreenBuddy status={status} size={80} className="hidden md:inline-flex" />
      </div>
      <p className="text-xl font-bold text-ink">{question}</p>
      <ChoiceGroup label={question}>
        {round.options.map((o) => (
          <BigChoiceButton
            key={o}
            disabled={!asking}
            state={asking ? 'idle' : o === round.answer ? 'right' : o === picked ? 'wrong' : 'dim'}
            onClick={() => {
              setPicked(o);
              session.answer(o === round.answer, why);
            }}
          >
            {optionText(o)}
          </BigChoiceButton>
        ))}
      </ChoiceGroup>
      <RoundFeedback session={session} />
    </div>
  );
}

/** Keyboard Explorer: group of a key, its job, or its finger. See docs/GAMES-AUTHORING.md. */
export default function KeyboardExplorer(props: GameComponentProps) {
  void props;
  const session = useGameSession<KeyRound>({ rounds: ROUNDS_PER_PLAY, makeRound: makeKeyRound });
  return <RoundView key={session.index} session={session} />;
}
