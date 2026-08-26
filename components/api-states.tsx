import { AlertCircle, Inbox } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>
        {message || 'Failed to load data from the server.'}
        {onRetry && (
          <div className="mt-2">
            <Button size="sm" variant="outline" onClick={onRetry}>
              Retry
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}

export function EmptyState({
  title = 'No data found',
  description,
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-[#E4E4EF] bg-white py-16 text-center">
      <Inbox className="size-10 text-[#5C5C6B]" />
      <p className="font-medium text-[#0A0A0F]">{title}</p>
      {description && <p className="text-sm text-[#5C5C6B]">{description}</p>}
    </div>
  )
}
