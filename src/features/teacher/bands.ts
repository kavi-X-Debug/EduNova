import type { ClassSummary } from '@/types';
import { BAND_ORDER } from '@/lib';
import type { TFunction } from 'i18next';

export function bandChartData(counts: ClassSummary['bandCounts'], t: TFunction) {
  return BAND_ORDER.map((b) => ({ band: t(`ui.band.${b}`), count: counts[b] }));
}

export function bandSummary(name: string, counts: ClassSummary['bandCounts'], t: TFunction): string {
  return t('teacher.overview.chart.summary', { name, ...counts });
}
