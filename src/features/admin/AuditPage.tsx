import { useMemo, useState } from 'react';
import { ScrollText } from 'lucide-react';
import { Card, EmptyState, PageHeader, Select, Table, TBody, Td, Th, THead, Tr } from '@/components/ui';
import { formatDateTime, useAsync } from '@/lib';
import { AsyncView } from './AsyncView';
import { loadAudit, toRows, type AuditBundle } from './auditData';
import { AUDIT_GROUPS, auditGroup, useAdminLocale, useAdminT } from './shared';

function AuditLog({ bundle }: { bundle: AuditBundle }) {
  const t = useAdminT();
  const locale = useAdminLocale();
  const [group, setGroup] = useState('');
  const rows = useMemo(() => toRows(bundle, t), [bundle, t]);
  const shown = group ? rows.filter((r) => auditGroup(r.actionCode) === group) : rows;
  const when = (iso: string) => formatDateTime(iso, locale);

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-xs">
        <Select
          label={t('admin.audit.filter.label')}
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          placeholder={t('admin.audit.filter.all')}
          options={AUDIT_GROUPS.map((g) => ({ value: g, label: t(`admin.audit.group.${g}`) }))}
        />
      </div>
      <p role="status" className="text-sm text-ink-soft">
        {t('admin.audit.showing', { shown: shown.length, total: rows.length })} {t('admin.audit.readOnly')}
      </p>

      {shown.length === 0 ? (
        <EmptyState icon={<ScrollText className="h-8 w-8" />} title={t('admin.audit.emptyFiltered')} />
      ) : (
        <>
          <div className="hidden md:block">
            <Table caption={t('admin.audit.table.caption')} captionHidden>
              <THead>
                <Tr>
                  <Th>{t('admin.audit.col.at')}</Th>
                  <Th>{t('admin.audit.col.actor')}</Th>
                  <Th>{t('admin.audit.col.action')}</Th>
                  <Th>{t('admin.audit.col.target')}</Th>
                </Tr>
              </THead>
              <TBody>
                {shown.map((r) => (
                  <Tr key={r.id}>
                    <Td>
                      <time dateTime={r.at}>{when(r.at)}</time>
                    </Td>
                    <Td>{r.actor}</Td>
                    <Td>{r.action}</Td>
                    <Td>{r.target}</Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </div>
          <ul className="flex flex-col gap-3 md:hidden" aria-label={t('admin.audit.table.caption')}>
            {shown.map((r) => (
              <li key={r.id}>
                <Card className="flex flex-col gap-1">
                  <p className="font-semibold text-ink">{r.action}</p>
                  <p className="text-sm text-ink-soft">
                    {r.actor} · {r.target}
                  </p>
                  <time dateTime={r.at} className="text-xs text-ink-soft">
                    {when(r.at)}
                  </time>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default function AuditPage() {
  const t = useAdminT();
  const state = useAsync(loadAudit, []);
  return (
    <>
      <PageHeader title={t('admin.audit.title')} description={t('admin.audit.subtitle')} />
      <AsyncView state={state} errorText={t('admin.audit.error')}>
        {(bundle) => (bundle.events.length === 0 ? <EmptyState icon={<ScrollText className="h-8 w-8" />} title={t('admin.audit.empty')} /> : <AuditLog bundle={bundle} />)}
      </AsyncView>
    </>
  );
}
