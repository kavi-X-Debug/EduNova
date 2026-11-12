import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Card, EmptyState, ErrorState, LoadingState, PageHeader, ReadinessBand } from '@/components/ui';
import { focusRing, touchTarget } from '@/components/ui/cn';
import { useLocale, type TKey } from '@/i18n';
import { formatDate, useAsync } from '@/lib';
import { studentService } from '@/services';
import { useSessionStore } from '@/store';

export default function ExamsPage() {
  const { t, locale } = useLocale();
  const userId = useSessionStore((s) => s.user?.id) ?? '';
  const { data, loading, error, reload } = useAsync(() => studentService.listExamReports(userId), [userId]);

  const header = <PageHeader title={t('student.exams.title')} description={t('student.exams.subtitle')} />;

  if (loading && !data) {
    return (
      <div aria-busy="true">
        {header}
        <LoadingState lines={4} />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div>
        {header}
        <ErrorState description={t('student.exams.error')} onRetry={reload} />
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <div>
        {header}
        <EmptyState title={t('student.exams.empty')} />
      </div>
    );
  }

  return (
    <div>
      {header}
      <p className="mb-4 max-w-prose text-sm text-ink-soft">{t('student.exams.readiness.note')}</p>
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((report) => {
          
          const name = t(`student.exams.name.${report.examId}` as TKey);
          return (
            <li key={report.id}>
              <Card as="article" className="flex h-full flex-col gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-ink">{name}</h2>
                  <p className="text-sm text-ink-soft">{formatDate(report.date, locale)}</p>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-ink-soft">{t('student.exams.readiness.title')}</h3>
                  <ReadinessBand band={report.band} />
                  <p className="mt-2 text-sm text-ink-soft">{t(`student.exams.band.${report.band}.desc`)}</p>
                </div>
                <Link
                  to={report.id}
                  aria-label={t('student.exams.report.linkLabel' as TKey, { name })}
                  className={`mt-auto inline-flex items-center gap-1 self-start rounded-md border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-surface-sunken ${touchTarget} ${focusRing}`}
                >
                  {t('student.exams.report.title')}
                  <ChevronRight aria-hidden className="h-4 w-4" />
                </Link>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
