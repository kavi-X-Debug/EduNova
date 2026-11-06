const FALLBACK: Record<string, string> = {
  'exam-term1': 'Term 1 paper',
  'exam-term2': 'Term 2 paper',
  'exam-unit-test': 'Unit test',
};

/** Key + English fallback for an exam's display name (key requested in docs/REQUESTS.md). */
export function examNameKey(examId: string): { key: string; fallback: string } {
  return { key: `student.exams.name.${examId}`, fallback: FALLBACK[examId] ?? examId };
}
