"use client"

import * as React from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Loader2, FileX } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
} from '@/components/ui/dialog'
import { ErrorState } from '@/components/api-states'
import { StatusBadge } from '@/components/status-badge'
import { CopyableId } from '@/components/copyable-id'
import { useToast } from '@/components/toast'
import { api, type Carrier, type Claim, type InsurancePolicy, type Patient } from '@/lib/api'
import { formatINR } from '@/lib/utils'
import { Field } from '../patient-registration-form'
import { PreEncounterCheckPanel } from '../pre-encounter-check-panel'

const ROOM_CATEGORIES = [
  { value: 'private_single_ac_room', label: 'Private Single AC Room' },
  { value: 'twin_sharing', label: 'Twin Sharing' },
  { value: 'deluxe_room', label: 'Deluxe Room' },
  { value: 'icu_only', label: 'ICU Only' },
  { value: 'general_ward', label: 'General Ward' },
]

export function PatientDetailClient({ patientId }: { patientId: string }) {
  const [patient, setPatient] = React.useState<Patient | null>(null)
  const [claims, setClaims] = React.useState<Claim[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [addPolicyOpen, setAddPolicyOpen] = React.useState(false)
  const [checkOpen, setCheckOpen] = React.useState(false)

  const load = React.useCallback(() => {
    setLoading(true)
    setError(null)
    api
      .getPatient(patientId)
      .then((p) => setPatient(p))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
    api
      .getPatientClaims(patientId)
      .then((res) => setClaims(res.claims ?? []))
      .catch(() => setClaims([]))
  }, [patientId])

  React.useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return <p className="text-sm text-[#5C5C6B]">Loading…</p>
  }

  if (error || !patient) {
    return <ErrorState message={error ?? 'Patient not found'} onRetry={load} />
  }

  return (
    <div className="flex flex-col gap-4">
      <Link href="/patients" className="flex w-fit items-center gap-1.5 text-sm text-[#5C5C6B] hover:text-[#0A0A0F]">
        <ArrowLeft className="size-3.5" />
        Back to Patients
      </Link>

      <Card className="border-[#E4E4EF]">
        <CardContent className="flex flex-col gap-1 py-4">
          <span className="text-lg font-semibold text-[#0A0A0F]">{patient.name}</span>
          <span className="text-sm text-[#5C5C6B]">
            DOB: {patient.dob ?? '—'}
            {patient.external_id ? ` · MRN: ${patient.external_id}` : ''}
          </span>
        </CardContent>
      </Card>

      <Card className="border-[#E4E4EF]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-[#0A0A0F]">Insurance Policies</CardTitle>
          <div className="flex gap-2">
            <Dialog open={checkOpen} onOpenChange={setCheckOpen}>
              <Button variant="outline" onClick={() => setCheckOpen(true)}>
                Run Pre-Encounter Check
              </Button>
              <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Pre-Encounter Check</DialogTitle>
                  <DialogDescription>Check eligibility for {patient.name}.</DialogDescription>
                </DialogHeader>
                <PreEncounterCheckPanel patient={patient} />
              </DialogContent>
            </Dialog>
            <Dialog open={addPolicyOpen} onOpenChange={setAddPolicyOpen}>
              <Button className="bg-[#1E6BFF] hover:bg-[#1E6BFF]/90" onClick={() => setAddPolicyOpen(true)}>
                <Plus className="size-4" />
                Add Policy
              </Button>
              <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Policy</DialogTitle>
                  <DialogDescription>Attach another insurance policy to {patient.name}.</DialogDescription>
                </DialogHeader>
                <AddPolicyForm
                  patientId={patient.patient_id}
                  onAdded={() => {
                    setAddPolicyOpen(false)
                    load()
                  }}
                  onCancel={() => setAddPolicyOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {patient.insurance_policies.length === 0 && (
            <p className="text-sm text-[#5C5C6B]">No policies on file</p>
          )}
          {patient.insurance_policies.map((policy, i) => (
            <PolicyCard key={i} policy={policy} />
          ))}
        </CardContent>
      </Card>

      <Card className="border-[#E4E4EF]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#0A0A0F]">Claims</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {claims.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <FileX className="size-8 text-[#5C5C6B]" />
              <p className="text-sm font-medium text-[#0A0A0F]">No claims yet</p>
              <p className="text-sm text-[#5C5C6B]">
                Claims submitted through the New Claim flow will appear here once linked to this patient.
              </p>
            </div>
          )}
          {claims.map((c) => (
            <Link
              key={c.id}
              href={`/claims/${c.id}`}
              className="flex items-center justify-between rounded-lg border border-[#E4E4EF] px-3 py-2 hover:bg-[#F7F8FA]"
            >
              <CopyableId value={c.id} displayValue={`${c.id.slice(0, 8)}…`} className="text-xs" />
              <StatusBadge status={c.status} />
              <span className="text-sm text-[#5C5C6B]">
                {new Date(c.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function PolicyCard({ policy }: { policy: InsurancePolicy }) {
  const expired = policy.policy_end_date ? new Date(policy.policy_end_date) < new Date() : false
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[#E4E4EF] p-3">
      <div className="flex items-center justify-between">
        <span className="font-medium text-[#0A0A0F]">{policy.plan_name || policy.carrier_id}</span>
        <StatusBadge status={policy.active && !expired ? 'active' : 'expired'} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm text-[#5C5C6B] sm:grid-cols-4">
        <div>Carrier: {policy.carrier_id}</div>
        <div>Policy #: {policy.policy_number}</div>
        <div>Sum Insured: {formatINR(policy.sum_insured_inr)}</div>
        <div>Used: {formatINR(policy.sum_insured_used_inr)}</div>
        <div>Room: {policy.room_category}</div>
        <div>
          Dates: {policy.policy_start_date} → {policy.policy_end_date}
        </div>
      </div>
    </div>
  )
}

function AddPolicyForm({
  patientId,
  onAdded,
  onCancel,
}: {
  patientId: string
  onAdded: () => void
  onCancel: () => void
}) {
  const { showToast } = useToast()
  const [carriers, setCarriers] = React.useState<Carrier[]>([])
  const [carrierId, setCarrierId] = React.useState('')
  const [policyNumber, setPolicyNumber] = React.useState('')
  const [planName, setPlanName] = React.useState('')
  const [sumInsured, setSumInsured] = React.useState('')
  const [roomCategory, setRoomCategory] = React.useState(ROOM_CATEGORIES[0].value)
  const [roomRentLimit, setRoomRentLimit] = React.useState('')
  const [startDate, setStartDate] = React.useState('')
  const [endDate, setEndDate] = React.useState('')
  const [copayPct, setCopayPct] = React.useState('0')
  const [preExisting, setPreExisting] = React.useState('')
  const [preAuthAbove, setPreAuthAbove] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    api
      .getCarriers()
      .then((res) => setCarriers(Array.isArray(res) ? res : []))
      .catch(() => setCarriers([]))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!carrierId || !policyNumber) {
      setError('Carrier and Policy Number are required')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await api.updatePatientPolicy(patientId, {
        carrier_id: carrierId,
        policy_number: policyNumber,
        plan_name: planName,
        sum_insured_inr: Number(sumInsured) || 0,
        room_category: roomCategory,
        room_rent_limit_inr: Number(roomRentLimit) || 0,
        policy_start_date: startDate,
        policy_end_date: endDate,
        copay_pct: Number(copayPct) || 0,
        pre_existing_conditions: preExisting.split(',').map((s) => s.trim()).filter(Boolean),
        pre_auth_required_above_inr: Number(preAuthAbove) || 0,
      })
      showToast('Policy added')
      onAdded()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add policy')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Carrier">
          <Select value={carrierId} onValueChange={(v) => setCarrierId(v ?? '')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select carrier">
                {(value: string) => carriers.find((c) => c.carrier_id === value)?.short_name ?? 'Select carrier'}
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
        <Field label="Policy Number">
          <Input value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} />
        </Field>
        <Field label="Plan Name">
          <Input value={planName} onChange={(e) => setPlanName(e.target.value)} />
        </Field>
        <Field label="Sum Insured (₹)">
          <Input type="number" value={sumInsured} onChange={(e) => setSumInsured(e.target.value)} />
        </Field>
        <Field label="Room Category">
          <Select value={roomCategory} onValueChange={(v) => setRoomCategory(v ?? ROOM_CATEGORIES[0].value)}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {(value: string) => ROOM_CATEGORIES.find((r) => r.value === value)?.label ?? value}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {ROOM_CATEGORIES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Room Rent Limit / day (₹)">
          <Input type="number" value={roomRentLimit} onChange={(e) => setRoomRentLimit(e.target.value)} />
        </Field>
        <Field label="Policy Start Date">
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </Field>
        <Field label="Policy End Date">
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </Field>
        <Field label="Copay %">
          <Input type="number" value={copayPct} onChange={(e) => setCopayPct(e.target.value)} />
        </Field>
        <Field label="Pre-existing Conditions">
          <Input
            placeholder="diabetes, hypertension"
            value={preExisting}
            onChange={(e) => setPreExisting(e.target.value)}
          />
        </Field>
        <Field label="Pre-auth Required Above (₹)">
          <Input type="number" value={preAuthAbove} onChange={(e) => setPreAuthAbove(e.target.value)} />
        </Field>
      </div>

      {error && <ErrorState message={error} />}

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="bg-[#1E6BFF] hover:bg-[#1E6BFF]/90">
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Add Policy'
          )}
        </Button>
      </div>
    </form>
  )
}
