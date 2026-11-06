import type { CompanyFormStatus } from '@/api/types';
import { Badge } from '@/components/Badge/Badge';

const badges: Record<CompanyFormStatus, { label: string; tone: 'warning' | 'success' }> = {
  draft: { label: 'Utkast', tone: 'warning' },
  published: { label: 'Publicerad', tone: 'success' },
};

interface StatusBadgeProps {
  status: CompanyFormStatus;
}

/** A form's status at a company (Utkast / Publicerad) as a badge. */
export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, tone } = badges[status];
  return (
    <Badge tone={tone} variant="soft">
      {label}
    </Badge>
  );
}
