import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { useGameSession, type GameSession } from '../engine';
import { Glyph, MagnetPair, Named } from './art';
import { ChoiceRoundView } from './ChoiceRound';
import { makeMagnetRound, ROUNDS_PER_PLAY, type MagnetRound } from './magnetLab.generator';
import { SortRoundView } from './SortRound';

const P = 'games.science.magnetLab';

function RoundView({ session }: { session: GameSession<MagnetRound> }) {
  const t = useT();
  const { round } = session;
  if (round.kind === 'sort') return <SortRoundView session={session} round={round} prefix={P} question={t(`${P}.sortQuestion`)} />;
  if (round.kind === 'poles') {
    return (
      <ChoiceRoundView
        session={session}
        question={t(`${P}.polesQuestion`)}
        picture={<MagnetPair a={round.a} b={round.b} label={t(`${P}.polesLabel`, { a: round.a, b: round.b })} />}
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
      picture={<Glyph id="magnet" className="h-16 w-16 text-brand-600" />}
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
