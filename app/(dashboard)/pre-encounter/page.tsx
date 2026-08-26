"use client"

import * as React from 'react'
import { Check, AlertTriangle, X, ShieldAlert, Copy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { LetterText } from '@/components/letter-text'
import { api, type PreEncounterResult } from '@/lib/api'
import { useHospital } from '@/lib/hospital-context'
import { cn } from '@/lib/utils'

const CARRIERS = [
  { id: 'STAR_HEALTH_001', label: 'Star Health Comprehensive' },
  { id: 'NIVA_BUPA_001', label: 'Niva Bupa Health Premia Gold' },
]

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function PreEncounterPage() {
  const { hospitalId } = useHospital()
  const [patientId, setPatientId] = React.useState('')
  const [carrierId, setCarrierId] = React.useState(CARRIERS[0].id)
  const [admissionDate, setAdmissionDate] = React.useState(todayISO())
  const [diagnoses, setDiagnoses] = React.useState('')
  const [procedures, setProcedures] = React.useState('')
  const [estimatedCost, setEstimatedCost] = React.useState('')

  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<PreEncounterResult | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setResult(null)
    try {
      const body = {
        hospital_id: hospitalId,
        patient_id: patientId,
        carrier_id: carrierId,
        admission_date: admissionDate,
        proposed_icd_codes: diagnoses.split(',').map((s) => s.trim()).filter(Boolean),
        proposed_cpt_codes: procedures.split(',').map((s) => s.trim()).filter(Boolean),
        estimated_cost_inr: Number(estimatedCost) || 0,
      }
      const res = await api.checkEligibility(body)
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to check eligibility')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-[#E4E4EF]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#0A0A0F]">
            Admissions Eligibility Check
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Patient ID">
              <Input
                placeholder="00000000-..."
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
              />
            </Field>
            <Field label="Carrier">
              <Select value={carrierId} onValueChange={(v) => setCarrierId(v ?? CARRIERS[0].id)}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string) => CARRIERS.find((c) => c.id === value)?.label ?? value}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CARRIERS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Admission Date">
              <Input
                type="date"
                value={admissionDate}
                onChange={(e) => setAdmissionDate(e.target.value)}
                required
              />
            </Field>
            <Field label="Estimated Cost">
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-[#5C5C6B]">
                  ₹
                </span>
                <Input
                  type="number"
                  className="pl-6"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  required
                />
              </div>
            </Field>
            <Field label="Proposed Diagnoses">
              <Input
                placeholder="M17.11, I10"
                value={diagnoses}
                onChange={(e) => setDiagnoses(e.target.value)}
              />
            </Field>
            <Field label="Proposed Procedures">
              <Input
                placeholder="27447, 00840"
                value={procedures}
                onChange={(e) => setProcedures(e.target.value)}
              />
            </Field>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={submitting} className="bg-[#1E6BFF] hover:bg-[#1E6BFF]/90">
                {submitting ? 'Checking...' : 'Check Eligibility'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && <ErrorState message={error} />}

      {result && <ResultPanel result={result} />}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#0A0A0F]">{label}</label>
      {children}
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

      <Card className="border-[#E4E4EF]">
        <CardContent className="grid grid-cols-2 gap-4 py-2 sm:grid-cols-4">
          <SummaryItem label="Plan Name" value={result.plan_name ?? '—'} />
          <SummaryItem
            label="Policy Number"
            value={result.policy_number ? maskPolicy(result.policy_number) : '—'}
          />
          <SummaryItem
            label="Months Covered"
            value={result.months_covered != null ? String(result.months_covered) : '—'}
          />
          <SummaryItem
            label="SI Available"
            value={
              result.sum_insured_available_inr != null
                ? `₹${result.sum_insured_available_inr.toLocaleString('en-IN')}`
                : '—'
            }
          />
        </CardContent>
      </Card>

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
              </div>
              <p className="mt-1 text-sm text-[#5C5C6B]">{flag.detail}</p>
              {flag.action_required && (
                <p className="mt-1 text-xs font-medium text-[#0A0A0F]">
                  Action: {flag.action_required}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {result.pre_auth_required && result.pre_auth_letter && (
        <PreAuthLetter text={result.pre_auth_letter} />
      )}
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-[#5C5C6B]">{label}</span>
      <span className="text-sm font-semibold text-[#0A0A0F]">{value}</span>
    </div>
  )
}

function maskPolicy(policy: string): string {
  if (policy.length <= 4) return policy
  return `${'•'.repeat(policy.length - 4)}${policy.slice(-4)}`
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
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-[#0A0A0F]"
        onClick={() => setOpen((o) => !o)}
      >
        Pre-Authorisation Letter
        <span className="text-xs text-[#5C5C6B]">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open && (
        <div className="border-t border-[#E4E4EF]">
          <div className="flex justify-end px-4 pt-2">
            <Button size="sm" variant="outline" onClick={copy}>
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <LetterText
            text={text}
            className="max-h-96 overflow-auto whitespace-pre-wrap p-4 text-sm text-[#0A0A0F]"
          />
        </div>
      )}
    </div>
  )
}
