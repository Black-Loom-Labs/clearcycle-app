import { Button } from '@/components/ui/button'

export function PaginationFooter({
  page,
  perPage,
  count,
  total,
  itemLabel = 'items',
  onPrevious,
  onNext,
}: {
  page: number
  perPage: number
  count: number
  total?: number
  itemLabel?: string
  onPrevious: () => void
  onNext: () => void
}) {
  const start = count === 0 ? 0 : (page - 1) * perPage + 1
  const end = (page - 1) * perPage + count
  const hasNext = total != null ? end < total : count >= perPage

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-[#E4E4EF] px-4 py-3 sm:flex-row">
      <span className="text-sm text-[#5C5C6B]">
        {count === 0
          ? `No ${itemLabel}`
          : `Showing ${start}–${end}${total != null ? ` of ${total}` : ''} ${itemLabel}`}
      </span>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={onPrevious}>
          Previous
        </Button>
        <Button size="sm" variant="outline" disabled={!hasNext} onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  )
}
