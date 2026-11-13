import { ArrowRight } from 'lucide-react';
import { BigActionButton, Card, GrowMeter, HelpBubble, MascotMessage, PageHeader } from '@/components/ui';
import { useLocale, type TKey } from '@/i18n';
import { formatDate, useAsync } from '@/lib';
import { studentService } from '@/services';
import { useSessionStore } from '@/store';
import { KidEmpty, KidError, KidLoading } from '../learnKit/KidState';

/** Test results: one friendly card per test, shown as a growing plant. No marks, no ranks. */
export default function ExamsPage() {
  const { t, locale } = useLocale();
  const userId = useSessionStore((s) => s.user?.id) ?? '';
  const { data, loading, error, reload } = useAsync(() => studentService.listExamReports(userId), [userId]);

  const header = <PageHeader title={t('student.exams.title')} description={t('student.exams.subtitle')} actions={<HelpBubble textKey="kidslearn.exams.help" align="end" />} />;

  if (loading && !data) {
    return (
      <div>
        {header}
        <KidLoading />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div>
        {header}
        <KidError onRetry={reload} body={t('student.exams.error')} />
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <div>
        {header}
        <KidEmpty title={t('kidslearn.exams.empty.title')} body={t('student.exams.empty')} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {header}
      <MascotMessage mood="happy" size="md" speakText={t('kidslearn.exams.note')}>
        {t('kidslearn.exams.note')}
      </MascotMessage>
      <ul className="stagger grid gap-4 md:grid-cols-2">
        {data.map((report) => {
          const name = t(`student.exams.name.${report.examId}` as TKey);
          return (
            <li key={report.id}>
              <Card as="article" interactive aria-labelledby={`exam-${report.id}`} className="flex h-full flex-col gap-4">
                <div>
                  <h2 id={`exam-${report.id}`} className="text-2xl font-bold text-ink">
                    {name}
                  </h2>
                  <p className="text-lg text-ink-soft">{formatDate(report.date, locale)}</p>
                </div>
                <GrowMeter band={report.band} size="lg" showHint />
                <BigActionButton
                  to={report.id}
                  icon={<ArrowRight />}
                  variant="secondary"
                  fullWidth
                  className="mt-auto sm:w-auto sm:self-start"
                  aria-label={t('student.exams.report.linkLabel' as TKey, { name })}
                >
                  {t('kidslearn.exams.see')}
                </BigActionButton>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
