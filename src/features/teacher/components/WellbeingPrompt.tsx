import { Link } from 'react-router-dom';
import { Banner, Button } from '@/components/ui';
import { useTT } from '../strings';

export interface WellbeingPromptProps {
  studentId: string;
  studentName: string;
  /** i18n key held in StudentRow.wellbeingPromptKey */
  promptKey: string;
  onDismiss?: () => void;
  linkToStudent?: boolean;
}

/** Private, non-diagnostic prompt for the teacher only. Never rendered on student-facing pages. */
export function WellbeingPrompt({ studentId, studentName, promptKey, onDismiss, linkToStudent }: WellbeingPromptProps) {
  const t = useTT();
  const heading = t('teacher.wellbeing.about', { name: studentName });
  return (
    <Banner
      tone="wellbeing"
      title={
        <span className="flex flex-wrap items-center gap-2">
          {linkToStudent ? (
            <Link to={`/teacher/students/${studentId}`} className="rounded-sm underline focus-visible:shadow-focus focus-visible:outline-none">
              {heading}
            </Link>
          ) : (
            heading
          )}
          <span className="text-xs font-normal text-ink-soft">({t('teacher.wellbeing.private')})</span>
        </span>
      }
      actions={
        onDismiss ? (
          <Button variant="ghost" onClick={onDismiss}>
            {t('teacher.wellbeing.dismiss')}
          </Button>
        ) : undefined
      }
    >
      <p>{t(promptKey)}</p>
      <p className="mt-1 text-xs">{t('teacher.wellbeing.notDiagnosis')}</p>
    </Banner>
  );
}
