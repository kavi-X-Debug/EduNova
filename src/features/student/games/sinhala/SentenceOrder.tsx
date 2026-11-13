import { useState } from 'react';
import { Check, RotateCcw, Undo2 } from 'lucide-react';
import { BigActionButton, cn } from '@/components/ui';
import { focusRing } from '@/components/ui/cn';
import { useGt as useT } from '@/features/student/games/useGt';
import { announce } from '@/lib/a11y';
import type { GameComponentProps } from '@/types';
import { RoundFeedback, playSound, useGameSession, type GameSession } from '../engine';
import { isSentenceRight, makeSentenceRound, ROUNDS_PER_PLAY, type SentenceRound } from './sentenceOrder.generator';

const chipClass = 'min-h-14 min-w-14 rounded-xl border-2 px-4 py-2 text-2xl font-bold transition duration-fast ease-standard motion-reduce:transition-none disabled:cursor-not-allowed';

/** Tap-to-order sequence game: tap a word to add it to the sentence, tap it in the sentence to take it back. No dragging needed. */
function RoundView({ session }: { session: GameSession<SentenceRound> }) {
  const t = useT();
  const { round, status } = session;
  const asking = status === 'asking';
  const [order, setOrder] = useState<string[]>([]); // tile ids, in the order the child chose
  const textOf = (id: string) => round.tiles.find((x) => x.id === id)?.text ?? '';
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
      <section aria-label={t('games.sinhala.sentenceOrder.mine')}>
        <h3 className="mb-2 text-base font-bold text-ink-soft">{t('games.sinhala.sentenceOrder.mine')}</h3>
        <ol className="flex min-h-20 flex-wrap items-center gap-3 rounded-xl border-2 border-brand-100 bg-surface p-3">
          {order.map((id, i) => (
            <li key={id} className="flex items-center gap-2">
              <span aria-hidden className="text-base font-bold text-ink-soft">
                {i + 1}
              </span>
              <button type="button" lang="si" disabled={!asking} aria-label={t('games.drag.takeBack', { item: textOf(id) })} onClick={() => remove(id)} className={cn(chipClass, focusRing, 'border-brand-600 bg-brand-50 text-brand-700')}>
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
              <button type="button" lang="si" disabled={!asking} onClick={() => add(tile.id)} className={cn(chipClass, focusRing, 'border-brand-100 bg-surface text-ink hover:border-brand-500')}>
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
