import type { AuditEvent, CurriculumDoc, User } from '@/types';
export interface AdminService {
  listUsers(): Promise<User[]>;
  listCurriculum(): Promise<CurriculumDoc[]>;
  updateCurriculumStatus(id: string, status: CurriculumDoc['status']): Promise<CurriculumDoc>;
  listAuditEvents(): Promise<AuditEvent[]>;
}
