"use client"

import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useToast } from '@/components/toast'
import { api, type CarrierSetting } from '@/lib/api'
import { resolveCarrierName, useCarrierDirectory } from '@/lib/carriers'

export function SubmitToTpaSection({
  claimId,
  carrierId,
  onUpdated,
}: {
  claimId: string
  carrierId: string | null
  onUpdated: () => void
}) {
  const carrierDirectory = useCarrierDirectory()
  const { showToast } = useToast()
  const [settings, setSettings] = React.useState<CarrierSetting[] | null>(null)

  React.useEffect(() => {
    let cancelled = false
    api
      .getCarrierSettings()
      .then((res) => {
        if (!cancelled) setSettings(Array.isArray(res) ? res : [])
      })
      .catch(() => {
        if (!cancelled) setSettings([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!settings) return null

  const setting = settings.find((s) => s.carrier_id === carrierId)
  const mode = setting?.submission_mode ?? 'manual_assist'
  const carrierName = resolveCarrierName(carrierDirectory, carrierId)

  return (
    <Card className="border-[#E4E4EF]">
      <CardContent className="flex flex-col gap-4 py-4">
        <h2 className="text-base font-semibold text-[#0A0A0F]">Submit to TPA</h2>

        {mode === 'manual_assist' && (
          <>
            <Alert>
              <AlertTitle>Manual Assist Mode</AlertTitle>
              <AlertDescription>
                Generate the submission package and submit to the TPA portal directly. Record the
                reference number below once submitted.
              </AlertDescription>
            </Alert>
            <MarkSubmittedForm claimId={claimId} onUpdated={onUpdated} showToast={showToast} />
          </>
        )}

        {mode === 'semi_autonomous' && (
          <>
            <Alert>
              <AlertTitle>Semi-Autonomous Mode</AlertTitle>
              <AlertDescription>
                ClearCycle will prefill the TPA portal form. Review and submit manually.
              </AlertDescription>
            </Alert>
            <PrefillButton carrierName={carrierName} />
            <MarkSubmittedForm claimId={claimId} onUpdated={onUpdated} showToast={showToast} />
          </>
        )}

        {mode === 'fully_autonomous' && (
          <>
            <Alert>
              <AlertTitle>Autonomous Mode</AlertTitle>
              <AlertDescription>ClearCycle will submit directly to the TPA portal.</AlertDescription>
            </Alert>
            <AutoSubmitButton />
          </>
        )}
      </CardContent>
    </Card>
  )
}

function MarkSubmittedForm({
  claimId,
  onUpdated,
  showToast,
}: {
  claimId: string
  onUpdated: () => void
  showToast: (message: string) => void
}) {
  const [reference, setReference] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reference.trim()) {
      setError('TPA reference number is required')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await api.updateClaimStatus(claimId, { status: 'submitted', tpa_reference: reference.trim() })
      showToast('Claim marked as submitted')
      onUpdated()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to mark claim as submitted')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
      <div className="flex flex-1 flex-col gap-1.5">
        <label className="text-sm font-medium text-[#0A0A0F]">TPA Reference Number</label>
        <Input value={reference} onChange={(e) => setReference(e.target.value)} />
        {error && <p className="text-sm text-[#DC2626]">{error}</p>}
      </div>
      <Button type="submit" disabled={submitting} className="bg-[#1E6BFF] hover:bg-[#1E6BFF]/90">
        {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
        Mark as Submitted
      </Button>
    </form>
  )
}

function PrefillButton({ carrierName }: { carrierName: string }) {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button type="button" variant="outline" className="w-fit" onClick={() => setOpen(true)}>
        🤖 Prefill TPA Portal
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Portal Prefill</DialogTitle>
            <DialogDescription>
              Portal prefill is being set up for {carrierName}. You will be notified when ready.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}

function AutoSubmitButton() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button type="button" className="w-fit bg-[#1E6BFF] hover:bg-[#1E6BFF]/90" onClick={() => setOpen(true)}>
        🚀 Submit to TPA
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Autonomous Submission</DialogTitle>
            <DialogDescription>
              Autonomous submission is enabled. The claim will be submitted automatically within the next
              processing cycle.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}
