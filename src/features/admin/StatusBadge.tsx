import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import { CheckCircle2, Eye, FileEdit } from 'lucide-react';
import { Badge } from '@/components/ui';
import type { BadgeTone } from '@/components/ui';
import { type Status } from './shared';

const tone: Record<Status, BadgeTone> = { draft: 'neutral', in_review: 'warning', published: 'success' };
const icon: Record<Status, ReactNode> = {
  draft: <FileEdit className="h-3 w-3" />,
  in_review: <Eye className="h-3 w-3" />,
  published: <CheckCircle2 className="h-3 w-3" />,
};

/** Status is conveyed by text and icon as well as colour. */
export function StatusBadge({ status }: { status: Status }) {
  const { t } = useTranslation();
  return (
    <Badge tone={tone[status]} icon={icon[status]}>
      {t(`admin.curriculum.status.${status}`)}
    </Badge>
  );
}
