import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { useGameSession, type GameSession } from '../engine';
import { SequenceRoundView } from './SequenceRound';
import { SortRoundView } from './SortRound';
import { makeFoodRound, ROUNDS_PER_PLAY, type FoodRound } from './foodChainBuilder.generator';

const P = 'games.science.foodChainBuilder';

function RoundView({ session }: { session: GameSession<FoodRound> }) {
  const t = useT();
  const { round } = session;
  if (round.kind === 'sort') return <SortRoundView session={session} round={round} prefix={P} question={t(`${P}.sortQuestion`)} />;
  return (
    <SequenceRoundView
      session={session}
      round={round}
      question={t(`${P}.chainQuestion`)}
      itemKey={(id) => `${P}.item.${id}`}
      explainKey={`${P}.explainChain`}
      stepKey={`${P}.link`}
    />
  );
}

export default function FoodChainBuilder(props: GameComponentProps) {
  void props;
  const session = useGameSession<FoodRound>({ rounds: ROUNDS_PER_PLAY, makeRound: makeFoodRound });
  return <RoundView key={session.index} session={session} />;
}
