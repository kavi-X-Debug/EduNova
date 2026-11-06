import { adminService } from '@/services';
import type { AuditEvent } from '@/types';
import { auditActionLabel, type AdminT } from './shared';

export interface AuditRow {
  id: string;
  actor: string;
  action: string;
  actionCode: string;
  target: string;
  at: string;
}

export interface AuditBundle {
  events: AuditEvent[];
  actors: Map<string, string>;
  targets: Map<string, string>;
}

/** Loads audit events plus the lookups needed to turn ids into readable names. */
export async function loadAudit(): Promise<AuditBundle> {
  const [events, users, docs] = await Promise.all([adminService.listAuditEvents(), adminService.listUsers(), adminService.listCurriculum()]);
  const actors = new Map(users.map((u) => [u.id, u.name]));
  const targets = new Map<string, string>([...users.map((u) => [u.id, u.name] as const), ...docs.map((d) => [d.id, d.title] as const)]);
  return { events, actors, targets };
}

const LOCALES = ['en', 'si', 'ta'];

export function toRows(bundle: AuditBundle, t: AdminT): AuditRow[] {
  return bundle.events.map((e) => {
    let target = bundle.targets.get(e.target);
    if (!target) {
      if (e.target === 'session') target = t('admin.audit.target.session');
      else if (LOCALES.includes(e.target)) target = t(`common.language.${e.target}`);
      else target = e.target;
    }
    return {
      id: e.id,
      actor: bundle.actors.get(e.actorId) ?? t('admin.audit.actor.unknown'),
      action: auditActionLabel(t, e.action),
      actionCode: e.action,
      target,
      at: e.at,
    };
  });
}
