import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Banner, Card, EmptyState, ErrorState, LoadingState, PageHeader, ReadinessBand } from '@/components/ui';
import { focusRing, touchTarget } from '@/components/ui/cn';
import { useLocale, type TKey } from '@/i18n';
import { BAND_ORDER, bandRank, formatDate, useAsync } from '@/lib';
import { studentService } from '@/services';
import { useSessionStore } from '@/store';
import type { Concept, ExamReport } from '@/types';

interface DetailData {
  reports: ExamReport[];
  concepts: Concept[];
}

export default function ExamDetailPage() {
  const { t, locale } = useLocale();
  const { id } = useParams<{ id: string }>();
  const userId = useSessionStore((s) => s.user?.id) ?? '';
  const { data, loading, error, reload } = useAsync<DetailData>(async () => {
    const [reports, concepts] = await Promise.all([studentService.listExamReports(userId), studentService.listConcepts()]);
    return { reports, concepts };
  }, [userId]);

  const backLink = (
    <Link
      to="/student/exams"
      className={`mb-2 inline-flex items-center gap-1 rounded-md px-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 ${touchTarget} ${focusRing}`}
    >
      <ArrowLeft aria-hidden className="h-4 w-4" />
      {t('student.exams.back')}
    </Link>
  );

  if (loading && !data) {
    return (
      <div aria-busy="true">
        {backLink}
        <PageHeader title={t('student.exams.report.title')} />
        <LoadingState lines={5} />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div>
        {backLink}
        <PageHeader title={t('student.exams.report.title')} />
        <ErrorState description={t('student.exams.error')} onRetry={reload} />
      </div>
    );
  }

  const report = data.reports.find((r) => r.id === id);
  if (!report) {
    return (
      <div>
        {backLink}
        <PageHeader title={t('student.exams.report.title')} />
        <EmptyState title={t('student.exams.notFound')} />
      </div>
    );
  }

  const conceptById = new Map(data.concepts.map((c) => [c.id, c]));
  const conceptTitle = (cid: string): string => {
    const c = conceptById.get(cid);
    return c ? t(c.titleKey as TKey) : cid;
  };
  
  const name = t(`student.exams.name.${report.examId}` as TKey);

  // Weakest topics first so the student sees where to focus.
  const breakdown = [...report.conceptBreakdown].sort((a, b) => bandRank(a.band) - bandRank(b.band));
  const counts = BAND_ORDER.map((b) => ({ band: b, count: breakdown.filter((m) => m.band === b).length })).filter((c) => c.count > 0);
  const summary = new Intl.ListFormat(locale, { style: 'narrow', type: 'unit' }).format(
    counts.map((c) => t('student.exams.chart.bandCount' as TKey, { band: t(`student.exams.band.${c.band}`), count: c.count })),
  );

  return (
    <div>
      {backLink}
      <PageHeader title={name} description={t('student.exams.report.subtitle' as TKey, { date: formatDate(report.date, locale) })} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="flex flex-col gap-6">
          <Card title={t('student.exams.readiness.title')}>
            <ReadinessBand band={report.band} />
            <p className="mt-3 text-base text-ink">
              <span className="font-semibold">{t(`student.exams.band.${report.band}`)}. </span>
              {t(`student.exams.band.${report.band}.desc`)}
            </p>
            <Banner tone="info" className="mt-4">
              <p className="font-semibold text-ink">{t('student.exams.readiness.bandNotMark')}</p>
              <p>{t('student.exams.readiness.note')}</p>
            </Banner>
          </Card>

          <Card title={t('student.exams.nextSteps.title')}>
            {report.nextSteps.length === 0 ? (
              <p className="text-sm text-ink-soft">{t('common.status.empty')}</p>
            ) : (
              <ul className="flex list-disc flex-col gap-2 ps-5 text-base text-ink">
                {report.nextSteps.map((s) => (
                  <li key={s}>{t(s as TKey)}</li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card as="section" title={t('student.exams.breakdown.title')} aria-label={t('student.exams.breakdown.title')}>
          {breakdown.length === 0 ? (
            <p className="text-sm text-ink-soft">{t('common.status.empty')}</p>
          ) : (
            <figure className="m-0 flex flex-col gap-3">
              <figcaption className="min-w-0 break-words text-sm text-ink-soft">
                {t('student.exams.chart.summary', {
                  count: breakdown.length,
                  summary,
                })}
              </figcaption>
              {/* Each row's band graphic is the chart; its label text is the text alternative. */}
              <ul aria-label={t('student.exams.chart.caption')} className="flex flex-col divide-y divide-line rounded-lg border border-line">
                {breakdown.map((m) => (
                  <li key={m.conceptId} className="flex min-w-0 flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="min-w-0 break-words font-medium text-ink">{conceptTitle(m.conceptId)}</span>
                    <ReadinessBand band={m.band} />
                  </li>
                ))}
              </ul>
            </figure>
          )}
        </Card>
      </div>
    </div>
  );
}
