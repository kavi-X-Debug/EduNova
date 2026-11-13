import { Calculator, FlaskConical, Languages, MessageCircle, Monitor, Shapes, type LucideIcon } from 'lucide-react';

/** Big friendly picture and colour tile per subject (tokens only). */
export const SUBJECT_STYLE: Record<string, { icon: LucideIcon; tile: string }> = {
  maths: { icon: Calculator, tile: 'bg-brand-100 text-brand-700' },
  science: { icon: FlaskConical, tile: 'bg-badge-leaf-200 text-badge-leaf-800' },
  sinhala: { icon: Languages, tile: 'bg-badge-sun-200 text-badge-sun-800' },
  english: { icon: MessageCircle, tile: 'bg-badge-bloom-200 text-badge-bloom-800' },
  ict: { icon: Monitor, tile: 'bg-badge-sky-200 text-badge-sky-800' },
};

export const subjectStyle = (subject: string) => SUBJECT_STYLE[subject] ?? { icon: Shapes, tile: 'bg-surface-sunken text-ink' };
