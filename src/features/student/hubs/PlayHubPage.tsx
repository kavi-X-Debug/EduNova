import { Award, Gamepad2, Rocket } from 'lucide-react';
import { BigLinkCard, HelpBubble, PageHeader } from '@/components/ui';
import { useT } from '@/i18n';

/** Play hub: adventures (quests) and badges. Rewards stay private to the student. */
export default function PlayHubPage() {
  const t = useT();
  return (
    <div>
      <PageHeader title={t('kids.play.title')} description={t('kids.play.subtitle')} actions={<HelpBubble textKey="kids.play.help" align="end" />} />
      <ul className="stagger grid gap-4 md:grid-cols-2">
        <li>
          <BigLinkCard to="/student/games" icon={Gamepad2} title={t('games.lib.title')} description={t('games.hub.desc')} />
        </li>
        <li>
          <BigLinkCard to="/student/quests" icon={Rocket} title={t('kids.play.adventures.title')} description={t('kids.play.adventures.desc')} />
        </li>
        <li>
          <BigLinkCard to="/student/badges" icon={Award} title={t('kids.badges.title')} description={t('kids.badges.desc')} />
        </li>
      </ul>
    </div>
  );
}
