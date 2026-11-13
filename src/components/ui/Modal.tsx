import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFocusTrap } from '@/lib/a11y';
import { IconButton } from './IconButton';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Optional override of close button label (translated). */
  closeLabel?: string;
}

export function Modal({ open, onClose, title, description, children, footer, closeLabel }: ModalProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  // Keep the dialog mounted briefly after close so it can fade out (it is inert and hidden from AT meanwhile).
  const [shown, setShown] = useState(open);
  if (open && !shown) setShown(true);
  useEffect(() => {
    if (open || !shown) return;
    const id = window.setTimeout(() => setShown(false), 160);
    return () => window.clearTimeout(id);
  }, [open, shown]);

  // Declared before the trap so inert is lifted before focus is restored.
  useEffect(() => {
    if (!open) return;
    const root = document.getElementById('root');
    root?.setAttribute('inert', '');
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      root?.removeAttribute('inert');
      document.body.style.overflow = prev;
    };
  }, [open]);
  useFocusTrap(panelRef, open, { onEscape: onClose });

  if (!open && !shown) return null;

  return createPortal(
    <div
      inert={!open || undefined}
      aria-hidden={!open || undefined}
      className={`fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 md:items-center md:p-6 ${open ? 'animate-fade-in' : 'pointer-events-none animate-fade-out'}`}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={`max-h-[90vh] w-full overflow-y-auto rounded-t-lg bg-surface p-6 shadow-raised outline-none md:max-w-lg md:rounded-lg ${open ? 'animate-sheet-up md:animate-pop' : ''}`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-xl font-semibold text-ink">{title}</h2>
            {description && <p id={descId} className="mt-1 text-sm text-ink-soft">{description}</p>}
          </div>
          <IconButton label={closeLabel ?? t('ui.common.close')} icon={<X className="h-5 w-5" />} onClick={onClose} />
        </div>
        <div>{children}</div>
        {footer && <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
