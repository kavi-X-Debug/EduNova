import { ClipboardList, Lightbulb, RefreshCw, Route as RouteIcon } from 'lucide-react';
import { BigLinkCard, HelpBubble, PageHeader } from '@/components/ui';
import { useT } from '@/i18n';

/** Learn hub: four big cards that lead to the existing pages (path, diagnostic, revision, exams). */
export default function LearnHubPage() {
  const t = useT();
  return (
    <div>
      <PageHeader title={t('kids.learn.title')} description={t('kids.learn.subtitle')} actions={<HelpBubble textKey="kids.learn.help" align="end" />} />
      <ul className="stagger grid gap-4 md:grid-cols-2">
        <li>
          <BigLinkCard to="/student/path" icon={RouteIcon} title={t('kids.learn.path.title')} description={t('kids.learn.path.desc')} />
        </li>
        <li>
          <BigLinkCard to="/student/diagnostic" icon={Lightbulb} title={t('kids.learn.warmup.title')} description={t('kids.learn.warmup.desc')} />
        </li>
        <li>
          <BigLinkCard to="/student/revision" icon={RefreshCw} title={t('kids.learn.revision.title')} description={t('kids.learn.revision.desc')} />
        </li>
        <li>
          <BigLinkCard to="/student/exams" icon={ClipboardList} title={t('kids.learn.exams.title')} description={t('kids.learn.exams.desc')} />
        </li>
      </ul>
    </div>
  );
}
