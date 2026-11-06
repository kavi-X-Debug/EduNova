import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import {
  Avatar, Card, EmptyState, ErrorState, LoadingState, PageHeader, ReadinessBand, Stat, TBody, Td, Th, THead, Table, Tr,
} from '@/components/ui';
import { formatRelative, useAsync } from '@/lib';
import { useLocale } from '@/i18n';
import { studentService, teacherService } from '@/services';
import { useSessionStore } from '@/store';
import { WellbeingPrompt } from '../components/WellbeingPrompt';
import { useTT } from '../strings';

const focusCls = 'focus-visible:shadow-focus focus-visible:outline-none';

export default function StudentPage() {
  const { id = '' } = useParams();
  const t = useTT();
  const { locale } = useLocale();
  const teacherId = useSessionStore((s) => s.user?.id ?? '');

  // No getStudent service exists: find the row through the teacher's own classes (see docs/REQUESTS.md).
  const { data, loading, error, reload } = useAsync(
    async () => {
      const classes = await teacherService.listClasses(teacherId);
      const lists = await Promise.all(classes.map((c) => teacherService.listStudents(c.id)));
      const student = lists.flat().find((s) => s.id === id);
      if (!student) return { student: undefined, className: undefined, mastery: [], concepts: [] };
      const [mastery, concepts] = await Promise.all([studentService.getMastery(id), studentService.listConcepts()]);
      return { student, className: classes.find((c) => c.id === student.classId)?.name, mastery, concepts };
    },
    [id, teacherId],
  );

  const conceptRows = useMemo(() => {
    const titleKey = new Map((data?.concepts ?? []).map((c) => [c.id, c.titleKey]));
    return (data?.mastery ?? []).map((m) => ({ ...m, label: t(titleKey.get(m.conceptId) ?? `concept.${m.conceptId}`) }));
  }, [data, t]);

  const student = data?.student;
  const back = (
    <Link
      to={student ? `/teacher/classes/${student.classId}` : '/teacher'}
      className={`mb-2 inline-flex min-h-11 items-center gap-1 rounded-md pr-3 text-sm font-semibold text-brand-700 underline ${focusCls}`}
    >
      <ChevronLeft aria-hidden className="h-4 w-4" />
      {student ? t('teacher.student.back') : t('teacher.class.back')}
    </Link>
  );

  return (
    <div>
      <PageHeader breadcrumb={back} title={student ? student.name : t('teacher.student.title')} description={data?.className} />
      {loading && <LoadingState label={t('ui.common.loading')} lines={5} />}
      {error && <ErrorState description={t('teacher.error')} onRetry={reload} />}
      {!loading && !error && data && !student && <EmptyState title={t('teacher.student.notFound')} />}

      {!loading && !error && student && (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Stat
              label={t('teacher.student.col.band')}
              value={<ReadinessBand band={student.band} />}
              icon={<Avatar name={student.name} size="sm" />}
            />
            <Stat label={t('teacher.student.col.lastActive')} value={formatRelative(student.lastActive, locale)} />
          </div>

          {student.wellbeingPromptKey && (
            <section aria-labelledby="wellbeing-heading" className="flex flex-col gap-3">
              <h2 id="wellbeing-heading" className="text-lg font-semibold text-ink">{t('teacher.wellbeing.title')}</h2>
              <WellbeingPrompt studentId={student.id} studentName={student.name} promptKey={student.wellbeingPromptKey} />
              <p className="text-sm text-ink-soft">{t('teacher.wellbeing.note')}</p>
            </section>
          )}

          <Card as="section" title={t('teacher.student.concepts.title')}>
            {conceptRows.length === 0 ? (
              <EmptyState title={t('teacher.student.concepts.empty')} />
            ) : (
              <>
                <div className="hidden md:block">
                  <Table caption={t('teacher.student.concepts.caption', { name: student.name })} captionHidden>
                    <THead>
                      <Tr className="border-t-0">
                        <Th>{t('teacher.student.col.concept')}</Th>
                        <Th>{t('teacher.student.col.band')}</Th>
                        <Th>{t('teacher.student.col.updated')}</Th>
                      </Tr>
                    </THead>
                    <TBody>
                      {conceptRows.map((m) => (
                        <Tr key={m.conceptId}>
                          <Th scope="row" className="font-medium text-ink">{m.label}</Th>
                          <Td><ReadinessBand band={m.band} compact /></Td>
                          <Td>{formatRelative(m.updatedAt, locale)}</Td>
                        </Tr>
                      ))}
                    </TBody>
                  </Table>
                </div>
                <ul className="flex flex-col gap-3 md:hidden" aria-label={t('teacher.student.concepts.caption', { name: student.name })}>
                  {conceptRows.map((m) => (
                    <li key={m.conceptId} className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3 last:border-0">
                      <span className="font-medium text-ink">{m.label}</span>
                      <ReadinessBand band={m.band} compact />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
