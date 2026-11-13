import { useState } from 'react';
import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { BigChoiceButton, ChoiceGroup, RoundFeedback, useGameSession, type GameSession } from '../engine';
import { FlowSymbolIcon } from './ictArt';
import { DiamondBuddy, FlowStrip } from './ictSprites';
import { makeFlowRound, ROUNDS_PER_PLAY, SYMBOLS, type FlowRound, type FlowSymbol } from './flowchartBuilder.generator';
import { SortBoard } from './SortBoard';

const P = 'games.ict.flowchartBuilder';
type OrderRound = Extract<FlowRound, { mode: 'order' }>;
type SymbolRound = Extract<FlowRound, { mode: 'symbol' }>;

function OrderView({ session, round }: { session: GameSession<FlowRound>; round: OrderRound }) {
  const t = useT();
  const stepText = (n: number) => t(`${P}.task.${round.task}.s${n}`);
  const zones = round.order.map((_, i) => ({ id: `z${i}`, label: t(`${P}.step`, { n: i + 1 }), capacity: 1 }));
  const answers = Object.fromEntries(round.order.map((n, i) => [String(n), `z${i}`]));
  return (
    <div className="flex flex-col gap-4">
      <FlowStrip count={round.order.length} status={session.status} />
      <p className="rounded-xl border-2 border-brand-100 bg-brand-50 px-4 py-3 text-xl font-bold text-ink">{t(`${P}.taskIs`, { task: t(`${P}.task.${round.task}.title`) })}</p>
      <p className="text-lg font-bold text-brand-700">{t(`${P}.startHere`)}</p>
      <SortBoard
        session={session}
        label={t(`${P}.qOrder`)}
        items={round.shuffled.map((n) => ({ id: String(n), text: stepText(n), label: stepText(n) }))}
        zones={zones}
        answers={answers}
        checkLabel={t(`${P}.check`)}
        explain={() => t(`${P}.explainOrder`, { order: round.order.map(stepText).join(' → ') })}
      />
      <p className="text-lg font-bold text-brand-700">{t(`${P}.stopHere`)}</p>
    </div>
  );
}

function SymbolView({ session, round }: { session: GameSession<FlowRound>; round: SymbolRound }) {
  const t = useT();
  const [picked, setPicked] = useState<FlowSymbol | null>(null);
  const asking = session.status === 'asking';
  const why = t(`${P}.explainSymbol`, { symbol: t(`${P}.sym.${round.answer}`) });
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xl font-bold text-ink">{t(`${P}.qSymbol`)}</p>
      <div className="flex items-center gap-3">
        <DiamondBuddy status={session.status} />
        <p className="min-w-0 flex-1 rounded-xl border-2 border-brand-600 bg-surface px-4 py-4 text-center text-2xl font-bold text-ink">{t(`${P}.item.${round.item}`)}</p>
      </div>
      <ChoiceGroup label={t(`${P}.qSymbol`)} columns={1}>
        {SYMBOLS.map((s) => (
          <BigChoiceButton
            key={s}
            disabled={!asking}
            state={asking ? 'idle' : s === round.answer ? 'right' : s === picked ? 'wrong' : 'dim'}
            onClick={() => {
              setPicked(s);
              session.answer(s === round.answer, why);
            }}
          >
            <span className="flex flex-col items-center gap-1 md:flex-row md:gap-3">
              <FlowSymbolIcon symbol={s} />
              <span>{t(`${P}.sym.${s}`)}</span>
            </span>
          </BigChoiceButton>
        ))}
      </ChoiceGroup>
    </div>
  );
}

function RoundView({ session }: { session: GameSession<FlowRound> }) {
  const round = session.round;
  return (
    <div className="flex flex-col gap-5">
      {round.mode === 'order' ? <OrderView session={session} round={round} /> : <SymbolView session={session} round={round} />}
      <RoundFeedback session={session} />
    </div>
  );
}

/** Flowchart Builder: put steps in order (levels 1-2), then match steps to flowchart symbols (level 3). See docs/GAMES-AUTHORING.md. */
export default function FlowchartBuilder(props: GameComponentProps) {
  void props;
  const session = useGameSession<FlowRound>({ rounds: ROUNDS_PER_PLAY, makeRound: makeFlowRound });
  return <RoundView key={session.index} session={session} />;
}
