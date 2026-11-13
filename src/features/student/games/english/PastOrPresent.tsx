import { useState } from 'react';
import { Check } from 'lucide-react';
import { BigActionButton } from '@/components/ui';
import { useGt as useT } from '@/features/student/games/useGt';
import type { GameComponentProps } from '@/types';
import { Sprite } from '../engine/Sprite';
import { DragDropZone, RoundFeedback, useGameSession, type DragItem, type DropZone, type GameSession } from '../engine';
import { makeTenseRound, ROUNDS_PER_PLAY, type TenseRound } from './pastOrPresent.generator';

type Zone = 'past' | 'present';

/**
 * The picture cues: a calendar for the past (its page flips back), an alarm clock for the present (it rings softly), and an hourglass
 * next to the past when the sentences use was / were. Decorative: the zone names are also in the real drop zones below.
 * Placing a sentence in a zone replays that zone's little motion.
 */
function CueStrip({ pulse, hourglass }: { pulse: { zone: Zone; n: number } | null; hourglass: boolean }) {
  const t = useT();
  const pastN = pulse?.zone === 'past' ? pulse.n : 0;
  const nowN = pulse?.zone === 'present' ? pulse.n : 0;
  return (
    <div aria-hidden className="grid grid-cols-2 gap-3">
      <div className="flex flex-col items-center gap-1 rounded-xl border-2 border-brand-100 bg-surface p-2 text-center md:flex-row md:gap-2 md:text-left">
        <span className="inline-flex items-center gap-1">
          <span key={`p${pastN}`} className="inline-flex origin-left motion-ok:animate-gx-english-flip">
            <Sprite name="calendar" size={56} eager className="h-14 w-14" />
          </span>
          {hourglass && (
            <span className="inline-flex motion-ok:animate-gx-english-turn">
              <Sprite name="hourglass" size={40} className="h-10 w-10" />
            </span>
          )}
        </span>
        <span className="min-w-0 break-words text-lg font-bold text-ink">{t('games.english.pastOrPresent.zone.past')}</span>
      </div>
      <div className="flex flex-col items-center gap-1 rounded-xl border-2 border-brand-100 bg-surface p-2 text-center md:flex-row md:gap-2 md:text-left">
        <span key={`n${nowN}`} className="inline-flex motion-ok:animate-gx-english-ring">
          <Sprite name="alarm-clock" size={56} eager className="h-14 w-14" />
        </span>
        <span className="min-w-0 break-words text-lg font-bold text-ink">{t('games.english.pastOrPresent.zone.present')}</span>
      </div>
    </div>
  );
}

function RoundView({ session }: { session: GameSession<TenseRound> }) {
  const t = useT();
  const { round, status } = session;
  const asking = status === 'asking';
  const [placements, setPlacements] = useState<Record<string, string | null>>({});
  const [pulse, setPulse] = useState<{ zone: Zone; n: number } | null>(null);
  const hourglass = round.items.some((s) => /\b(was|were)\b/i.test(s.cue));
  const items: DragItem[] = round.items.map((s, i) => ({ id: `s${i}`, label: s.text, text: s.text, lang: 'en' }));
  const zones: DropZone[] = [
    { id: 'past', label: t('games.english.pastOrPresent.zone.past') },
    { id: 'present', label: t('games.english.pastOrPresent.zone.present') },
  ];
  const allPlaced = items.every((i) => placements[i.id]);

  const check = () => {
    if (!asking || !allPlaced) return;
    const wrongAt = round.items.findIndex((s, i) => placements[`s${i}`] !== s.tense);
    if (wrongAt < 0) return session.answer(true);
    const s = round.items[wrongAt];
    session.answer(false, t(`games.english.pastOrPresent.explain.${s.tense}`, { cue: s.cue }));
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xl font-bold text-ink">{t('games.english.pastOrPresent.question')}</p>
      <CueStrip pulse={pulse} hourglass={hourglass} />
      <DragDropZone
        label={t('games.english.pastOrPresent.label')}
        items={items}
        zones={zones}
        placements={placements}
        disabled={!asking}
        onPlace={(id, zone) => {
          setPlacements((p) => ({ ...p, [id]: zone }));
          if (zone === 'past' || zone === 'present') setPulse((p) => ({ zone, n: (p?.n ?? 0) + 1 }));
        }}
      />
      {asking && (
        <div>
          <BigActionButton icon={<Check />} disabled={!allPlaced} onClick={check}>
            {t('games.english.common.check')}
          </BigActionButton>
        </div>
      )}
      <RoundFeedback session={session} />
    </div>
  );
}

export default function PastOrPresent(props: GameComponentProps) {
  void props;
  const session = useGameSession<TenseRound>({ rounds: ROUNDS_PER_PLAY, makeRound: makeTenseRound });
  return <RoundView key={session.index} session={session} />;
}
