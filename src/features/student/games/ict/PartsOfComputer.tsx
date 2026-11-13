import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/components/ui';
import { focusRing } from '@/components/ui/cn';
import { announce } from '@/lib/a11y';
import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { RoundFeedback, playSound, useGameSession, type GameSession } from '../engine';
import { DeviceIcon } from './ictArt';
import { DEVICES, GROUPS, makePartsRound, ROUNDS_PER_PLAY, type PartsRound } from './partsOfComputer.generator';
import { SortBoard } from './SortBoard';

const P = 'games.ict.partsOfComputer';
type Sel = { side: 'device' | 'job'; id: string } | null;

/** Matching: tap a part, then tap its job (or the job first). A wrong pair gives a gentle hint and you try again; the round counts as right when no pair was wrong. */
function MatchView({ session, round }: { session: GameSession<PartsRound>; round: Extract<PartsRound, { mode: 'match' }> }) {
  const t = useT();
  const [sel, setSel] = useState<Sel>(null);
  const [done, setDone] = useState<string[]>([]);
  const [slips, setSlips] = useState<string[]>([]);
  const [msg, setMsg] = useState('');
  const asking = session.status === 'asking';
  const dev = (id: string) => t(`${P}.dev.${id}`);
  const job = (id: string) => t(`${P}.job.${id}`);

  const choose = (side: 'device' | 'job', id: string) => {
    if (!asking || done.includes(id)) return;
    playSound('tap');
    if (!sel || sel.side === side) {
      setSel(sel && sel.side === side && sel.id === id ? null : { side, id });
      return;
    }
    const deviceId = side === 'device' ? id : sel.id;
    const jobId = side === 'job' ? id : sel.id;
    setSel(null);
    if (deviceId === jobId) {
      const next = [...done, deviceId];
      setDone(next);
      const text = t(`${P}.matched`, { device: dev(deviceId), job: job(deviceId) });
      setMsg(text);
      announce(text);
      if (next.length === round.devices.length) {
        session.answer(slips.length === 0, slips.length ? t(`${P}.explainMatch`, { device: dev(slips[0]), job: job(slips[0]) }) : undefined);
      }
    } else {
      setSlips((s) => (s.includes(deviceId) ? s : [...s, deviceId]));
      const text = t(`${P}.notMatch`);
      setMsg(text);
      announce(text);
    }
  };

  const card = (side: 'device' | 'job', id: string) => {
    const isDone = done.includes(id);
    const isSel = sel?.side === side && sel.id === id;
    return (
      <li key={`${side}${id}`}>
        <button
          type="button"
          disabled={!asking || isDone}
          aria-pressed={isSel}
          onClick={() => choose(side, id)}
          className={cn(
            'flex min-h-16 w-full items-center gap-3 rounded-xl border-2 px-4 py-2 text-left text-lg font-bold transition duration-fast ease-standard',
            focusRing,
            isDone ? 'border-success-700 bg-success-50 text-success-700' : isSel ? 'border-brand-600 bg-brand-100 text-brand-700 ring-2 ring-brand-500' : 'border-brand-100 bg-surface text-ink hover:border-brand-500',
          )}
        >
          {side === 'device' && <DeviceIcon id={id} className="h-12 w-12 shrink-0" />}
          <span className="flex-1">{side === 'device' ? dev(id) : job(id)}</span>
          {isDone && (
            <>
              <Check aria-hidden className="h-6 w-6 shrink-0" />
              <span className="sr-only">{t(`${P}.done`)}</span>
            </>
          )}
        </button>
      </li>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xl font-bold text-ink">{t(`${P}.qMatch`)}</p>
      <div className="grid gap-5 md:grid-cols-2">
        <ul aria-label={t(`${P}.parts`)} className="flex flex-col gap-3">{round.devices.map((d) => card('device', d))}</ul>
        <ul aria-label={t(`${P}.jobs`)} className="flex flex-col gap-3">{round.jobs.map((j) => card('job', j))}</ul>
      </div>
      <p className="text-base text-ink-soft">{t(`${P}.progress`, { done: done.length, total: round.devices.length })}</p>
      <p role="status" aria-live="polite" className="min-h-6 text-lg font-bold text-brand-700">{asking ? msg : ''}</p>
    </div>
  );
}

function RoundView({ session }: { session: GameSession<PartsRound> }) {
  const t = useT();
  const round = session.round;
  return (
    <div className="flex flex-col gap-5">
      {round.mode === 'match' ? (
        <MatchView session={session} round={round} />
      ) : (
        <SortBoard
          session={session}
          label={t(`${P}.qSort`)}
          items={round.devices.map((d) => ({ id: d, text: t(`${P}.dev.${d}`), label: <span className="flex items-center gap-2"><DeviceIcon id={d} className="h-9 w-9" />{t(`${P}.dev.${d}`)}</span> }))}
          zones={GROUPS.map((g) => ({ id: g, label: t(`${P}.group.${g}`) }))}
          answers={Object.fromEntries(round.devices.map((d) => [d, DEVICES[d]]))}
          checkLabel={t(`${P}.check`)}
          explain={(d, g) => t(`${P}.explainSort`, { device: t(`${P}.dev.${d}`), group: t(`${P}.group.${g}`) })}
        />
      )}
      <RoundFeedback session={session} />
    </div>
  );
}

/** Parts of a Computer: match parts to jobs (levels 1-2), sort into Input / Output / Inside (level 3). See docs/GAMES-AUTHORING.md. */
export default function PartsOfComputer(props: GameComponentProps) {
  void props;
  const session = useGameSession<PartsRound>({ rounds: ROUNDS_PER_PLAY, makeRound: makePartsRound });
  return <RoundView key={session.index} session={session} />;
}
