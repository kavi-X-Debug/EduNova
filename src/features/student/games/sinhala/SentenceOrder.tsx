import { useState } from 'react';
import { Check, RotateCcw, Undo2 } from 'lucide-react';
import { BigActionButton, cn } from '@/components/ui';
import { focusRing } from '@/components/ui/cn';
import { useGt as useT } from '@/features/student/games/useGt';
import { announce } from '@/lib/a11y';
import type { GameComponentProps } from '@/types';
import { RoundFeedback, playSound, useGameSession, type GameSession } from '../engine';
import { Sprite } from '../engine/Sprite';
import { isSentenceRight, makeSentenceRound, ROUNDS_PER_PLAY, type SentenceRound } from './sentenceOrder.generator';

/** Coloured building blocks (CSS only): each word keeps one colour, so the blocks are easy to follow. Ink text on a light block. */
const BLOCKS = ['border-badge-sky-600 bg-badge-sky-200', 'border-badge-leaf-600 bg-badge-leaf-200', 'border-badge-sun-600 bg-badge-sun-200', 'border-badge-bloom-600 bg-badge-bloom-200'] as const;
const STRIP = ['bg-badge-sky-400', 'bg-badge-leaf-400', 'bg-badge-sun-400', 'bg-badge-bloom-400'] as const;
const chipClass = 'min-h-14 min-w-14 rounded-xl border-2 border-b-4 px-4 py-2 text-2xl text-ink shadow-card font-bold transition duration-fast ease-standard motion-reduce:transition-none disabled:cursor-not-allowed';

/** Tap-to-order sequence game: tap a word to add it to the sentence, tap it in the sentence to take it back. No dragging needed. */
function RoundView({ session }: { session: GameSession<SentenceRound> }) {
  const t = useT();
  const { round, status } = session;
  const asking = status === 'asking';
  const [order, setOrder] = useState<string[]>([]); // tile ids, in the order the child chose
  const textOf = (id: string) => round.tiles.find((x) => x.id === id)?.text ?? '';
  const blockOf = (id: string) => BLOCKS[Math.max(0, round.tiles.findIndex((x) => x.id === id)) % BLOCKS.length];
  const tray = round.tiles.filter((x) => !order.includes(x.id));
  const full = order.length === round.tiles.length;
  const placed = order.map(textOf);
  const explain = t('games.sinhala.sentenceOrder.explain', { sentence: round.answer.join(' ') });

  const add = (id: string) => {
    playSound('tap');
    setOrder((o) => [...o, id]);
    announce(t('games.sinhala.sentenceOrder.added', { word: textOf(id), n: order.length + 1, total: round.tiles.length }));
  };
  const remove = (id: string) => {
    playSound('tap');
    setOrder((o) => o.filter((x) => x !== id));
    announce(t('games.sinhala.sentenceOrder.removed', { word: textOf(id) }));
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xl font-bold text-ink">{t('games.sinhala.sentenceOrder.question')}</p>
      <section aria-label={t('games.sinhala.sentenceOrder.mine')} className="relative">
        <span aria-hidden className="mb-2 flex h-1.5 gap-1 overflow-hidden rounded-full">
          {STRIP.map((c) => (
            <span key={c} className={`h-full flex-1 ${c}`} />
          ))}
        </span>
        {status === 'right' && (
          <span aria-hidden className="absolute -top-5 right-2 z-10 origin-bottom-left motion-ok:animate-gx-sinhala-tap">
            <Sprite name="pencil" size={48} />
          </span>
        )}
        <h3 className="mb-2 text-base font-bold text-ink-soft">{t('games.sinhala.sentenceOrder.mine')}</h3>
        <ol className="flex min-h-20 flex-wrap items-center gap-3 rounded-xl border-2 border-brand-100 bg-surface p-3">
          {order.map((id, i) => (
            <li key={id} className="flex items-center gap-2 motion-ok:animate-gx-sinhala-bounce">
              <span aria-hidden className="text-base font-bold text-ink-soft">
                {i + 1}
              </span>
              <button type="button" lang="si" disabled={!asking} aria-label={t('games.drag.takeBack', { item: textOf(id) })} onClick={() => remove(id)} className={cn(chipClass, focusRing, blockOf(id))}>
                {textOf(id)}
              </button>
            </li>
          ))}
          {order.length === 0 && <li className="text-lg text-ink-soft">{t('games.sinhala.sentenceOrder.empty')}</li>}
        </ol>
      </section>
      <section aria-label={t('games.sinhala.sentenceOrder.words')}>
        <h3 className="mb-2 text-base font-bold text-ink-soft">{t('games.sinhala.sentenceOrder.words')}</h3>
        <ul className="flex min-h-16 flex-wrap gap-3 rounded-xl border-2 border-dashed border-line-strong bg-surface-muted p-3">
          {tray.map((tile) => (
            <li key={tile.id}>
              <button type="button" lang="si" disabled={!asking} onClick={() => add(tile.id)} className={cn(chipClass, focusRing, blockOf(tile.id), 'hover:brightness-95')}>
                {tile.text}
              </button>
            </li>
          ))}
          {tray.length === 0 && <li className="self-center text-base text-ink-soft">{t('games.drag.trayEmpty')}</li>}
        </ul>
      </section>
      {asking && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-wrap justify-center gap-3">
            <BigActionButton variant="secondary" icon={<Undo2 />} disabled={order.length === 0} onClick={() => setOrder((o) => o.slice(0, -1))}>
              {t('games.sinhala.sentenceOrder.undo')}
            </BigActionButton>
            <BigActionButton variant="secondary" icon={<RotateCcw />} disabled={order.length === 0} onClick={() => setOrder([])}>
              {t('games.sinhala.sentenceOrder.clear')}
            </BigActionButton>
          </div>
          <BigActionButton icon={<Check />} disabled={!full} aria-describedby={full ? undefined : 'sinhala-so-hint'} onClick={() => session.answer(isSentenceRight(round, placed), explain)}>
            {t('games.sinhala.sentenceOrder.check')}
          </BigActionButton>
          {!full && (
            <p id="sinhala-so-hint" className="text-base text-ink-soft">
              {t('games.sinhala.sentenceOrder.fillAll')}
            </p>
          )}
        </div>
      )}
      <RoundFeedback session={session} />
    </div>
  );
}

export default function SentenceOrder(props: GameComponentProps) {
  void props;
  const session = useGameSession<SentenceRound>({ rounds: ROUNDS_PER_PLAY, makeRound: makeSentenceRound });
  return <RoundView key={session.index} session={session} />;
}
