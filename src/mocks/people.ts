/**
 * MOCK ONLY: demo users and the email->user lookup (`demoUserFor`) perform NO authentication, and any
 * unknown email signs in as the demo account. Replace with real session verification at go-live; no
 * production path may depend on this file or on the role/user persisted in localStorage.
 */
import type { AuditEvent, ClassSummary, Locale, StudentRow, User } from '@/types';
import { bandFromMastery } from '@/lib/mastery';
import { rngFor, daysAgo } from './rng';
import { buildMastery } from './learning';
import { CONCEPTS } from './concepts';
import { WELLBEING_KEYS } from './content';

const FIRST = [
  'Kasun', 'Nethmi', 'Dilshan', 'Sachini', 'Tharindu', 'Ishara', 'Chamod', 'Sandali', 'Ravindu', 'Hasini',
  'Aruni', 'Pavithra', 'Kavindu', 'Dinuka', 'Madhavi', 'Lakshan', 'Thisara', 'Nimali', 'Janith', 'Oshadi',
  'Thanuja', 'Kumari', 'Sivakumar', 'Tharshini', 'Arjun', 'Priya', 'Kavitha', 'Nishanthan', 'Abinaya', 'Rajan',
  'Mohamed', 'Fathima', 'Ahamed', 'Zainab', 'Rizwan', 'Aisha', 'Imran', 'Nusrath', 'Dineth', 'Yasara',
  'Vihanga', 'Sithmi', 'Heshan', 'Tharushi', 'Gayan', 'Anjali', 'Shanmugam', 'Suganya', 'Rashmika', 'Pasindu',
];
const LAST = [
  'Perera', 'Fernando', 'Silva', 'Jayasinghe', 'Wickramasinghe', 'Gunawardena', 'Rajapaksha', 'Bandara', 'Senanayake', 'Dissanayake',
  'Kumar', 'Selvarajah', 'Thiyagarajah', 'Sivalingam', 'Pathmanathan', 'Nadarajah', 'Rahman', 'Hameed', 'Cassim', 'Marikar',
  'Amarasinghe', 'Herath', 'Weerasekara', 'Ratnayake', 'Abeysekara',
];

const LOCALES: Locale[] = ['si', 'en', 'ta', 'si', 'en'];

export const CLASS_DEFS = [
  { id: 'class-6a', name: 'Grade 6A', grade: 6 },
  { id: 'class-6b', name: 'Grade 6B', grade: 6 },
  { id: 'class-6c', name: 'Grade 6C', grade: 6 },
];

export const TEACHERS: User[] = [
  { id: 'tch-001', name: 'Anura Jayawardena', email: 'teacher@edunova.lk', role: 'teacher', locale: 'si', classIds: ['class-6a', 'class-6b', 'class-6c'] },
  { id: 'tch-002', name: 'Shanthi Rajaratnam', email: 'shanthi@edunova.lk', role: 'teacher', locale: 'ta', classIds: ['class-6b'] },
  { id: 'tch-003', name: 'Farah Nazeer', email: 'farah@edunova.lk', role: 'teacher', locale: 'en', classIds: ['class-6c'] },
];

export const ADMINS: User[] = [
  { id: 'adm-001', name: 'Dr. Mahesh Gamage', email: 'admin@edunova.lk', role: 'admin', locale: 'en' },
];

function makeStudents(): User[] {
  const out: User[] = [];
  let n = 1;
  CLASS_DEFS.forEach((c, ci) => {
    const rnd = rngFor(`students-${c.id}`);
    for (let i = 0; i < 25; i++) {
      const first = FIRST[Math.floor(rnd() * FIRST.length)];
      const last = LAST[Math.floor(rnd() * LAST.length)];
      const id = `stu-${String(n).padStart(3, '0')}`;
      out.push({
        id,
        name: `${first} ${last}`,
        email: n === 1 ? 'student@edunova.lk' : `${first.toLowerCase()}.${last.toLowerCase()}${n}@students.edunova.lk`,
        role: 'student',
        locale: LOCALES[(n + ci) % LOCALES.length],
        grade: c.grade,
        classIds: [c.id],
      });
      n++;
    }
  });
  return out;
}

export const STUDENTS: User[] = makeStudents();
export const ALL_USERS: User[] = [...STUDENTS, ...TEACHERS, ...ADMINS];

export function findUser(id: string): User | undefined {
  return ALL_USERS.find((u) => u.id === id);
}

export function demoUserFor(email: string, role: User['role']): User {
  const byEmail = ALL_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.role === role);
  if (byEmail) return byEmail;
  // Unknown email: sign in as the demo account of that role, keeping the typed email.
  const demo = ALL_USERS.find((u) => u.role === role)!;
  return { ...demo, email: email.trim() || demo.email };
}

/** Roster rows derived from mastery so bands are consistent everywhere. */
export function buildStudentRows(classId: string, getMastery: (id: string) => ReturnType<typeof buildMastery>): StudentRow[] {
  return STUDENTS.filter((s) => s.classIds?.includes(classId)).map((s, i) => {
    const rnd = rngFor(`row-${s.id}`);
    const mastery = getMastery(s.id);
    const band = bandFromMastery(mastery);
    const idle = Math.floor(rnd() * 9);
    const row: StudentRow = { id: s.id, name: s.name, classId, band, lastActive: daysAgo(idle, Date.now() - i * 3_600_000) };
    // Gentle, private prompt only for some students who were quiet lately or still building.
    if (idle >= 6 || (band === 'building' && rnd() > 0.5)) {
      row.wellbeingPromptKey = WELLBEING_KEYS[Math.floor(rnd() * WELLBEING_KEYS.length)];
    }
    return row;
  });
}

export function buildClassSummary(
  def: (typeof CLASS_DEFS)[number],
  getMastery: (id: string) => ReturnType<typeof buildMastery>,
): ClassSummary {
  const rows = buildStudentRows(def.id, getMastery);
  const bandCounts: ClassSummary['bandCounts'] = { building: 0, developing: 0, secure: 0, strong: 0 };
  rows.forEach((r) => bandCounts[r.band]++);
  // weak concepts: lowest average mastery across the class
  const sums = new Map<string, { s: number; n: number }>();
  rows.forEach((r) =>
    getMastery(r.id).forEach((m) => {
      const e = sums.get(m.conceptId) ?? { s: 0, n: 0 };
      e.s += m.level;
      e.n++;
      sums.set(m.conceptId, e);
    }),
  );
  const weakConceptIds = [...sums.entries()]
    .filter(([id]) => CONCEPTS.some((c) => c.id === id))
    .sort((a, b) => a[1].s / a[1].n - b[1].s / b[1].n)
    .slice(0, 3)
    .map(([id]) => id);
  return { id: def.id, name: def.name, grade: def.grade, studentCount: rows.length, bandCounts, weakConceptIds };
}

// ---------- Audit ----------
const ACTIONS: [string, string][] = [
  ['user.signIn', 'session'],
  ['curriculum.update', 'cur-maths-3'],
  ['curriculum.publish', 'cur-science-1'],
  ['curriculum.submitForReview', 'cur-ict-3'],
  ['user.roleChange', 'tch-003'],
  ['class.create', 'class-6c'],
  ['export.classReport', 'class-6b'],
  ['settings.localeDefault', 'si'],
  ['user.invite', 'stu-014'],
  ['curriculum.archive', 'cur-maths-4'],
];
export function buildAuditEvents(): AuditEvent[] {
  const rnd = rngFor('audit');
  const actors = [...TEACHERS, ...ADMINS];
  return Array.from({ length: 40 }, (_, i) => {
    const [action, target] = ACTIONS[Math.floor(rnd() * ACTIONS.length)];
    const hours = i * 7 + Math.floor(rnd() * 5);
    return {
      id: `aud-${String(i + 1).padStart(3, '0')}`,
      actorId: actors[Math.floor(rnd() * actors.length)].id,
      action,
      target,
      at: new Date(Date.now() - hours * 3_600_000).toISOString(),
    };
  }); // already newest-first
}
