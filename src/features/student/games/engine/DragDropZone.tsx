import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { cn } from '@/components/ui';
import { focusRing } from '@/components/ui/cn';
import { announce } from '@/lib/a11y';
import { useGt as useT } from '@/features/student/games/useGt';
import { playSound } from './sound';

export interface DragItem {
  id: string;
  /** What is drawn on the chip (text, emoji-free picture...). */
  label: ReactNode;
  /** Plain-text name for screen readers and announcements. */
  text: string;
  /** Language of `text` when it differs from the page. */
  lang?: string;
}
export interface DropZone {
  id: string;
  /** Plain, translated name of the place ("Solid", "Step 1"). */
  label: string;
  /** Most items it can hold (default: any number). */
  capacity?: number;
}

export interface DragDropZoneProps {
  items: DragItem[];
  zones: DropZone[];
  /** itemId -> zoneId, or null / missing when the item is still in the tray. */
  placements: Record<string, string | null | undefined>;
  /** Called when an item is dropped or tapped into a zone, or sent back (`zoneId` null). */
  onPlace: (itemId: string, zoneId: string | null) => void;
  disabled?: boolean;
  /** Accessible name of the whole activity, e.g. "Sort the things". */
  label: string;
}

interface Drag { id: string; x: number; y: number; startX: number; startY: number; moved: boolean }
const THRESHOLD = 8;

/**
 * Drag and drop with big, forgiving zones AND a tap alternative:
 *  - mouse/touch: drag a chip onto a zone (or just tap/click it and tap the zone's "Put here" button);
 *  - keyboard: Tab to a chip, Enter/Space to pick it up, Tab to a zone's "Put here" button, Enter to drop;
 *  - tap a placed chip to send it back to the tray.
 * Controlled: you own `placements`. It never marks anything: check the placements yourself, then call session.answer.
 */
export function DragDropZone({ items, zones, placements, onPlace, disabled, label }: DragDropZoneProps) {
  const t = useT();
  const [selected, setSelected] = useState<string | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const justDragged = useRef(false);
  const focusAfter = useRef<string | null>(null);

  const itemById = (id: string) => items.find((i) => i.id === id);
  const inZone = (zoneId: string) => items.filter((i) => placements[i.id] === zoneId);
  const tray = items.filter((i) => !placements[i.id]);

  useEffect(() => {
    if (!focusAfter.current) return;
    const el = rootRef.current?.querySelector<HTMLElement>(`[data-chip="${focusAfter.current}"]`);
    focusAfter.current = null;
    el?.focus();
  });

  const place = (itemId: string, zoneId: string | null) => {
    const item = itemById(itemId);
    if (!item) return;
    if (zoneId) {
      const zone = zones.find((z) => z.id === zoneId);
      if (!zone) return;
      if (zone.capacity !== undefined && inZone(zoneId).filter((i) => i.id !== itemId).length >= zone.capacity) {
        announce(t('games.drag.full', { zone: zone.label }));
        return;
      }
      announce(t('games.drag.placed', { item: item.text, zone: zone.label }));
      focusAfter.current = itemId;
    } else {
      announce(t('games.drag.returned', { item: item.text }));
    }
    playSound('tap');
    setSelected(null);
    onPlace(itemId, zoneId);
  };

  const zoneAt = (x: number, y: number): string | null => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-zone]');
    return el?.dataset.zone ?? null;
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>, id: string) => {
    if (disabled || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ id, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, moved: false });
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const moved = drag.moved || Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > THRESHOLD;
    setDrag({ ...drag, x: e.clientX, y: e.clientY, moved });
    setOver(moved ? zoneAt(e.clientX, e.clientY) : null);
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const wasDrag = drag.moved;
    const id = drag.id;
    setDrag(null);
    setOver(null);
    if (!wasDrag) return; // a tap: the click handler selects the chip
    justDragged.current = true;
    window.setTimeout(() => (justDragged.current = false), 0);
    const zoneId = zoneAt(e.clientX, e.clientY);
    if (zoneId) place(id, zoneId);
  };

  const chip = (item: DragItem, zoneId: string | null) => {
    const isSel = selected === item.id;
    const isDrag = drag?.moved && drag.id === item.id;
    return (
      <li key={item.id}>
        <button
          type="button"
          data-chip={item.id}
          lang={item.lang}
          disabled={disabled}
          aria-pressed={zoneId ? undefined : isSel}
          aria-label={zoneId ? t('games.drag.takeBack', { item: item.text }) : undefined}
          onPointerDown={(e) => onPointerDown(e, item.id)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            setDrag(null);
            setOver(null);
          }}
          onClick={() => {
            if (justDragged.current) return;
            if (zoneId) place(item.id, null);
            else setSelected(isSel ? null : item.id);
          }}
          style={{ touchAction: 'none' }}
          className={cn(
            'min-h-14 min-w-14 cursor-grab select-none rounded-xl border-2 px-4 py-2 text-lg font-bold transition duration-fast ease-standard',
            focusRing,
            isSel ? 'border-brand-600 bg-brand-100 text-brand-700 ring-2 ring-brand-500 ring-offset-1' : 'border-brand-100 bg-surface text-ink hover:border-brand-500',
            isDrag && 'opacity-40',
            disabled && 'cursor-not-allowed opacity-60',
          )}
        >
          {item.label}
        </button>
      </li>
    );
  };

  const selectedItem = selected ? itemById(selected) : undefined;
  const ghost = drag?.moved ? itemById(drag.id) : undefined;

  return (
    <div ref={rootRef} role="group" aria-label={label} className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-base font-bold text-ink-soft">{selectedItem ? t('games.drag.pickZone', { item: selectedItem.text }) : t('games.drag.tray')}</p>
        <ul aria-label={t('games.drag.tray')} className="flex min-h-16 flex-wrap gap-3 rounded-xl border-2 border-dashed border-line-strong bg-surface-muted p-3">
          {tray.map((i) => chip(i, null))}
          {tray.length === 0 && <li className="self-center text-base text-ink-soft">{t('games.drag.trayEmpty')}</li>}
        </ul>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {zones.map((z) => {
          const placed = inZone(z.id);
          const hot = over === z.id;
          return (
            <section
              key={z.id}
              data-zone={z.id}
              aria-label={z.label}
              className={cn('flex min-h-32 flex-col gap-3 rounded-xl border-2 p-3 transition-colors duration-fast', hot ? 'border-brand-600 bg-brand-50' : 'border-brand-100 bg-surface')}
            >
              <h3 className="text-lg font-bold text-ink">{z.label}</h3>
              <ul className="flex min-h-14 flex-wrap gap-2">{placed.map((i) => chip(i, z.id))}</ul>
              <button
                type="button"
                disabled={disabled || !selectedItem}
                onClick={() => selected && place(selected, z.id)}
                aria-label={selectedItem ? t('games.drag.putHereNamed', { item: selectedItem.text, zone: z.label }) : t('games.drag.putHere')}
                className={cn(
                  'mt-auto min-h-14 rounded-lg border-2 border-dashed px-4 py-2 text-base font-bold',
                  focusRing,
                  selectedItem ? 'border-brand-600 bg-brand-50 text-brand-700 hover:bg-brand-100' : 'border-line text-ink-faint',
                )}
              >
                {t('games.drag.putHere')}
              </button>
            </section>
          );
        })}
      </div>
      {ghost && drag && (
        <div aria-hidden className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 border-brand-600 bg-brand-100 px-4 py-2 text-lg font-bold text-brand-700 shadow-raised" style={{ left: drag.x, top: drag.y }}>
          {ghost.label}
        </div>
      )}
    </div>
  );
}
