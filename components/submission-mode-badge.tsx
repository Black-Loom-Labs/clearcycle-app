import { cn } from '@/lib/utils'
import type { CarrierSetting } from '@/lib/api'

const MODE_LABELS: Record<CarrierSetting['submission_mode'], string> = {
  manual_assist: 'Manual Assist',
  semi_autonomous: 'Semi-Autonomous',
  fully_autonomous: 'Fully Autonomous',
}

const MODE_STYLES: Record<CarrierSetting['submission_mode'], string> = {
  manual_assist: 'bg-[#E4E4EF] text-[#5C5C6B]',
  semi_autonomous: 'bg-[#FEF3C7] text-[#D97706]',
  fully_autonomous: 'bg-[#DCFCE7] text-[#16A34A]',
}

export function submissionModeLabel(mode: CarrierSetting['submission_mode']): string {
  return MODE_LABELS[mode] ?? mode
}

export function SubmissionModeBadge({
  mode,
  className,
}: {
  mode: CarrierSetting['submission_mode']
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        MODE_STYLES[mode] ?? 'bg-[#E4E4EF] text-[#5C5C6B]',
        className
      )}
    >
      {submissionModeLabel(mode)}
    </span>
  )
}
