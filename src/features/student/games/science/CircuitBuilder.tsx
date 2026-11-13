import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { useGameSession, type GameSession } from '../engine';
import { CircuitSvg, Named, type CircuitProps } from './art';
import { CircuitSprites } from './ScienceFx';
import { ChoiceRoundView } from './ChoiceRound';
import { makeCircuitRound, ROUNDS_PER_PLAY, type CircuitRound, type Fault, type Part } from './circuitBuilder.generator';
import { SortRoundView } from './SortRound';

const P = 'games.science.circuitBuilder';

/** Convenience for the generator's `Fault` / missing `Part` -> drawing. */
function circuitFor(opts: { missing?: Part; fault?: Fault; solved?: boolean }): Omit<CircuitProps, 'label'> {
  const { missing, fault = 'none', solved = false } = opts;
  const out = !solved && missing;
  return {
    battery: !(out === 'battery') && fault !== 'noBattery',
    bulb: !(out === 'bulb') && fault !== 'noBulb',
    sw: out === 'switch' ? 'none' : fault === 'switchOpen' ? 'open' : 'closed',
    wireBroken: fault === 'wireBroken',
    hint: Boolean(missing) && !solved,
    lit: false,
  };
}

function CircuitPicture({ c, lit, label }: { c: Omit<CircuitProps, 'label'>; lit: boolean; label: string }) {
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <CircuitSvg {...c} lit={lit} label={label} />
      <CircuitSprites battery={c.battery} bulb={c.bulb} sw={c.sw} lit={lit} />
    </div>
  );
}

function RoundBody({ session }: { session: GameSession<CircuitRound> }) {
  const t = useT();
  const { round } = session;
  const done = session.status !== 'asking';
  if (round.kind === 'sort') return <SortRoundView session={session} round={round} prefix={P} question={t(`${P}.sortQuestion`)} />;
  if (round.kind === 'missing') {
    const c = circuitFor({ missing: round.missing, solved: done });
    return (
      <ChoiceRoundView
        session={session}
        question={t(`${P}.missingQuestion`)}
        picture={<CircuitPicture c={c} lit={done} label={t(`${done ? `${P}.labelSolved` : `${P}.labelMissing`}`)} />}
        options={round.options.map((p) => ({ id: p, content: <Named id={p} text={t(`${P}.part.${p}`)} /> }))}
        answerId={round.missing}
        explanation={t(`${P}.explainMissing.${round.missing}`)}
        columns={1}
      />
    );
  }
  const c = circuitFor({ fault: round.fault });
  return (
    <ChoiceRoundView
      session={session}
      question={t(`${P}.lightQuestion`)}
      picture={<CircuitPicture c={c} lit={done && round.lights} label={t(`${P}.label.${round.fault}`)} />}
      options={[
        { id: 'yes', content: t(`${P}.yes`) },
        { id: 'no', content: t(`${P}.no`) },
      ]}
      answerId={round.lights ? 'yes' : 'no'}
      explanation={t(`${P}.explainFault.${round.fault}`)}
    />
  );
}

function RoundView({ session }: { session: GameSession<CircuitRound> }) {
  const t = useT();
  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-xl border-2 border-badge-sun-400 bg-badge-sun-200 px-4 py-3 text-lg font-bold text-ink">{t(`${P}.safety`)}</p>
      <RoundBody session={session} />
    </div>
  );
}

export default function CircuitBuilder(props: GameComponentProps) {
  void props;
  const session = useGameSession<CircuitRound>({ rounds: ROUNDS_PER_PLAY, makeRound: makeCircuitRound });
  return <RoundView key={session.index} session={session} />;
}
