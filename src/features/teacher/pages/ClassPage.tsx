import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, Users } from 'lucide-react';
import {
  BarChartWrapper, Button, Card, EmptyState, ErrorState, Input, LoadingState, PageHeader, ReadinessBand, Select,
  TBody, Td, Th, THead, Table, Tr,
} from '@/components/ui';
import { BAND_ORDER, bandRank, formatRelative, useAsync } from '@/lib';
import { useLocale } from '@/i18n';
import { announce } from '@/lib/a11y';
import { teacherService } from '@/services';
import { useSessionStore } from '@/store';
import type { ReadinessBand as Band, StudentRow } from '@/types';
import { bandChartData, bandSummary } from '../bands';
import { WellbeingPrompt } from '../components/WellbeingPrompt';
import { useTT } from '../strings';

type SortKey = 'name' | 'band' | 'lastActive';
type SortDir = 'asc' | 'desc';

const focusCls = 'focus-visible:shadow-focus focus-visible:outline-none';

export default function ClassPage() {
  const { id = '' } = useParams();
  const t = useTT();
  const { locale } = useLocale();
  const teacherId = useSessionStore((s) => s.user?.id ?? '');
  const { data, loading, error, reload } = useAsync(
    async () => {
      const [students, classes] = await Promise.all([teacherService.listStudents(id), teacherService.listClasses(teacherId)]);
      return { students, summary: classes.find((c) => c.id === id) };
    },
    [id, teacherId],
  );

  const [query, setQuery] = useState('');
  const [bandFilter, setBandFilter] = useState<Band | ''>('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(new Set());

  const rows = useMemo<StudentRow[]>(() => {
    const q = query.trim().toLocaleLowerCase(locale);
    const list = (data?.students ?? []).filter(
      (s) => (!bandFilter || s.band === bandFilter) && (!q || s.name.toLocaleLowerCase(locale).includes(q)),
    );
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      const cmp =
        sortKey === 'band'
          ? bandRank(a.band) - bandRank(b.band)
          : sortKey === 'lastActive'
            ? new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime()
            : a.name.localeCompare(b.name, locale);
      return (cmp || a.name.localeCompare(b.name, locale)) * dir;
    });
  }, [data, query, bandFilter, sortKey, sortDir, locale]);

  const total = data?.students.length ?? 0;
  useEffect(() => {
    if (total > 0) announce(t('teacher.class.shown', { count: rows.length }));
  }, [rows.length, total, t]);

  const prompts = useMemo(
    () => (data?.students ?? []).filter((s) => s.wellbeingPromptKey && !dismissed.has(s.id)),
    [data, dismissed],
  );

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };
  const clearFilters = () => {
    setQuery('');
    setBandFilter('');
  };

  const columns: { key: SortKey; label: string }[] = [
    { key: 'name', label: t('teacher.student.col.name') },
    { key: 'band', label: t('teacher.student.col.band') },
    { key: 'lastActive', label: t('teacher.student.col.lastActive') },
  ];
  const ariaSort = (key: SortKey) => (key !== sortKey ? 'none' : sortDir === 'asc' ? 'ascending' : 'descending');

  const back = (
    <Link to="/teacher" className={`mb-2 inline-flex min-h-11 items-center gap-1 rounded-md pr-3 text-sm font-semibold text-brand-700 underline ${focusCls}`}>
      <ChevronLeft aria-hidden className="h-4 w-4" />
      {t('teacher.class.back')}
    </Link>
  );

  const title = data?.summary ? data.summary.name : t('teacher.class.title');

  return (
    <div>
      <PageHeader
        breadcrumb={back}
        title={title}
        description={data?.summary ? t('common.grade', { grade: data.summary.grade }) : undefined}
      />
      {loading && <LoadingState label={t('ui.common.loading')} lines={5} />}
      {error && <ErrorState description={t('teacher.class.error')} onRetry={reload} />}

      {!loading && !error && data && (
        <div className="flex flex-col gap-6">
          {data.summary && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card as="section" title={t('teacher.class.bands.title')}>
                <BarChartWrapper
                  data={bandChartData(data.summary.bandCounts, t)}
                  xKey="band"
                  yKey="count"
                  height={180}
                  summary={bandSummary(data.summary.name, data.summary.bandCounts, t)}
                  footer={<figcaption className="mt-2 text-sm text-ink-soft">{bandSummary(data.summary.name, data.summary.bandCounts, t)}</figcaption>}
                />
              </Card>
              <Card as="section" title={t('teacher.class.weak.title')}>
                {data.summary.weakConceptIds.length === 0 ? (
                  <p className="text-sm text-ink-soft">{t('teacher.overview.weak.none')}</p>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {data.summary.weakConceptIds.map((cid) => (
                      <li key={cid} className="rounded-sm border border-line bg-surface-sunken px-2 py-1 text-sm text-ink">
                        {t(`concept.${cid}`)}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          )}

          {prompts.length > 0 && (
            <section aria-labelledby="wellbeing-heading" className="flex flex-col gap-3">
              <div>
                <h2 id="wellbeing-heading" className="text-lg font-semibold text-ink">{t('teacher.wellbeing.title')}</h2>
                <p className="text-sm text-ink-soft">{t('teacher.wellbeing.note')}</p>
              </div>
              {prompts.map((s) => (
                <WellbeingPrompt
                  key={s.id}
                  studentId={s.id}
                  studentName={s.name}
                  promptKey={s.wellbeingPromptKey ?? ''}
                  linkToStudent
                  onDismiss={() => setDismissed((d) => new Set(d).add(s.id))}
                />
              ))}
            </section>
          )}

          <section aria-labelledby="students-heading" className="flex flex-col gap-4">
            <h2 id="students-heading" className="text-lg font-semibold text-ink">{t('teacher.class.students.title')}</h2>

            {total === 0 ? (
              <EmptyState icon={<Users className="h-8 w-8" />} title={t('teacher.class.empty')} />
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <Input
                    type="search"
                    label={t('teacher.class.search')}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoComplete="off"
                  />
                  <Select
                    label={t('teacher.class.filter.band')}
                    value={bandFilter}
                    onChange={(e) => setBandFilter(e.target.value as Band | '')}
                    options={[{ value: '', label: t('teacher.class.band.all') }, ...BAND_ORDER.map((b) => ({ value: b, label: t(`ui.band.${b}`) }))]}
                  />
                  <div className="flex gap-2 md:hidden">
                    <Select
                      wrapperClassName="flex-1"
                      label={t('teacher.class.sort')}
                      value={sortKey}
                      onChange={(e) => setSortKey(e.target.value as SortKey)}
                      options={[
                        { value: 'name', label: t('teacher.class.sort.name') },
                        { value: 'band', label: t('teacher.class.sort.band') },
                        { value: 'lastActive', label: t('teacher.class.sort.lastActive') },
                      ]}
                    />
                    <Button
                      variant="secondary"
                      className="self-end"
                      onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                      aria-label={`${t('teacher.class.sort')}: ${sortDir === 'asc' ? t('a11y.sortedAscending') : t('a11y.sortedDescending')}`}
                    >
                      {sortDir === 'asc' ? <ArrowUp aria-hidden className="h-4 w-4" /> : <ArrowDown aria-hidden className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {rows.length === 0 ? (
                  <EmptyState
                    title={t('teacher.class.noMatch')}
                    action={<Button variant="secondary" onClick={clearFilters}>{t('teacher.class.clearFilters')}</Button>}
                  />
                ) : (
                  <>
                    <p className="text-sm text-ink-soft">{t('teacher.class.shown', { count: rows.length })}</p>

                    <div className="hidden md:block">
                      <Table caption={t('teacher.class.table.caption')} captionHidden>
                        <THead>
                          <Tr className="border-t-0">
                            {columns.map((c) => (
                              <Th key={c.key} aria-sort={ariaSort(c.key)}>
                                <button
                                  type="button"
                                  onClick={() => toggleSort(c.key)}
                                  className={`-mx-2 inline-flex min-h-11 items-center gap-1 rounded-md px-2 font-semibold ${focusCls} hover:bg-surface-sunken`}
                                  aria-label={t('teacher.class.sortColumn', { column: c.label })}
                                >
                                  {c.label}
                                  {c.key !== sortKey ? (
                                    <ArrowUpDown aria-hidden className="h-4 w-4" />
                                  ) : sortDir === 'asc' ? (
                                    <ArrowUp aria-hidden className="h-4 w-4" />
                                  ) : (
                                    <ArrowDown aria-hidden className="h-4 w-4" />
                                  )}
                                </button>
                              </Th>
                            ))}
                            <Th><span className="sr-only">{t('teacher.student.view')}</span></Th>
                          </Tr>
                        </THead>
                        <TBody>
                          {rows.map((s) => (
                            <Tr key={s.id}>
                              <Th scope="row" className="font-medium text-ink">{s.name}</Th>
                              <Td><ReadinessBand band={s.band} compact /></Td>
                              <Td>{formatRelative(s.lastActive, locale)}</Td>
                              <Td className="text-right">
                                <Link to={`/teacher/students/${s.id}`} className={`inline-flex min-h-11 items-center rounded-md px-3 font-semibold text-brand-700 underline ${focusCls}`}>
                                  {t('teacher.student.view')}
                                  <span className="sr-only"> — {s.name}</span>
                                </Link>
                              </Td>
                            </Tr>
                          ))}
                        </TBody>
                      </Table>
                    </div>

                    <ul className="flex flex-col gap-3 md:hidden" aria-label={t('teacher.class.table.caption')}>
                      {rows.map((s) => (
                        <li key={s.id}>
                          <Card className="p-4 md:p-4">
                            <p className="font-semibold text-ink">{s.name}</p>
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                              <ReadinessBand band={s.band} compact />
                              <span className="text-sm text-ink-soft">{t('common.label.lastActive', { when: formatRelative(s.lastActive, locale) })}</span>
                            </div>
                            <Link to={`/teacher/students/${s.id}`} className={`mt-2 inline-flex min-h-11 items-center rounded-md font-semibold text-brand-700 underline ${focusCls}`}>
                              {t('teacher.student.view')}
                              <span className="sr-only"> — {s.name}</span>
                            </Link>
                          </Card>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
