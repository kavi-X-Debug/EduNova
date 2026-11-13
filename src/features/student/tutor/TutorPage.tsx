import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AlertTriangle, Bot, Check, Send, User as UserIcon } from 'lucide-react';
import { Banner, Button, Card, ErrorState, PageHeader, SourceList, Textarea, cn, type SourceItem } from '@/components/ui';
import { tk, useLocale, useT, type TKey } from '@/i18n';
import { rewardsService, studentService } from '@/services';
import { useSessionStore } from '@/store';
import type { TutorMessage } from '@/types';

/** Upper bound on one question, so input is never unbounded. */
export const MAX_QUESTION_LENGTH = 500;

const SUGGESTIONS = [
  tk('student.tutor.suggestion.fractions'),
  tk('student.tutor.suggestion.magnets'),
  tk('student.tutor.suggestion.flowcharts'),
];

function toSources(m: TutorMessage): SourceItem[] {
  return m.sources.map((s, i) => ({ id: `${m.id}-${s.ref}-${i}`, title: s.title, lang: m.locale }));
}

function MessageBubble({ message }: { message: TutorMessage }) {
  const t = useT();
  const userId = useSessionStore((s) => s.user?.id) ?? '';
  const [checked, setChecked] = useState(false);
  const markChecked = () => {
    setChecked(true);
    void rewardsService.recordEvent(userId, { type: 'sources_checked', messageId: message.id }).catch(() => undefined);
  };
  const fromTutor = message.from === 'tutor';
  const unsourced = fromTutor && message.sources.length === 0;
  return (
    <li className={cn('flex gap-3', fromTutor ? 'justify-start' : 'justify-end')}>
      {fromTutor && (
        <span aria-hidden className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <Bot className="h-5 w-5" />
        </span>
      )}
      <article
        className={cn(
          'flex max-w-[85%] flex-col gap-2 rounded-lg border p-3 md:max-w-[75%]',
          !fromTutor ? 'border-brand-100 bg-brand-50' : unsourced ? 'border-warning-500 bg-warning-50' : 'border-line bg-surface',
        )}
      >
        <h2 className="text-xs font-semibold text-ink-soft">{t(fromTutor ? 'student.tutor.from.tutor' : 'student.tutor.from.student')}</h2>
        <p lang={message.locale} className="whitespace-pre-wrap break-words text-base text-ink">{message.text}</p>
        {/* Every tutor answer shows its sources; an empty list renders the explicit "no sources" state. */}
        {unsourced && (
          <p className="flex items-start gap-2 rounded-md border border-warning-500 bg-surface p-2 text-sm font-semibold text-ink">
            <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-warning-700" />
            {t('student.tutor.unsourced.note' as TKey)}
          </p>
        )}
        {fromTutor && <SourceList sources={toSources(message)} title={t('student.tutor.sources')} />}
        {fromTutor && message.sources.length > 0 && (
          <Button variant="secondary" disabled={checked} onClick={markChecked} leftIcon={checked ? <Check aria-hidden className="h-4 w-4" /> : undefined} className="self-start">
            {t(checked ? 'student.tutor.sources.checked' : 'student.tutor.sources.check')}
          </Button>
        )}
      </article>
      {!fromTutor && (
        <span aria-hidden className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-ink-soft">
          <UserIcon className="h-5 w-5" />
        </span>
      )}
    </li>
  );
}

export default function TutorPage() {
  const { t, locale } = useLocale();
  const userId = useSessionStore((s) => s.user?.id) ?? '';
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

  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <PageHeader title={t('student.tutor.title')} description={t('student.tutor.subtitle')} />
      <Banner tone="info" className="mb-4">
        {t('student.tutor.disclaimer')}
      </Banner>

      <Card padded={false} className="flex flex-col">
        <div
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          aria-label={t('student.tutor.conversation')}
          aria-busy={pending}
          tabIndex={0}
          className="max-h-[60vh] min-h-64 overflow-y-auto p-4 outline-none focus-visible:shadow-focus md:p-6"
        >
          {messages.length === 0 && !pending && !failedText ? (
            <div className="flex flex-col items-start gap-3">
              <p className="text-base text-ink-soft">{t('student.tutor.empty')}</p>
              <h2 className="text-sm font-semibold text-ink">{t('student.tutor.suggestions.title')}</h2>
              <ul className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => {
                  const label = t(s);
                  return (
                    <li key={s}>
                      <Button variant="secondary" onClick={() => void ask(label)}>
                        {label}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {pending && (
                <li role="status" className="flex items-center gap-2 text-sm text-ink-soft">
                  <span aria-hidden className="flex gap-1">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500 motion-reduce:animate-none" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500 [animation-delay:150ms] motion-reduce:animate-none" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500 [animation-delay:300ms] motion-reduce:animate-none" />
                  </span>
                  {t('student.tutor.thinking')}
                </li>
              )}
            </ul>
          )}
          {failedText && (
            <ErrorState
              className="mt-4"
              description={t('student.tutor.error')}
              onRetry={() => void ask(failedText, true)}
            />
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3 border-t border-line p-4 md:p-6">
          <Textarea
            label={t('student.tutor.input.label')}
            placeholder={t('student.tutor.input.placeholder')}
            value={draft}
            maxLength={MAX_QUESTION_LENGTH}
            rows={3}
            onChange={(e) => setDraft(e.target.value.slice(0, MAX_QUESTION_LENGTH))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            hint={t('student.tutor.input.counter', { count: draft.length, max: MAX_QUESTION_LENGTH })}
            error={tooLong ? t('student.tutor.input.limit') : undefined}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={pending || !draft.trim()} leftIcon={<Send aria-hidden className="h-4 w-4" />}>
              {t('student.tutor.send')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
