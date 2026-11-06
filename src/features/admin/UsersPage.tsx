import { useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Input, PageHeader, Select, Table, TBody, Td, Th, THead, Tr } from '@/components/ui';
import { useAsync } from '@/lib';
import { adminService } from '@/services';
import type { Role, User } from '@/types';
import { AsyncView } from './AsyncView';
import { ROLES, useAdminT } from './shared';

const roleTone = { student: 'brand', teacher: 'success', admin: 'warning' } as const;

function UsersList({ users }: { users: User[] }) {
  const t = useAdminT();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<'' | Role>('');

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => (!role || u.role === role) && (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)));
  }, [users, query, role]);

  const grade = (u: User) => (u.grade ? t('common.grade', { grade: u.grade }) : '-');
  const roleBadge = (r: Role) => <Badge tone={roleTone[r]}>{t(`common.role.${r}`)}</Badge>;

  return (
    <div className="flex flex-col gap-4">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="grid gap-3 md:grid-cols-[1fr_16rem]">
        <Input type="search" label={t('admin.users.search')} value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
        <Select
          label={t('admin.users.filter.role')}
          value={role}
          onChange={(e) => setRole(e.target.value as '' | Role)}
          placeholder={t('admin.users.filter.all')}
          options={ROLES.map((r) => ({ value: r, label: t(`common.role.${r}`) }))}
        />
      </form>
      <p role="status" className="text-sm text-ink-soft">
        {t('admin.users.showing', { shown: shown.length, total: users.length })}
      </p>

      {shown.length === 0 ? (
        <EmptyState
          icon={<Search className="h-8 w-8" />}
          title={t('admin.users.emptyFiltered')}
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery('');
                setRole('');
              }}
            >
              {t('admin.users.clearFilters')}
            </Button>
          }
        />
      ) : (
        <>
          <div className="hidden md:block">
            <Table caption={t('admin.users.table.caption')} captionHidden>
              <THead>
                <Tr>
                  <Th>{t('admin.users.col.name')}</Th>
                  <Th>{t('admin.users.col.email')}</Th>
                  <Th>{t('admin.users.col.role')}</Th>
                  <Th>{t('admin.users.col.grade')}</Th>
                </Tr>
              </THead>
              <TBody>
                {shown.map((u) => (
                  <Tr key={u.id}>
                    <Th scope="row" className="font-medium text-ink">{u.name}</Th>
                    <Td>{u.email}</Td>
                    <Td>{roleBadge(u.role)}</Td>
                    <Td>{grade(u)}</Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </div>
          <ul className="flex flex-col gap-3 md:hidden" aria-label={t('admin.users.table.caption')}>
            {shown.map((u) => (
              <li key={u.id}>
                <Card className="flex flex-col gap-1">
                  <p className="font-semibold text-ink">{u.name}</p>
                  <p className="break-all text-sm text-ink-soft">{u.email}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
                    {roleBadge(u.role)}
                    {u.grade ? <span>{grade(u)}</span> : null}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default function UsersPage() {
  const t = useAdminT();
  const state = useAsync(() => adminService.listUsers(), []);
  return (
    <>
      <PageHeader title={t('admin.users.title')} />
      <AsyncView state={state} errorText={t('admin.users.error')}>
        {(users) => (users.length === 0 ? <EmptyState icon={<Users className="h-8 w-8" />} title={t('admin.users.empty')} /> : <UsersList users={users} />)}
      </AsyncView>
    </>
  );
}
