"use client"

import * as React from 'react'
import { Check, AlertTriangle, X, ShieldAlert, Copy, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ErrorState } from '@/components/api-states'
import { api, type Carrier, type Patient, type PreEncounterResult } from '@/lib/api'
import { useHospital } from '@/lib/hospital-context'
import { cn, formatINR } from '@/lib/utils'
import { Field } from './patient-registration-form'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function PreEncounterCheckPanel({
  patient,
  onBack,
  onProceed,
}: {
  patient: Patient
  onBack?: () => void
  onProceed?: (result: PreEncounterResult | null, carrierId: string) => void
}) {
  const { hospitalId } = useHospital()
  const [carriers, setCarriers] = React.useState<Carrier[]>([])
  const activePolicies = patient.insurance_policies.filter((p) => p.active)
  const [carrierId, setCarrierId] = React.useState(activePolicies[0]?.carrier_id ?? '')
  const [admissionDate, setAdmissionDate] = React.useState(todayISO())
  const [diagnoses, setDiagnoses] = React.useState('')
  const [procedures, setProcedures] = React.useState('')
  const [estimatedCost, setEstimatedCost] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<PreEncounterResult | null>(null)

  React.useEffect(() => {
    api
      .getCarriers()
      .then((res) => setCarriers(Array.isArray(res) ? res : []))
      .catch(() => setCarriers([]))
  }, [])

  function carrierLabel(id: string) {
    return carriers.find((c) => c.carrier_id === id)?.short_name ?? id
  }

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setResult(null)
    try {
      const res = await api.runPreEncounterCheck({
        hospital_id: hospitalId,
        patient_id: patient.patient_id,
        carrier_id: carrierId,
        admission_date: admissionDate,
        proposed_icd_codes: diagnoses.split(',').map((s) => s.trim()).filter(Boolean),
        proposed_cpt_codes: procedures.split(',').map((s) => s.trim()).filter(Boolean),
        estimated_cost_inr: Number(estimatedCost) || undefined,
      })
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to check eligibility')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleCheck} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Carrier">
          {activePolicies.length > 1 ? (
            <Select value={carrierId} onValueChange={(v) => setCarrierId(v ?? '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select carrier">{(value: string) => carrierLabel(value)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {activePolicies.map((p) => (
                  <SelectItem key={p.carrier_id} value={p.carrier_id}>
                    {carrierLabel(p.carrier_id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input value={carrierLabel(carrierId)} disabled />
          )}
        </Field>
        <Field label="Admission Date">
          <Input type="date" value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} required />
        </Field>
        <Field label="Proposed ICD-10 Codes">
          <Input
            placeholder="Leave blank if unknown"
            value={diagnoses}
            onChange={(e) => setDiagnoses(e.target.value)}
          />
        </Field>
        <Field label="Proposed CPT Codes">
          <Input
            placeholder="Leave blank if unknown"
            value={procedures}
            onChange={(e) => setProcedures(e.target.value)}
          />
        </Field>
        <Field label="Estimated Cost (₹)">
          <Input
            type="number"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
          />
        </Field>
        <div className="flex items-end">
          <Button type="submit" disabled={submitting || !carrierId} className="bg-[#1E6BFF] hover:bg-[#1E6BFF]/90">
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Checking eligibility...
              </>
            ) : (
              'Run Eligibility Check'
            )}
          </Button>
        </div>
      </form>

      {error && <ErrorState message={error} />}

      {result && <ResultPanel result={result} />}

      {(result || onBack) && (
        <div className="flex items-center justify-between gap-2 border-t border-[#E4E4EF] pt-4">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
          )}
          {onProceed && (
            <div className="ml-auto flex gap-2">
              <Button type="button" variant="outline" onClick={() => onProceed(result, carrierId)}>
                Proceed Anyway
              </Button>
              <Button
                type="button"
                className="bg-[#1E6BFF] hover:bg-[#1E6BFF]/90"
                onClick={() => onProceed(result, carrierId)}
              >
                Upload Discharge Summary →
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ResultPanel({ result }: { result: PreEncounterResult }) {
  const status = result.clearance_status?.toLowerCase()

  const banner = {
    cleared: {
      bg: 'bg-[#DCFCE7] border-[#16A34A]/30 text-[#16A34A]',
      icon: <Check className="size-5" />,
      text: 'Patient cleared for admission',
    },
    conditional: {
      bg: 'bg-[#FEF3C7] border-[#D97706]/30 text-[#D97706]',
      icon: <AlertTriangle className="size-5" />,
      text: 'Conditional — review flags below',
    },
    blocked: {
      bg: 'bg-[#FEE2E2] border-[#DC2626]/30 text-[#DC2626]',
      icon: <X className="size-5" />,
      text: 'Admission blocked — see issues below',
    },
  }[status] ?? {
    bg: 'bg-[#E4E4EF] border-[#5C5C6B]/30 text-[#5C5C6B]',
    icon: <ShieldAlert className="size-5" />,
    text: result.clearance_status,
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={cn('flex items-center gap-2 rounded-lg border px-4 py-3 font-semibold', banner.bg)}>
        {banner.icon}
        {banner.text}
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-lg border border-[#E4E4EF] bg-white p-4 sm:grid-cols-3">
        <StatChip label="Room Entitlement" value={result.room_entitlement ?? '—'} />
        <StatChip
          label="Sum Insured Available"
          value={result.sum_insured_available_inr != null ? formatINR(result.sum_insured_available_inr) : '—'}
        />
        <StatChip
          label="Months Covered"
          value={result.months_covered != null ? String(result.months_covered) : '—'}
        />
      </div>

      {result.flags?.length > 0 && (
        <div className="flex flex-col gap-2">
          {result.flags.map((flag, i) => (
            <div
              key={i}
              className={cn(
                'rounded-lg border-l-4 bg-white p-3 shadow-sm',
                flag.severity === 'block'
                  ? 'border-l-[#DC2626]'
                  : flag.severity === 'warn'
                  ? 'border-l-[#D97706]'
                  : 'border-l-[#1E6BFF]'
              )}
            >
              <div className="flex items-center gap-2">
                <ShieldAlert
                  className={cn(
                    'size-4',
                    flag.severity === 'block'
                      ? 'text-[#DC2626]'
                      : flag.severity === 'warn'
                      ? 'text-[#D97706]'
                      : 'text-[#1E6BFF]'
                  )}
                />
                <span className="text-sm font-medium text-[#0A0A0F]">{flag.title}</span>
                <span
                  className={cn(
                    'ml-auto rounded-full px-2 py-0.5 text-xs font-medium',
                    flag.severity === 'block'
                      ? 'bg-[#FEE2E2] text-[#DC2626]'
                      : flag.severity === 'warn'
                      ? 'bg-[#FEF3C7] text-[#D97706]'
                      : 'bg-[#EAF2FF] text-[#1E6BFF]'
                  )}
                >
                  {flag.severity}
                </span>
              </div>
              <p className="mt-1 text-sm text-[#5C5C6B]">{flag.detail}</p>
              {flag.action_required && (
                <p className="mt-1 text-xs font-medium text-[#0A0A0F]">Action: {flag.action_required}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {result.pre_auth_required && result.pre_auth_letter && <PreAuthLetter text={result.pre_auth_letter} />}
    </div>
  )
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-[#5C5C6B]">{label}</span>
      <span className="text-sm font-semibold text-[#0A0A0F]">{value}</span>
    </div>
  )
}

function PreAuthLetter({ text }: { text: string }) {
  const [open, setOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-lg border border-[#E4E4EF] bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-[#0A0A0F]"
        onClick={() => setOpen((o) => !o)}
      >
        Pre-Authorisation Letter
        <span className="text-xs text-[#5C5C6B]">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open && (
        <div className="border-t border-[#E4E4EF]">
          <div className="flex justify-end px-4 pt-2">
            <Button type="button" size="sm" variant="outline" onClick={copy}>
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <div className="max-h-96 overflow-auto whitespace-pre-wrap p-4 text-sm text-[#0A0A0F]">{text}</div>
        </div>
      )}
    </div>
  )
}
