import { useEffect, useRef, useState, type ComponentType, type FormEvent } from 'react';
import { Check, Magnet, Pizza, Send, Workflow } from 'lucide-react';
import { BigActionButton, Button, HelpBubble, Mascot, MascotMessage, PageHeader, SpeechBubble, Textarea, cn } from '@/components/ui';
import { tk, useLocale, type TKey } from '@/i18n';
import { rewardsService, studentService } from '@/services';
import { useSessionStore } from '@/store';
import type { TutorMessage } from '@/types';
import { kidFieldWrap } from '../onboarding/kidStyles';
import { WhereFrom } from './WhereFrom';

/** Upper bound on one question, so input is never unbounded. */
export const MAX_QUESTION_LENGTH = 500;

type IconType = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
const SUGGESTIONS: { key: TKey; icon: IconType }[] = [
  { key: tk('student.tutor.suggestion.fractions'), icon: Pizza },
  { key: tk('student.tutor.suggestion.magnets'), icon: Magnet },
  { key: tk('student.tutor.suggestion.flowcharts'), icon: Workflow },
];

function StudentBubble({ message }: { message: TutorMessage }) {
  const { t } = useLocale();
  return (
    <li className="flex justify-end motion-ok:animate-fx-bubble-right">
      <article className="max-w-[90%] rounded-xl border-2 border-brand-100 bg-brand-50 px-4 py-3 md:max-w-[75%]">
        <h2 className="text-sm font-semibold text-ink-soft">{t('kidsplay.ask.you')}</h2>
        <p lang={message.locale} className="whitespace-pre-wrap break-words text-lg text-ink">{message.text}</p>
      </article>
    </li>
  );
}

function NovaBubble({ message }: { message: TutorMessage }) {
  const { t } = useLocale();
  const userId = useSessionStore((s) => s.user?.id) ?? '';
  const [looked, setLooked] = useState(false);
  const markLooked = () => {
    setLooked(true);
    void rewardsService.recordEvent(userId, { type: 'sources_checked', messageId: message.id }).catch(() => undefined);
  };
  return (
    <li className="flex items-start gap-2 motion-ok:animate-fx-bubble-left md:gap-3">
      <Mascot mood="happy" size="sm" animate={false} />
      <article className="min-w-0 flex-1">
        <h2 className="sr-only">{t('kidsplay.ask.nova')}</h2>
        <SpeechBubble tail="start" speakText={message.text} speakLocale={message.locale}>
          <span lang={message.locale} className="block">
            <span className="block text-base font-bold text-brand-700">{t('kidsplay.ask.lead')}</span>
            <span className="mt-1 block whitespace-pre-wrap break-words font-normal">{message.text}</span>
          </span>
        </SpeechBubble>
        {/* Sources ALWAYS show. No sources: "Ask your teacher to check this." */}
        <WhereFrom message={message} />
        {message.sources.length > 0 && (
          <Button
            variant={looked ? 'ghost' : 'secondary'}
            size="xl"
            disabled={looked}
            onClick={markLooked}
            leftIcon={<Check aria-hidden className="h-6 w-6" />}
            className="mt-3"
          >
            {t(looked ? 'kidsplay.ask.looked.done' : 'kidsplay.ask.looked')}
          </Button>
        )}
      </article>
    </li>
  );
}

export default function TutorPage() {
  const { t, locale } = useLocale();
  const user = useSessionStore((s) => s.user);
  const userId = user?.id ?? '';
  const firstName = (user?.name ?? '').trim().split(/\s+/)[0] ?? '';
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [failedText, setFailedText] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef(0);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end' });
  }, [messages.length, pending, failedText]);

  async function ask(text: string, alreadyShown = false) {
    const question = text.trim().slice(0, MAX_QUESTION_LENGTH);
    if (!question || pending) return;
    const requestId = ++requestRef.current;
    setFailedText(null);
    setPending(true);
    if (!alreadyShown) {
      setMessages((prev) => [...prev, { id: `q-${Date.now()}`, from: 'student', text: question, sources: [] }]);
    }
    try {
      const reply = await studentService.askTutor(userId, question, locale);
      if (requestId !== requestRef.current) return;
      setMessages((prev) => [...prev, { ...reply, from: 'tutor', sources: reply.sources ?? [] }]);
    } catch {
      if (requestId !== requestRef.current) return;
      setFailedText(question);
    } finally {
      if (requestId === requestRef.current) setPending(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = draft;
    if (!text.trim()) return;
    setDraft('');
    void ask(text);
  }

  const tooLong = draft.length >= MAX_QUESTION_LENGTH;
  const fresh = messages.length === 0 && !pending && !failedText;
  const hello = t('kidsplay.ask.hello', { name: firstName });

  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <PageHeader title={t('kidsplay.ask.title')} description={t('kidsplay.ask.subtitle')} actions={<HelpBubble textKey="kidsplay.ask.help" align="end" />} />

      <div
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label={t('kidsplay.ask.log')}
        aria-busy={pending}
        className="flex flex-col gap-4 pb-4"
      >
        {fresh ? (
          <>
            <MascotMessage mood="wave" size="lg" speakText={hello}>
              {hello}
            </MascotMessage>
            <div>
              <h2 className="mb-3 text-xl font-bold text-ink">{t('kidsplay.ask.try')}</h2>
              <ul className="stagger grid gap-3 md:grid-cols-3">
                {SUGGESTIONS.map(({ key, icon: Icon }) => {
                  const label = t(key);
                  return (
                    <li key={key}>
                      <button
                        type="button"
                        onClick={() => void ask(label)}
                        className="group/card flex min-h-[88px] w-full items-center gap-3 rounded-xl border-2 border-brand-100 bg-surface p-4 text-left shadow-card outline-none transition duration-base ease-standard hover:border-brand-500 hover:shadow-fx-glow focus-visible:shadow-focus motion-ok:hover:-translate-y-1"
                      >
                        <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                          <Icon aria-hidden className="fx-icon h-8 w-8" />
                        </span>
                        <span className="min-w-0 text-lg font-bold text-ink">{label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        ) : (
          <ul className="flex flex-col gap-4">
            {messages.map((m) => (m.from === 'student' ? <StudentBubble key={m.id} message={m} /> : <NovaBubble key={m.id} message={m} />))}
            {pending && (
              <li role="status" className="flex items-center gap-2 md:gap-3">
                <Mascot mood="thinking" size="sm" />
                <SpeechBubble tail="start">
                  <span className="flex items-center gap-3">
                    <span aria-hidden className="flex gap-1">
                      <span className={cn('h-2.5 w-2.5 rounded-full bg-brand-500 motion-ok:animate-fx-typing')} />
                      <span className="h-2.5 w-2.5 rounded-full bg-brand-500 motion-ok:animate-fx-typing [animation-delay:180ms]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-brand-500 motion-ok:animate-fx-typing [animation-delay:360ms]" />
                    </span>
                    {t('kidsplay.ask.thinking')}
                  </span>
                </SpeechBubble>
              </li>
            )}
          </ul>
        )}
        {failedText && (
          <div role="alert" className="flex flex-col gap-3">
            <MascotMessage mood="oops" size="md">
              <span className="block text-xl font-bold">{t('kidsplay.ask.error.title')}</span>
              <span className="mt-1 block font-normal text-ink-soft">{t('kidsplay.ask.error.body')}</span>
            </MascotMessage>
            <BigActionButton variant="secondary" onClick={() => void ask(failedText, true)} className="self-start">
              {t('kidsplay.ask.again')}
            </BigActionButton>
          </div>
        )}
        <div ref={endRef} className="md:scroll-mb-72" />
      </div>

      <form onSubmit={onSubmit} className="flex md:sticky md:bottom-0 flex-col gap-3 rounded-xl border-2 border-brand-100 bg-surface p-3 shadow-raised md:p-4">
        <Textarea
          label={t('kidsplay.ask.input.label')}
          placeholder={t('kidsplay.ask.input.placeholder')}
          value={draft}
          maxLength={MAX_QUESTION_LENGTH}
          rows={2}
          className="min-h-[72px] text-lg md:min-h-[88px]"
          wrapperClassName={kidFieldWrap}
          onChange={(e) => setDraft(e.target.value.slice(0, MAX_QUESTION_LENGTH))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          error={tooLong ? t('kidsplay.ask.tooLong') : undefined}
        />
        <BigActionButton type="submit" icon={<Send />} disabled={pending || !draft.trim()} fullWidth className="md:w-auto md:self-end">
          {t('kidsplay.ask.send')}
        </BigActionButton>
      </form>
      <p className="mt-3 text-base text-ink-soft">{t('kidsplay.ask.careful')}</p>
    </div>
  );
}
