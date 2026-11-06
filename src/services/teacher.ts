import type { ClassSummary, StudentRow } from '@/types';
export interface TeacherService {
  listClasses(teacherId: string): Promise<ClassSummary[]>;
  listStudents(classId: string): Promise<StudentRow[]>;
}
