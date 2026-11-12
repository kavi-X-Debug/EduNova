import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BookOpen, ScrollText, Users } from 'lucide-react';
import { BarChartWrapper, Card, EmptyState, PageHeader, Stat } from '@/components/ui';
import { formatDateTime, useAsync } from '@/lib';
import { adminService } from '@/services';
import type { CurriculumDoc, User } from '@/types';
import { AsyncView } from './AsyncView';
import { loadAudit, toRows, type AuditBundle } from './auditData';
import { ROLES, STATUSES, useAdminLocale } from './shared';

interface OverviewData {
  users: User[];
  docs: CurriculumDoc[];
  audit: AuditBundle;
}

async function load(): Promise<OverviewData> {
  const [users, docs, audit] = await Promise.all([adminService.listUsers(), adminService.listCurriculum(), loadAudit()]);
  return { users, docs, audit };
}

function Overview({ data }: { data: OverviewData }) {
  const { t } = useTranslation();
  const locale = useAdminLocale();
  const roleCount = (r: User['role']) => data.users.filter((u) => u.role === r).length;
  const statusCount = (s: CurriculumDoc['status']) => data.docs.filter((d) => d.status === s).length;
  const chart = STATUSES.map((s) => ({ status: t(`admin.curriculum.status.${s}`), count: statusCount(s) }));
  const summary = t('admin.overview.curriculum.summary', { draft: statusCount('draft'), review: statusCount('in_review'), published: statusCount('published') });
  const recent = toRows(data.audit, t).slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="ov-roles" className="flex flex-col gap-3">
        <h2 id="ov-roles" className="text-lg font-semibold text-ink">{t('admin.overview.roles.title')}</h2>
        {data.users.length === 0 ? (
          <EmptyState icon={<Users className="h-8 w-8" />} title={t('admin.users.empty')} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {ROLES.map((r) => (
              <Stat key={r} label={t(`common.role.${r}`)} value={roleCount(r)} />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card as="section" title={t('admin.overview.curriculum.title')}>
          {data.docs.length === 0 ? (
            <EmptyState icon={<BookOpen className="h-8 w-8" />} title={t('admin.curriculum.empty')} />
          ) : (
            <BarChartWrapper data={chart} xKey="status" yKey="count" summary={summary} height={220} footer={<p className="mt-3 text-sm text-ink-soft">{summary}</p>} />
          )}
        </Card>

        <Card as="section" title={t('admin.overview.recent.title')}>
          {recent.length === 0 ? (
            <EmptyState icon={<ScrollText className="h-8 w-8" />} title={t('admin.audit.empty')} />
          ) : (
            <>
              <ul className="flex flex-col divide-y divide-line">
                {recent.map((r) => (
                  <li key={r.id} className="py-2">
                    <p className="text-sm font-semibold text-ink">{r.action}</p>
                    <p className="text-sm text-ink-soft">
                      {t('admin.audit.actorTarget', { actor: r.actor, target: r.target })}
                    </p>
                    <time dateTime={r.at} className="text-xs text-ink-soft">
                      {formatDateTime(r.at, locale)}
                    </time>
                  </li>
                ))}
              </ul>
              <Link to="/admin/audit" className="mt-3 inline-flex min-h-[44px] items-center rounded-md font-semibold text-brand-700 underline outline-none focus-visible:shadow-focus">
                {t('admin.overview.recent.viewAll')}
              </Link>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const { t } = useTranslation();
  const state = useAsync(load, []);
  return (
    <>
      <PageHeader title={t('admin.overview.title')} description={t('admin.overview.subtitle')} />
      <AsyncView state={state} errorText={t('common.status.error')}>
        {(data) => <Overview data={data} />}
      </AsyncView>
    </>
  );
}
