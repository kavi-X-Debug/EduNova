import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/components/ui';
import { focusRing } from '@/components/ui/cn';
import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { playSound, RoundFeedback, useGameSession, type GameSession } from '../engine';
import { Sprite } from '../engine/Sprite';
import { makeWordMatchRound, ROUNDS_PER_PLAY, type WordMatchRound } from './wordMatch.generator';

type Side = 'L' | 'R';
interface Sel { side: Side; pair: number }

/** Words that have a picture in the Flow art: the picture rides along inside the button (decorative; the word is the clue). */
const WORD_PICTURE: Record<string, string> = { apple: 'apple', apples: 'apple', tree: 'tree', trees: 'tree' };
/** The sprite that sits beside each kind of prompt. */
const KIND_SPRITE: Record<string, string> = { opposite: 'card-pair', plural: 'apple', young: 'tree' };

/** One word button. A matched pair shares a number, so a match never depends on colour alone. */
function WordButton({ word, selected, matchNo, disabled, onClick }: { word: string; selected: boolean; matchNo?: number; disabled: boolean; onClick: () => void }) {
  const t = useT();
  const done = matchNo !== undefined;
  return (
    <button
      type="button"
      lang="en"
      disabled={disabled || done}
      aria-pressed={done ? undefined : selected}
      onClick={onClick}
      className={cn(
        'flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border-2 px-3 py-2 text-xl font-bold transition duration-fast ease-standard motion-reduce:transition-none',
        focusRing,
        done && 'border-success-700 bg-success-50 text-success-700',
        !done && selected && 'border-brand-600 bg-brand-100 text-brand-700 ring-2 ring-brand-500 ring-offset-1',
        !done && !selected && 'border-brand-100 bg-surface text-ink hover:border-brand-500 hover:bg-brand-50',
        !done && disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      {done && <Check aria-hidden className="h-5 w-5 shrink-0" />}
      {WORD_PICTURE[word.toLowerCase()] && <Sprite name={WORD_PICTURE[word.toLowerCase()]} size={32} className="h-8 w-8" />}
      <span>{word}</span>
      {done && (
        <>
          <span aria-hidden className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-success-700 px-1 text-lg text-surface">
            {matchNo}
          </span>
          <span className="sr-only">{`${t('games.english.wordMatch.matchedWord')}, ${t('games.english.wordMatch.pair', { n: matchNo })}`}</span>
        </>
      )}
    </button>
  );
}

function RoundView({ session }: { session: GameSession<WordMatchRound> }) {
  const t = useT();
  const { round, status } = session;
  const asking = status === 'asking';
  const [matched, setMatched] = useState<number[]>([]);
  const [sel, setSel] = useState<Sel | null>(null);
  const [missed, setMissed] = useState<number[]>([]);
  const [note, setNote] = useState<{ text: string; ok: boolean } | null>(null);
  const [last, setLast] = useState<{ a: string; b: string; n: number } | null>(null);

  const choose = (side: Side, pair: number) => {
    if (!asking || matched.includes(pair)) return;
    if (!sel || sel.side === side) {
      setSel(sel && sel.side === side && sel.pair === pair ? null : { side, pair });
      setNote(null);
      return;
    }
    const leftPair = side === 'L' ? pair : sel.pair;
    setSel(null);
    if (sel.pair === pair) {
      const p = round.pairs[pair];
      const now = [...matched, pair];
      setMatched(now);
      setLast({ a: p.a, b: p.b, n: now.length });
      setNote({ text: t('games.english.wordMatch.matched', { a: p.a, b: p.b }), ok: true });
      playSound('tap');
      if (now.length === round.pairs.length) {
        const tricky = missed.map((i) => `${round.pairs[i].a} = ${round.pairs[i].b}`).join(', ');
        session.answer(missed.length === 0, t('games.english.wordMatch.explain', { pairs: tricky }));
      }
    } else {
      if (!missed.includes(leftPair)) setMissed([...missed, leftPair]);
      setNote({ text: t('games.english.wordMatch.miss'), ok: false });
    }
  };

  const selWord = sel ? (sel.side === 'L' ? round.pairs[sel.pair].a : round.pairs[sel.pair].b) : '';
  const status_ = sel ? t('games.english.wordMatch.selected', { word: selWord }) : note?.text;
  const matchNo = (pair: number) => (matched.includes(pair) ? matched.indexOf(pair) + 1 : undefined);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Sprite name={KIND_SPRITE[round.kind] ?? 'card-pair'} size={56} eager className="h-14 w-14 motion-ok:animate-gx-english-hover" />
        <p className="text-xl font-bold text-ink">{t(`games.english.wordMatch.prompt.${round.kind}`)}</p>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div role="group" aria-label={t('games.english.wordMatch.leftLabel')} className="flex flex-col gap-3">
          {round.pairs.map((p, i) => (
            <WordButton key={p.a} word={p.a} selected={sel?.side === 'L' && sel.pair === i} matchNo={matchNo(i)} disabled={!asking} onClick={() => choose('L', i)} />
          ))}
        </div>
        <div role="group" aria-label={t('games.english.wordMatch.rightLabel')} className="flex flex-col gap-3">
          {round.rightOrder.map((i) => (
            <WordButton key={round.pairs[i].b} word={round.pairs[i].b} selected={sel?.side === 'R' && sel.pair === i} matchNo={matchNo(i)} disabled={!asking} onClick={() => choose('R', i)} />
          ))}
        </div>
      </div>
      {/* The latest matched pair: two little cards slide together and pop. A decorative copy of the status text below. */}
      <div aria-hidden className="flex h-14 items-center justify-center gap-1 overflow-hidden">
        {last && (
          <div key={last.n} className="flex items-center gap-1 motion-ok:animate-gx-pop" style={{ animationDelay: '440ms' }}>
            <span lang="en" className="rounded-lg border-2 border-success-700 bg-success-50 px-3 py-1 text-lg font-bold text-success-700 motion-ok:animate-gx-english-slide-l">
              {last.a}
            </span>
            <Sprite name="card-pair" size={32} className="h-8 w-8" />
            <span lang="en" className="rounded-lg border-2 border-success-700 bg-success-50 px-3 py-1 text-lg font-bold text-success-700 motion-ok:animate-gx-english-slide-r">
              {last.b}
            </span>
          </div>
        )}
      </div>
      <p role="status" aria-live="polite" className={cn('min-h-7 text-lg font-bold', note && !sel && !note.ok ? 'text-warning-700' : note && !sel ? 'text-success-700' : 'text-brand-700')}>
        {status_}
      </p>
      <RoundFeedback session={session} />
    </div>
  );
}

export default function WordMatch(props: GameComponentProps) {
  void props;
  const session = useGameSession<WordMatchRound>({ rounds: ROUNDS_PER_PLAY, makeRound: makeWordMatchRound });
  return <RoundView key={session.index} session={session} />;
}
