import { Link } from 'react-router-dom';
import { Banner, Button } from '@/components/ui';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const heading = t('teacher.wellbeing.aboutPrivate', { name: studentName });
  return (
    <Banner
      tone="wellbeing"
      title={
        <span className="flex flex-wrap items-center gap-2">
          {linkToStudent ? (
            <Link to={`/teacher/students/${studentId}`} className="inline-flex min-h-11 items-center rounded-sm py-2 underline focus-visible:shadow-focus focus-visible:outline-none">
              {heading}
            </Link>
          ) : (
            heading
          )}
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
