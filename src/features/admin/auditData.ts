import { adminService, teacherService } from '@/services';
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
  const [events, users, docs, classes] = await Promise.all([
    adminService.listAuditEvents(),
    adminService.listUsers(),
    adminService.listCurriculum(),
    // Unknown teacher id returns every class (admin needs the full set for names only).
    teacherService.listClasses('').catch(() => []),
  ]);
  const actors = new Map(users.map((u) => [u.id, u.name]));
  const targets = new Map<string, string>([
    ...users.map((u) => [u.id, u.name] as const),
    ...docs.map((d) => [d.id, d.title] as const),
    ...classes.map((c) => [c.id, c.name] as const),
  ]);
  return { events, actors, targets };
}

const LOCALES = ['en', 'si', 'ta'];

export function toRows(bundle: AuditBundle, t: AdminT): AuditRow[] {
  return bundle.events.map((e) => {
    let target = bundle.targets.get(e.target);
    if (!target) {
      if (e.target === 'session') target = t('admin.audit.target.session') as string;
      else if (LOCALES.includes(e.target)) target = t(`common.language.${e.target}`) as string;
      else target = t('admin.audit.target.unknown', { defaultValue: 'Unknown item' }) as string;
    }
    return {
      id: e.id,
      actor: bundle.actors.get(e.actorId) ?? (t('admin.audit.actor.unknown') as string),
      action: auditActionLabel(t, e.action),
      actionCode: e.action,
      target,
      at: e.at,
    };
  });
}
