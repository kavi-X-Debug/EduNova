import { useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { BigActionButton, ButtonLink, Card, GrowMeter, HelpBubble, MascotMessage, PageHeader } from '@/components/ui';
import { SubjectIcon } from '../learnKit/SubjectIcon';
import { useLocale, type TKey } from '@/i18n';
import { bandRank, formatDate, useAsync } from '@/lib';
import { studentService } from '@/services';
import { useSessionStore } from '@/store';
import type { Concept, ExamReport } from '@/types';
import { KidEmpty, KidError, KidLoading } from '../learnKit/KidState';

interface DetailData {
  reports: ExamReport[];
  concepts: Concept[];
}

/** One test result: how I am growing, 1-3 things to practise next, then a button into the trail. */
export default function ExamDetailPage() {
  const { t, locale } = useLocale();
  const { id } = useParams<{ id: string }>();
  const userId = useSessionStore((s) => s.user?.id) ?? '';
  const { data, loading, error, reload } = useAsync<DetailData>(async () => {
    const [reports, concepts] = await Promise.all([studentService.listExamReports(userId), studentService.listConcepts()]);
    return { reports, concepts };
  }, [userId]);

  const backLink = (
    <ButtonLink to="/student/exams" variant="ghost" size="lg" leftIcon={<ArrowLeft aria-hidden className="h-5 w-5" />} className="mb-4">
      {t('student.exams.back')}
    </ButtonLink>
  );
  const header = <PageHeader title={t('student.exams.report.title')} actions={<HelpBubble textKey="kidslearn.exams.help" align="end" />} />;

  if (loading && !data) {
    return (
      <div>
        {backLink}
        {header}
        <KidLoading />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div>
        {backLink}
        {header}
        <KidError onRetry={reload} body={t('student.exams.error')} />
      </div>
    );
  }

  const report = data.reports.find((r) => r.id === id);
  if (!report) {
    return (
      <div>
        {backLink}
        {header}
        <KidEmpty title={t('student.exams.notFound')} />
      </div>
    );
  }

  const conceptById = new Map(data.concepts.map((c) => [c.id, c]));
  const conceptTitle = (cid: string): string => {
    const c = conceptById.get(cid);
    return c ? t(c.titleKey as TKey) : cid;
  };
  const name = t(`student.exams.name.${report.examId}` as TKey);

  // Growing topics first would be nice, but the child needs to know where to practise: weakest first.
  const breakdown = [...report.conceptBreakdown].sort((a, b) => bandRank(a.band) - bandRank(b.band));
  // "What to practise next": up to 3 topics that are still growing, in simple words.
  const weak = breakdown.filter((m) => m.band === 'building' || m.band === 'developing').slice(0, 3);
  const nextSteps = weak.map((m) => t('kids.home.plan.step.practice', { topic: conceptTitle(m.conceptId) }));
  if (nextSteps.length === 0) nextSteps.push(t('kidslearn.exams.next.keepGoing'));

  return (
    <div className="flex flex-col gap-6">
      <div>
        {backLink}
        <PageHeader title={name} description={formatDate(report.date, locale)} actions={<HelpBubble textKey="kidslearn.exams.help" align="end" />} className="mb-0" />
      </div>

      <Card as="section" raised aria-labelledby="exam-grow" className="flex flex-col gap-4 border-brand-100 bg-gradient-to-b from-brand-50 to-surface">
        <MascotMessage mood={report.band === 'building' ? 'happy' : 'cheer'} size="lg" speakText={t(`kids.grow.hint.${report.band}` as TKey)}>
          <h2 id="exam-grow" className="text-xl font-bold text-ink">
            {t('kids.grow.title')}
          </h2>
          <span className="mt-1 block font-normal text-ink-soft">{t(`kids.grow.hint.${report.band}` as TKey)}</span>
        </MascotMessage>
        <GrowMeter band={report.band} size="lg" />
        <p className="text-lg text-ink-soft">{t('kidslearn.exams.note')}</p>
      </Card>

      <Card as="section" aria-labelledby="exam-next" className="flex flex-col gap-4">
        <h2 id="exam-next" className="text-2xl font-bold text-ink">
          {t('kidslearn.exams.next.title')}
        </h2>
        <ol className="flex flex-col gap-3">
          {nextSteps.map((s, i) => (
            <li key={s} className="flex items-center gap-4 rounded-xl border border-line bg-surface-muted p-3">
              <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-surface">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 text-xl font-semibold text-ink">{s}</span>
            </li>
          ))}
        </ol>
        <BigActionButton to="/student/path" icon={<ArrowRight />} fullWidth className="md:w-auto md:self-start">
          {t('kidslearn.exams.next.go')}
        </BigActionButton>
      </Card>

      {breakdown.length > 0 && (
        <Card as="section" aria-labelledby="exam-topics" className="flex flex-col gap-3">
          <h2 id="exam-topics" className="text-2xl font-bold text-ink">
            {t('student.exams.breakdown.title')}
          </h2>
          <ul aria-label={t('student.exams.chart.caption')} className="flex flex-col divide-y divide-line">
            {breakdown.map((m) => (
              <li key={m.conceptId} className="group flex min-w-0 flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="flex min-w-0 items-center gap-3 text-lg font-semibold text-ink">
                  <SubjectIcon subject={conceptById.get(m.conceptId)?.subject ?? ''} size="sm" />
                  <span className="min-w-0 break-words">{conceptTitle(m.conceptId)}</span>
                </span>
                <GrowMeter band={m.band} size="sm" />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
