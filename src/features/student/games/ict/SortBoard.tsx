import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Check } from 'lucide-react';
import { BigActionButton } from '@/components/ui';
import { usePrefersReducedMotion } from '@/lib/a11y';
import { useGt as useT } from '@/features/student/games/useGt';
import { DragDropZone, type DragItem, type DropZone, type GameSession } from '../engine';

export interface SortBoardProps<R> {
  session: GameSession<R>;
  /** Accessible name of the whole activity (the question). */
  label: string;
  /** Chip content for an item id; `text` is its plain translated name. */
  items: { id: string; label: ReactNode; text: string; lang?: string }[];
  zones: DropZone[];
  /** Item id -> the right zone id. */
  answers: Record<string, string>;
  /** One kid sentence for the first item that was in the wrong place. */
  explain: (itemId: string, rightZoneId: string) => string;
  /** Translated label of the check button. */
  checkLabel: string;
  /** Optional decorative Flow sprite per zone id (shown in the corner of the bin; it "opens" a little on hover or drag-over). */
  zoneSprites?: Record<string, string>;
}

/** The bin picture, drawn into the zone's corner. Decorative; lifts a little when the bin is hovered or an item is dragged over it. */
const ZONE_ART =
  'pointer-events-none absolute right-2 top-2 h-12 w-12 origin-bottom transition-transform duration-fast motion-ok:[[data-zone]:hover_&]:-translate-y-1 motion-ok:[[data-zone]:hover_&]:-rotate-6 motion-ok:[[data-zone]:hover_&]:scale-110 motion-ok:[[data-zone].border-brand-600_&]:-translate-y-1 motion-ok:[[data-zone].border-brand-600_&]:-rotate-6 motion-ok:[[data-zone].border-brand-600_&]:scale-110';

/** Draws the bin pictures into the zones (DragDropZone is shared and has no art slot, so they are added to the zone elements and removed on unmount). */
function useZoneArt(root: RefObject<HTMLDivElement | null>, sprites: Record<string, string> | undefined) {
  const key = sprites ? JSON.stringify(sprites) : '';
  useLayoutEffect(() => {
    const host = root.current;
    if (!host || !key) return;
    const made: HTMLElement[] = [];
    for (const [zone, sprite] of Object.entries(JSON.parse(key) as Record<string, string>)) {
      const el = host.querySelector<HTMLElement>(`[data-zone="${zone}"]`);
      if (!el) continue;
      el.style.position = 'relative';
      const img = document.createElement('img');
      img.src = `/game-sprites/${sprite}.png`;
      img.alt = '';
      img.width = 48;
      img.height = 48;
      img.draggable = false;
      img.decoding = 'async';
      img.setAttribute('aria-hidden', 'true');
      img.className = 'zone-art ' + ZONE_ART;
      img.onerror = () => img.remove();
      el.appendChild(img);
      made.push(img);
    }
    return () => made.forEach((m) => m.remove());
  }, [root, key]);
}

/**
 * Drag (or tap / keyboard) every item into a bin, then press the check button. Shared by the sort levels of Safe or Unsafe?,
 * Parts of a Computer and Folder Sorter. Keep it inside a child remounted per round (it holds the placements).
 * Decoration only: a placed item flies into its bin in a small arc and the bin picture does a soft "swallow" bounce (not with reduced motion).
 */
export function SortBoard<R>({ session, label, items, zones, answers, explain, checkLabel, zoneSprites }: SortBoardProps<R>) {
  const t = useT();
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const fly = useRef<{ id: string; zone: string; from: DOMRect } | null>(null);
  useZoneArt(root, zoneSprites);
  const [placements, setPlacements] = useState<Record<string, string | null>>({});
  const asking = session.status === 'asking';
  const allPlaced = items.every((i) => placements[i.id]);
  const placeFor = (id: string, zone: string | null) => {
    const chip = root.current?.querySelector<HTMLElement>(`[data-chip="${id}"]`);
    fly.current = zone && chip && !reduced ? { id, zone, from: chip.getBoundingClientRect() } : null;
    setPlacements((p) => ({ ...p, [id]: zone }));
  };
  const dragItems: DragItem[] = items;

  useLayoutEffect(() => {
    const f = fly.current;
    fly.current = null;
    if (!f || !root.current) return;
    const li = root.current.querySelector<HTMLElement>(`[data-chip="${f.id}"]`)?.parentElement;
    if (!li || typeof li.animate !== 'function') return;
    const to = li.getBoundingClientRect();
    const dx = f.from.left - to.left;
    const dy = f.from.top - to.top;
    if (Math.abs(dx) + Math.abs(dy) < 4) return;
    li.style.position = 'relative';
    li.style.zIndex = '20';
    const run = li.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(1)` },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 48}px) scale(1.12)`, offset: 0.5 },
        { transform: 'translate(0, 0) scale(1)' },
      ],
      { duration: 520, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' },
    );
    run.onfinish = run.oncancel = () => {
      li.style.zIndex = '';
    };
    const art = root.current.querySelector<HTMLElement>(`[data-zone="${f.zone}"] img.zone-art`);
    art?.animate(
      [{ transform: 'scale(1, 1)' }, { transform: 'scale(1.18, 0.84)' }, { transform: 'scale(0.94, 1.1)' }, { transform: 'scale(1, 1)' }],
      { duration: 480, delay: 380, easing: 'ease-out' },
    );
  }, [placements]);

  const check = () => {
    const wrong = items.find((i) => placements[i.id] !== answers[i.id]);
    session.answer(!wrong, wrong ? explain(wrong.id, answers[wrong.id]) : undefined);
  };

  return (
    <div ref={root} className="flex flex-col gap-4">
      <DragDropZone label={label} items={dragItems} zones={zones} placements={placements} onPlace={placeFor} disabled={!asking} />
      {asking && (
        <div className="flex flex-col items-center gap-2">
          <BigActionButton icon={<Check />} onClick={check} disabled={!allPlaced}>
            {checkLabel}
          </BigActionButton>
          {!allPlaced && <p className="text-base text-ink-soft">{t('games.ict.sortLeft', { count: items.filter((i) => !placements[i.id]).length })}</p>}
        </div>
      )}
    </div>
  );
}
