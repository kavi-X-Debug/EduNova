import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { BarChartWrapper, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/ui';
import { useAsync } from '@/lib';
import { teacherService } from '@/services';
import { useSessionStore } from '@/store';
import { bandChartData, bandSummary } from '../bands';
import { useTranslation } from 'react-i18next';

const linkCls =
  'inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold text-brand-700 underline hover:bg-brand-50 focus-visible:shadow-focus focus-visible:outline-none';

export default function TeacherOverviewPage() {
  const { t } = useTranslation();
  const teacherId = useSessionStore((s) => s.user?.id ?? '');
  const { data, loading, error, reload } = useAsync(() => teacherService.listClasses(teacherId), [teacherId]);

  return (
    <div>
      <PageHeader title={t('teacher.overview.title')} description={t('teacher.overview.subtitle')} />
      {loading && <LoadingState label={t('ui.common.loading')} lines={4} />}
      {error && <ErrorState description={t('teacher.overview.error')} onRetry={reload} />}
      {!loading && !error && data && data.length === 0 && (
        <EmptyState icon={<Users className="h-8 w-8" />} title={t('teacher.overview.empty')} />
      )}
      {!loading && !error && data && data.length > 0 && (
        <ul className="grid gap-4 lg:grid-cols-2">
          {data.map((c) => {
            const summary = bandSummary(c.name, c.bandCounts, t);
            return (
              <li key={c.id}>
                <Card as="article" aria-labelledby={`class-${c.id}`} className="h-full">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 id={`class-${c.id}`} className="text-lg font-semibold text-ink">{c.name}</h2>
                      <p className="text-sm text-ink-soft">
                        {t('teacher.overview.classMeta', { grade: c.grade, count: c.studentCount })}
                      </p>
                    </div>
                    <Link to={`classes/${c.id}`} className={linkCls} aria-label={t('teacher.overview.openClassNamed', { name: c.name })}>
                      {t('teacher.overview.openClass')}
                    </Link>
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-ink">{t('teacher.class.bands.title')}</h3>
                  <BarChartWrapper
                    data={bandChartData(c.bandCounts, t)}
                    xKey="band"
                    yKey="count"
                    summary={summary}
                    height={180}
                    footer={<figcaption className="mt-2 text-sm text-ink-soft">{summary}</figcaption>}
                  />

                  <h3 className="mt-4 text-sm font-semibold text-ink">{t('teacher.overview.weak.title')}</h3>
                  {c.weakConceptIds.length === 0 ? (
                    <p className="mt-1 text-sm text-ink-soft">{t('teacher.overview.weak.none')}</p>
                  ) : (
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {c.weakConceptIds.map((id) => (
                        <li key={id} className="rounded-sm border border-line bg-surface-sunken px-2 py-1 text-sm text-ink">
                          {t(`concept.${id}`)}
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
