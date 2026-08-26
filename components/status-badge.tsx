import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  ready: 'bg-[#DCFCE7] text-[#16A34A]',
  approved: 'bg-[#DCFCE7] text-[#16A34A]',
  fully_approved: 'bg-[#DCFCE7] text-[#16A34A]',
  cleared: 'bg-[#DCFCE7] text-[#16A34A]',
  pending: 'bg-[#FEF3C7] text-[#D97706]',
  partial: 'bg-[#FEF3C7] text-[#D97706]',
  conditional: 'bg-[#FEF3C7] text-[#D97706]',
  review_required: 'bg-[#FEE2E2] text-[#DC2626]',
  blocked: 'bg-[#FEE2E2] text-[#DC2626]',
  rejected: 'bg-[#FEE2E2] text-[#DC2626]',
}

const STATUS_LABELS: Record<string, string> = {
  ready: 'Ready',
  approved: 'Approved',
  fully_approved: 'Fully Approved',
  cleared: 'Cleared',
  pending: 'Pending',
  partial: 'Partial',
  conditional: 'Conditional',
  review_required: 'Review Required',
  blocked: 'Blocked',
  rejected: 'Rejected',
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const key = status?.toLowerCase()
  const style = STATUS_STYLES[key] ?? 'bg-[#E4E4EF] text-[#5C5C6B]'
  const label = STATUS_LABELS[key] ?? status

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        style,
        className
      )}
    >
      {label}
    </span>
  )
}

export function readinessColor(score: number): string {
  if (score >= 80) return 'text-[#16A34A]'
  if (score >= 50) return 'text-[#D97706]'
  return 'text-[#DC2626]'
}

export function collectionRateColor(rate: number): string {
  if (rate > 95) return 'text-[#16A34A]'
  if (rate >= 85) return 'text-[#D97706]'
  return 'text-[#DC2626]'
}

export function winProbabilityColor(prob: number): string {
  if (prob > 60) return 'text-[#16A34A]'
  if (prob >= 30) return 'text-[#D97706]'
  return 'text-[#DC2626]'
}
