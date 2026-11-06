import type { ClassSummary } from '@/types';
import { BAND_ORDER } from '@/lib';
import type { TT } from './strings';

export function bandChartData(counts: ClassSummary['bandCounts'], t: TT) {
  return BAND_ORDER.map((b) => ({ band: t(`ui.band.${b}`), count: counts[b] }));
}

export function bandSummary(name: string, counts: ClassSummary['bandCounts'], t: TT): string {
  return t('teacher.overview.chart.summary', { name, ...counts });
}
