import { useRef, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Button, Card, EmptyState, Modal, PageHeader, Select, Table, TBody, Td, Th, THead, Tr, useToast } from '@/components/ui';
import { formatDate, useAsync } from '@/lib';
import { adminService } from '@/services';
import type { CurriculumDoc } from '@/types';
import { AsyncView } from './AsyncView';
import { StatusBadge } from './StatusBadge';
import { STATUSES, useAdminLocale, useAdminT, type Status } from './shared';

function CurriculumManager({ initial }: { initial: CurriculumDoc[] }) {
  const t = useAdminT();
  const locale = useAdminLocale();
  const toast = useToast();
  const [docs, setDocs] = useState(initial);
  const [saving, setSaving] = useState<ReadonlySet<string>>(new Set());
  const [confirm, setConfirm] = useState<{ doc: CurriculumDoc } | null>(null);
  const inFlight = useRef(new Set<string>());

  const statusLabel = (s: Status) => t(`admin.curriculum.status.${s}`);
  const setSavingFlag = (id: string, on: boolean) =>
    setSaving((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  /** Optimistic update; restores the previous document if the service rejects. */
  const apply = async (doc: CurriculumDoc, status: Status) => {
    if (inFlight.current.has(doc.id)) return;
    inFlight.current.add(doc.id);
    const previous = doc;
    setSavingFlag(doc.id, true);
    setDocs((xs) => xs.map((d) => (d.id === doc.id ? { ...d, status } : d)));
    try {
      const saved = await adminService.updateCurriculumStatus(doc.id, status);
      setDocs((xs) => xs.map((d) => (d.id === doc.id ? saved : d)));
      toast.show({ tone: 'success', message: t('admin.curriculum.toast.success', { title: doc.title, status: statusLabel(status) }) });
    } catch {
      setDocs((xs) => xs.map((d) => (d.id === doc.id ? previous : d)));
      toast.show({ tone: 'danger', message: t('admin.curriculum.toast.error', { title: doc.title }) });
    } finally {
      inFlight.current.delete(doc.id);
      setSavingFlag(doc.id, false);
    }
  };

  const request = (doc: CurriculumDoc, status: Status) => {
    if (status === doc.status) return;
    if (status === 'published') setConfirm({ doc });
    else void apply(doc, status);
  };

  const count = (s: Status) => docs.filter((d) => d.status === s).length;

  const picker = (d: CurriculumDoc) => (
    <Select
      label={t('admin.curriculum.statusFor', { title: d.title })}
      value={d.status}
      disabled={saving.has(d.id)}
      aria-busy={saving.has(d.id) || undefined}
      onChange={(e) => request(d, e.target.value as Status)}
      options={STATUSES.map((s) => ({ value: s, label: statusLabel(s) }))}
    />
  );

  return (
    <div className="flex flex-col gap-4">
      <p role="status" className="text-sm text-ink-soft">
        {t('admin.curriculum.summary', { draft: count('draft'), review: count('in_review'), published: count('published') })}
      </p>

      <div className="hidden md:block">
        <Table caption={t('admin.curriculum.table.caption')} captionHidden>
          <THead>
            <Tr>
              <Th>{t('admin.curriculum.col.title')}</Th>
              <Th>{t('admin.curriculum.col.subject')}</Th>
              <Th>{t('admin.curriculum.col.grade')}</Th>
              <Th>{t('admin.curriculum.col.status')}</Th>
              <Th>{t('admin.curriculum.col.updated')}</Th>
            </Tr>
          </THead>
          <TBody>
            {docs.map((d) => (
              <Tr key={d.id}>
                <Th scope="row" className="font-medium text-ink">{d.title}</Th>
                <Td>{t(`subject.${d.subject}`, { defaultValue: d.subject })}</Td>
                <Td>{t('common.grade', { grade: d.grade })}</Td>
                <Td>
                  <div className="flex min-w-[12rem] flex-col gap-2">
                    <StatusBadge status={d.status} />
                    {picker(d)}
                  </div>
                </Td>
                <Td>{formatDate(d.updatedAt, locale)}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </div>

      <ul className="flex flex-col gap-3 md:hidden" aria-label={t('admin.curriculum.table.caption')}>
        {docs.map((d) => (
          <li key={d.id}>
            <Card className="flex flex-col gap-2">
              <p className="font-semibold text-ink">{d.title}</p>
              <p className="text-sm text-ink-soft">
                {t(`subject.${d.subject}`, { defaultValue: d.subject })} · {t('common.grade', { grade: d.grade })} · {formatDate(d.updatedAt, locale)}
              </p>
              <div>
                <StatusBadge status={d.status} />
              </div>
              {picker(d)}
            </Card>
          </li>
        ))}
      </ul>

      <Modal
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={t('admin.curriculum.publish.title')}
        description={confirm ? t('admin.curriculum.publish.body', { title: confirm.doc.title }) : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>
              {t('common.action.cancel')}
            </Button>
            <Button
              onClick={() => {
                if (confirm) void apply(confirm.doc, 'published');
                setConfirm(null);
              }}
            >
              {t('admin.curriculum.publish.confirm')}
            </Button>
          </>
        }
      >
        {confirm && (
          <p className="text-sm text-ink-soft">
            {confirm.doc.title}: {statusLabel(confirm.doc.status)} → {statusLabel('published')}
          </p>
        )}
      </Modal>
    </div>
  );
}

export default function CurriculumPage() {
  const t = useAdminT();
  const state = useAsync(() => adminService.listCurriculum(), []);
  return (
    <>
      <PageHeader title={t('admin.curriculum.title')} />
      <AsyncView state={state} errorText={t('admin.curriculum.error')}>
        {(docs) => (docs.length === 0 ? <EmptyState icon={<BookOpen className="h-8 w-8" />} title={t('admin.curriculum.empty')} /> : <CurriculumManager initial={docs} />)}
      </AsyncView>
    </>
  );
}
