"use client"

import * as React from 'react'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ErrorState } from '@/components/api-states'
import { useToast } from '@/components/toast'
import { api, type Carrier } from '@/lib/api'
import { DEMO_HOSPITAL_ID } from '@/lib/config'

export function NewClaimDialog({ onSubmitted }: { onSubmitted: () => void }) {
  const { showToast } = useToast()
  const [open, setOpen] = React.useState(false)
  const [dischargeSummary, setDischargeSummary] = React.useState<File | null>(null)
  const [hospitalBill, setHospitalBill] = React.useState<File | null>(null)
  const [carriers, setCarriers] = React.useState<Carrier[]>([])
  const [carriersLoading, setCarriersLoading] = React.useState(false)
  const [carrierId, setCarrierId] = React.useState('')
  const [patientId, setPatientId] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    setCarriersLoading(true)
    api
      .getCarriers()
      .then((res) => {
        if (cancelled) return
        const list = Array.isArray(res) ? res : []
        setCarriers(list)
        const defaultCarrier = list.find((c) => c.is_default) ?? list[0]
        if (defaultCarrier) setCarrierId(defaultCarrier.carrier_id)
      })
      .catch(() => {
        if (!cancelled) setCarriers([])
      })
      .finally(() => {
        if (!cancelled) setCarriersLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function reset() {
    setDischargeSummary(null)
    setHospitalBill(null)
    setCarrierId(carriers.find((c) => c.is_default)?.carrier_id ?? carriers[0]?.carrier_id ?? '')
    setPatientId('')
    setError(null)
  }

  function handleOpenChange(next: boolean) {
    if (!submitting) {
      setOpen(next)
      if (!next) reset()
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!dischargeSummary) {
      setError('Discharge summary is required')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await api.ingestDocument({
        file: dischargeSummary,
        hospital_id: DEMO_HOSPITAL_ID,
        doc_type: 'discharge_summary',
        carrier_id: carrierId,
        bill_file: hospitalBill ?? undefined,
      })
      setOpen(false)
      reset()
      showToast('Claim submitted — processing will begin shortly')
      setTimeout(onSubmitted, 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit claim')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        className="bg-[#1E6BFF] hover:bg-[#1E6BFF]/90"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4" />
        New Claim
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Claim</DialogTitle>
          <DialogDescription>
            Upload a discharge summary to kick off coding and adjudication.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Discharge Summary" required>
            <Input
              type="file"
              accept=".txt,.pdf"
              required
              onChange={(e) => setDischargeSummary(e.target.files?.[0] ?? null)}
            />
          </Field>
          <Field label="Hospital Bill">
            <Input
              type="file"
              accept=".xlsx,.xls,.pdf"
              onChange={(e) => setHospitalBill(e.target.files?.[0] ?? null)}
            />
          </Field>
          <Field label="Carrier">
            <Select
              value={carrierId}
              onValueChange={(v) => setCarrierId(v ?? carriers[0]?.carrier_id ?? '')}
              disabled={carriersLoading || carriers.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) =>
                    carriersLoading
                      ? 'Loading carriers…'
                      : carriers.find((c) => c.carrier_id === value)?.short_name ?? value
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {carriers.map((c) => (
                  <SelectItem key={c.carrier_id} value={c.carrier_id}>
                    {c.short_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Patient ID">
            <Input
              placeholder="Patient ID for pre-encounter check"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            />
          </Field>

          {error && <ErrorState message={error} />}

          <DialogFooter>
            <Button type="submit" disabled={submitting} className="bg-[#1E6BFF] hover:bg-[#1E6BFF]/90">
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Claim'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#0A0A0F]">
        {label}
        {required && <span className="text-[#DC2626]"> *</span>}
      </label>
      {children}
    </div>
  )
}
