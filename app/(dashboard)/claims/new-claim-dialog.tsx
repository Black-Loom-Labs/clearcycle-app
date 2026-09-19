"use client"

import * as React from 'react'
import Link from 'next/link'
import { Loader2, Plus, UploadCloud, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { ErrorState } from '@/components/api-states'
import { useToast } from '@/components/toast'
import { api, type Carrier, type Patient } from '@/lib/api'
import { DEMO_HOSPITAL_ID } from '@/lib/config'
import { PatientSearchStep } from '../patients/patient-search-step'
import { PreEncounterCheckPanel } from '../patients/pre-encounter-check-panel'
import { Field } from '../patients/patient-registration-form'

type Step = 1 | 2 | 3

export function NewClaimDialog({ onSubmitted }: { onSubmitted: () => void }) {
  const { showToast } = useToast()
  const [open, setOpen] = React.useState(false)
  const [step, setStep] = React.useState<Step>(1)
  const [patient, setPatient] = React.useState<Patient | null>(null)
  const [carrierId, setCarrierId] = React.useState('')

  function reset() {
    setStep(1)
    setPatient(null)
    setCarrierId('')
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) reset()
  }

  function handleSubmitted(claimId: string) {
    onSubmitted()
    showToast(`Claim submitted — claim ID ${claimId.slice(0, 8)}…`)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button className="bg-[#1E6BFF] hover:bg-[#1E6BFF]/90" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        New Claim
      </Button>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Claim — Step {step} of 3</DialogTitle>
          <DialogDescription>
            {step === 1 && 'Find or register the patient for this claim.'}
            {step === 2 && 'Run a pre-encounter eligibility check before admission.'}
            {step === 3 && 'Upload the discharge summary to submit the claim.'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <PatientSearchStep
            onSelected={(p) => {
              setPatient(p)
              const defaultCarrier =
                p.insurance_policies.find((ip) => ip.active)?.carrier_id ?? ''
              setCarrierId(defaultCarrier)
              setStep(2)
            }}
          />
        )}

        {step === 2 && patient && (
          <PreEncounterCheckPanel
            patient={patient}
            onBack={() => setStep(1)}
            onProceed={(_result, chosenCarrierId) => {
              setCarrierId(chosenCarrierId)
              setStep(3)
            }}
          />
        )}

        {step === 3 && patient && (
          <UploadStep
            patient={patient}
            carrierId={carrierId}
            onBack={() => setStep(2)}
            onSubmitted={handleSubmitted}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function UploadStep({
  patient,
  carrierId,
  onBack,
  onSubmitted,
}: {
  patient: Patient
  carrierId: string
  onBack: () => void
  onSubmitted: (claimId: string) => void
}) {
  const [file, setFile] = React.useState<File | null>(null)
  const [dragging, setDragging] = React.useState(false)
  const [carriers, setCarriers] = React.useState<Carrier[]>([])
  const [selectedCarrierId, setSelectedCarrierId] = React.useState(carrierId)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<{ claim_id: string } | null>(null)

  React.useEffect(() => {
    api
      .getCarriers()
      .then((res) => setCarriers(Array.isArray(res) ? res : []))
      .catch(() => setCarriers([]))
  }, [])

  function pickFile(f: File | null) {
    if (f && f.type !== 'application/pdf') {
      setError('Only PDF files are accepted')
      return
    }
    setError(null)
    setFile(f)
  }

  async function handleSubmit() {
    if (!file) {
      setError('Please attach the discharge summary PDF')
      return
    }
    if (!selectedCarrierId) {
      setError('Please select a carrier')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await api.ingestDocument({
        file,
        hospital_id: DEMO_HOSPITAL_ID,
        doc_type: 'discharge_summary',
        carrier_id: selectedCarrierId,
        patient_id: patient.patient_id,
      })
      const claimId = res.claim_id ?? ''
      setResult({ claim_id: claimId })
      onSubmitted(claimId)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit claim')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <CheckCircle2 className="size-10 text-[#16A34A]" />
        <div>
          <p className="font-semibold text-[#0A0A0F]">Claim submitted</p>
          <p className="text-sm text-[#5C5C6B]">Claim ID: {result.claim_id || '—'}</p>
        </div>
        {result.claim_id && (
          <Button
            className="bg-[#1E6BFF] hover:bg-[#1E6BFF]/90"
            nativeButton={false}
            render={<Link href={`/claims/${result.claim_id}`} />}
          >
            View Claim
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-[#E4E4EF] bg-[#F7F8FA] px-3 py-2 text-sm text-[#5C5C6B]">
        Patient: <span className="font-medium text-[#0A0A0F]">{patient.name}</span>
      </div>

      <Field label="Carrier" required>
        <Select value={selectedCarrierId} onValueChange={(v) => setSelectedCarrierId(v ?? '')}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select carrier">
              {(value: string) => carriers.find((c) => c.carrier_id === value)?.short_name ?? value}
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

      <div
        className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          dragging ? 'border-[#1E6BFF] bg-[#EAF2FF]' : 'border-[#E4E4EF]'
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          pickFile(e.dataTransfer.files?.[0] ?? null)
        }}
      >
        <UploadCloud className="size-8 text-[#5C5C6B]" />
        {file ? (
          <p className="text-sm font-medium text-[#0A0A0F]">{file.name}</p>
        ) : (
          <p className="text-sm text-[#5C5C6B]">Drag and drop the discharge summary PDF here, or</p>
        )}
        <label className="cursor-pointer text-sm font-medium text-[#1E6BFF] hover:underline">
          Browse files
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      {error && <ErrorState message={error} />}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onBack} disabled={submitting}>
          Back
        </Button>
        <Button
          type="button"
          disabled={submitting || !selectedCarrierId}
          onClick={handleSubmit}
          className="bg-[#1E6BFF] hover:bg-[#1E6BFF]/90"
        >
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
    </div>
  )
}
