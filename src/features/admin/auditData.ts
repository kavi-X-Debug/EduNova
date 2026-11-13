import { adminService, teacherService } from '@/services';
import { classLabel, docTitle } from '@/lib';
import type { AuditEvent, ClassSummary } from '@/types';
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
  /** id -> label renderer, so names (class, curriculum) follow the current language */
  targets: Map<string, (t: AdminT) => string>;
}

/**
 * Class id -> name pairs for audit targets. Isolated here on purpose.
 * WARNING: this relies on a mock quirk: `teacherService.listClasses('')` returns every class only
 * because the mock treats an unknown teacher id as "demo access to all". A real backend will not,
 * and the call also exposes per-class band counts that admins do not need.
 * TODO(go-live): add `adminService.listClasses()` (id + name only) or have the audit API return
 * resolved target labels, then replace the body below and delete the mock fallback.
 * Any failure degrades to no names, so affected targets render as "Unknown item".
 */
async function loadClassNames(): Promise<ClassSummary[]> {
  try {
    const classes = await teacherService.listClasses('');
    return classes;
  } catch {
    return [];
  }
}
/** Loads audit events plus the lookups needed to turn ids into readable names. */
export async function loadAudit(): Promise<AuditBundle> {
  const [events, users, docs, classes] = await Promise.all([
    adminService.listAuditEvents(),
    adminService.listUsers(),
    adminService.listCurriculum(),
    loadClassNames(),
  ]);
  const actors = new Map(users.map((u) => [u.id, u.name]));
  const targets = new Map<string, (t: AdminT) => string>([
    ...users.map((u) => [u.id, () => u.name] as const),
    ...docs.map((d) => [d.id, (t: AdminT) => docTitle(d, t)] as const),
    ...classes.map((c) => [c.id, (t: AdminT) => classLabel(c, t)] as const),
  ]);
  return { events, actors, targets };
}

const LOCALES = ['en', 'si', 'ta'];

export function toRows(bundle: AuditBundle, t: AdminT): AuditRow[] {
  return bundle.events.map((e) => {
    let target = bundle.targets.get(e.target)?.(t);
    if (!target) {
      if (e.target === 'session') target = t('admin.audit.target.session') as string;
      else if (LOCALES.includes(e.target)) target = t(`common.language.${e.target}`) as string;
      else target = t('admin.audit.target.unknown') as string;
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
