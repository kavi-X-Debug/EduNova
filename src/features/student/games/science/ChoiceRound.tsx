import { useState, type ReactNode } from 'react';
import { BigChoiceButton, ChoiceGroup, RoundFeedback, type GameSession } from '../engine';

export interface ChoiceOption {
  id: string;
  content: ReactNode;
}

/** "Tap the right one" for the science games: question, optional picture, big choices, kind feedback. One attempt. */
export function ChoiceRoundView({
  session,
  question,
  options,
  answerId,
  explanation,
  picture,
  columns,
}: {
  session: GameSession<unknown>;
  question: string;
  options: ChoiceOption[];
  answerId: string;
  /** One short kid sentence shown after a wrong answer. */
  explanation: string;
  picture?: ReactNode;
  columns?: 1 | 2;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const asking = session.status === 'asking';
  return (
    <div className="flex flex-col gap-5">
      {picture && <div className="flex justify-center">{picture}</div>}
      <p className="text-xl font-bold text-ink">{question}</p>
      <ChoiceGroup label={question} columns={columns}>
        {options.map((o) => (
          <BigChoiceButton
            key={o.id}
            disabled={!asking}
            state={asking ? 'idle' : o.id === answerId ? 'right' : o.id === picked ? 'wrong' : 'dim'}
            onClick={() => {
              setPicked(o.id);
              session.answer(o.id === answerId, explanation);
            }}
          >
            {o.content}
          </BigChoiceButton>
        ))}
      </ChoiceGroup>
      <RoundFeedback session={session} />
    </div>
  );
}
