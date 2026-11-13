import { Compass } from 'lucide-react';
import { BigActionButton, MascotMessage } from '@/components/ui';
import { useT } from '@/i18n';
import ProfilePage from '@/features/profile/ProfilePage';
import { useTourStore } from '../tour/useTourStore';

/** Me: the child's profile page, with "Show me around" (replays the welcome tour) at the top. Save is the one primary action. */
export default function MePage() {
  const t = useT();
  const intro = (
    <section aria-label={t('kids.me.tour.title')} className="rounded-xl border border-line bg-surface p-4 shadow-card md:p-6">
      <MascotMessage mood="happy" speakText={t('kids.me.tour.desc')}>
        {t('kids.me.tour.desc')}
      </MascotMessage>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <BigActionButton variant="secondary" icon={<Compass />} onClick={() => useTourStore.getState().openTour()}>
          {t('kids.me.tour.title')}
        </BigActionButton>
      </div>
    </section>
  );
  return <ProfilePage intro={intro} />;
}
