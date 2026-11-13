import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { useGameSession, type GameSession } from '../engine';
import { MagnetPair, Named } from './art';
import { ChoiceRoundView } from './ChoiceRound';
import { makeMagnetRound, ROUNDS_PER_PLAY, type MagnetRound } from './magnetLab.generator';
import { MagnetPolesStage, MagnetStage } from './ScienceFx';
import { SortRoundView } from './SortRound';

const P = 'games.science.magnetLab';

function RoundView({ session }: { session: GameSession<MagnetRound> }) {
  const t = useT();
  const { round } = session;
  if (round.kind === 'sort') {
    return (
      <div className="flex flex-col items-center gap-4">
        <MagnetStage kind="pull" status={session.status} />
        <div className="w-full">
          <SortRoundView session={session} round={round} prefix={P} question={t(`${P}.sortQuestion`)} />
        </div>
      </div>
    );
  }
  if (round.kind === 'poles') {
    return (
      <ChoiceRoundView
        session={session}
        question={t(`${P}.polesQuestion`)}
        picture={
          <div className="flex w-full flex-col items-center gap-3">
            <MagnetPair a={round.a} b={round.b} label={t(`${P}.polesLabel`, { a: round.a, b: round.b })} />
            <MagnetPolesStage attract={round.answer === 'attract'} status={session.status} />
          </div>
        }
        options={[
          { id: 'attract', content: t(`${P}.attract`) },
          { id: 'repel', content: t(`${P}.repel`) },
        ]}
        answerId={round.answer}
        explanation={t(round.answer === 'repel' ? `${P}.explainRepel` : `${P}.explainAttract`)}
      />
    );
  }
  return (
    <ChoiceRoundView
      session={session}
      question={t(`${P}.pickupQuestion`)}
      picture={<MagnetStage kind="pickup" status={session.status} />}
      options={round.options.map((id) => ({ id, content: <Named id={id} text={t(`${P}.item.${id}`)} /> }))}
      answerId={round.answer}
      explanation={t(`${P}.explainPickup`, { item: t(`${P}.item.${round.answer}`) })}
    />
  );
}

export default function MagnetLab(props: GameComponentProps) {
  void props;
  const session = useGameSession<MagnetRound>({ rounds: ROUNDS_PER_PLAY, makeRound: makeMagnetRound });
  return <RoundView key={session.index} session={session} />;
}
