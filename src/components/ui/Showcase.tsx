import { useState, type ReactNode } from 'react';
import { Plus, Settings, Sparkles } from 'lucide-react';
import {
  AnimatedIllustration, Avatar, Badge, Banner, BarChartWrapper, Button, Card, Checkbox, EmptyState, ErrorState, IconButton, Input,
  LineChartWrapper, LoadingState, MasteryRing, Modal, PageHeader, ProgressBar, RadioGroup, ReadinessBand, Select, Skeleton,
  SourceList, Stat, TBody, THead, Table, Tabs, Td, Textarea, Th, ToastProvider, Tooltip, Tr, useToast,
} from './index';

// Dev-only page (not routed). Strings here are demo placeholders, not product copy.
const data = [
  { week: 'W1', value: 3 }, { week: 'W2', value: 5 }, { week: 'W3', value: 4 }, { week: 'W4', value: 8 },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xl font-semibold text-ink">{title}</h2>
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </section>
  );
}

function ToastDemo() {
  const toast = useToast();
  return <Button variant="secondary" onClick={() => toast.show({ message: 'Saved', tone: 'success' })}>Show toast</Button>;
}

function Inner() {
  const [open, setOpen] = useState(false);
  const [radio, setRadio] = useState('a');
  return (
    <div className="mx-auto max-w-5xl p-6">
      <PageHeader title="UI showcase" description="Every design-system component" actions={<Button leftIcon={<Plus className="h-4 w-4" />}>Action</Button>} />
      <Section title="Buttons">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button loading loadingLabel="Loading">Busy</Button>
        <Button disabled>Disabled</Button>
        <IconButton label="Settings" icon={<Settings className="h-5 w-5" />} />
        <Tooltip content="Tooltip text"><IconButton label="Sparkle" icon={<Sparkles className="h-5 w-5" />} variant="secondary" /></Tooltip>
      </Section>
      <Section title="Badges, readiness, progress">
        <Badge>Neutral</Badge><Badge tone="brand">Brand</Badge><Badge tone="success">Success</Badge><Badge tone="warning">Warning</Badge><Badge tone="danger">Danger</Badge>
        <ReadinessBand band="building" /><ReadinessBand band="developing" /><ReadinessBand band="secure" /><ReadinessBand band="strong" />
        <div className="w-64"><ProgressBar value={62} label="Progress" showValue /></div>
        <MasteryRing value={0.72} label="Mastery: Secure" size={72}><span className="text-center text-[10px]">Secure</span></MasteryRing>
        <Avatar name="Asha Perera" /><Avatar name="Nimal K" size="lg" />
      </Section>
      <Section title="Forms">
        <div className="w-72 space-y-3">
          <Input label="Name" hint="Hint text" />
          <Input label="With error" error="Something is wrong" defaultValue="x" />
          <Select label="Subject" placeholder="Choose" options={[{ value: 'm', label: 'Maths' }, { value: 's', label: 'Science' }]} />
          <Textarea label="Notes" />
        </div>
        <div className="w-72">
          <Checkbox label="Remind me" hint="Optional" />
          <RadioGroup name="demo" legend="Pick one" value={radio} onChange={setRadio} options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]} />
        </div>
      </Section>
      <Section title="Cards, stats, banners">
        <Card title="Card" className="w-64">Body</Card>
        <Stat label="Sessions" value="12" helper="This week" className="w-48" />
        <div className="w-full space-y-3">
          <Banner tone="wellbeing" title="Check in with yourself">Would you like to take a short break?</Banner>
          <Banner tone="warning" title="Heads up">Warning banner</Banner>
        </div>
        <div className="w-full"><SourceList sources={[{ id: '1', title: 'Grade 9 Maths', detail: 'p. 42' }, { id: '2', title: 'Notes', href: '#' }]} /></div>
      </Section>
      <Section title="Tabs, table, modal, toast">
        <div className="w-full"><Tabs label="Demo tabs" items={[{ id: 'a', label: 'One', content: 'First' }, { id: 'b', label: 'Two', content: 'Second' }]} /></div>
        <div className="w-full">
          <Table caption="Demo table">
            <THead><Tr><Th>Name</Th><Th>Band</Th></Tr></THead>
            <TBody><Tr><Td>Asha</Td><Td><ReadinessBand band="secure" compact /></Td></Tr></TBody>
          </Table>
        </div>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        <ToastDemo />
        <Modal open={open} onClose={() => setOpen(false)} title="Modal title" description="Focus is trapped; Esc closes." footer={<Button onClick={() => setOpen(false)}>Done</Button>}>
          <Input label="Focusable field" />
        </Modal>
      </Section>
      <Section title="States and charts">
        <EmptyState title="Nothing yet" description="Empty state" className="w-72" />
        <ErrorState description="Error state" onRetry={() => undefined} retryLabel="Retry" title="Failed" className="w-72" />
        <div className="w-72"><LoadingState label="Loading" /></div>
        <Skeleton className="h-10 w-40" />
        <div className="w-full max-w-md"><LineChartWrapper data={data} xKey="week" yKey="value" summary="Line chart of weekly values rising from 3 to 8" /></div>
        <div className="w-full max-w-md"><BarChartWrapper data={data} xKey="week" yKey="value" summary="Bar chart of weekly values" tone="success" /></div>
        <AnimatedIllustration name="learning-path" alt="Learning path illustration" className="w-80" />
      </Section>
    </div>
  );
}

export function Showcase() {
  return (
    <ToastProvider>
      <Inner />
    </ToastProvider>
  );
}
