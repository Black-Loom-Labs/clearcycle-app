"use client"

import * as React from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
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
import { api, type Carrier, type Patient } from '@/lib/api'
import { useHospital } from '@/lib/hospital-context'

const ROOM_CATEGORIES = [
  { value: 'private_single_ac_room', label: 'Private Single AC Room' },
  { value: 'twin_sharing', label: 'Twin Sharing' },
  { value: 'deluxe_room', label: 'Deluxe Room' },
  { value: 'icu_only', label: 'ICU Only' },
  { value: 'general_ward', label: 'General Ward' },
]

interface PolicyDraft {
  carrier_id: string
  policy_number: string
  plan_name: string
  sum_insured_inr: string
  room_category: string
  room_rent_limit_inr: string
  policy_start_date: string
  policy_end_date: string
  copay_pct: string
  pre_existing_conditions: string
  pre_auth_required_above_inr: string
}

function emptyPolicy(): PolicyDraft {
  return {
    carrier_id: '',
    policy_number: '',
    plan_name: '',
    sum_insured_inr: '',
    room_category: ROOM_CATEGORIES[0].value,
    room_rent_limit_inr: '',
    policy_start_date: '',
    policy_end_date: '',
    copay_pct: '0',
    pre_existing_conditions: '',
    pre_auth_required_above_inr: '',
  }
}

export function PatientRegistrationForm({
  onRegistered,
  onCancel,
}: {
  onRegistered: (patient: Patient) => void
  onCancel?: () => void
}) {
  const { hospitalId } = useHospital()
  const [name, setName] = React.useState('')
  const [dob, setDob] = React.useState('')
  const [externalId, setExternalId] = React.useState('')
  const [policies, setPolicies] = React.useState<PolicyDraft[]>([emptyPolicy()])
  const [carriers, setCarriers] = React.useState<Carrier[]>([])
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    api
      .getCarriers()
      .then((res) => setCarriers(Array.isArray(res) ? res : []))
      .catch(() => setCarriers([]))
  }, [])

  function updatePolicy(i: number, patch: Partial<PolicyDraft>) {
    setPolicies((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)))
  }

  function addPolicy() {
    setPolicies((prev) => [...prev, emptyPolicy()])
  }

  function removePolicy(i: number) {
    setPolicies((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !dob) {
      setError('Name and Date of Birth are required')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const patient = await api.createPatient({
        hospital_id: hospitalId,
        name: name.trim(),
        dob,
        external_id: externalId.trim() || undefined,
        insurance_policies: policies
          .filter((p) => p.carrier_id && p.policy_number)
          .map((p) => ({
            carrier_id: p.carrier_id,
            policy_number: p.policy_number,
            plan_name: p.plan_name,
            sum_insured_inr: Number(p.sum_insured_inr) || 0,
            room_category: p.room_category,
            room_rent_limit_inr: Number(p.room_rent_limit_inr) || 0,
            policy_start_date: p.policy_start_date,
            policy_end_date: p.policy_end_date,
            copay_pct: Number(p.copay_pct) || 0,
            pre_existing_conditions: p.pre_existing_conditions
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
            pre_auth_required_above_inr: Number(p.pre_auth_required_above_inr) || 0,
          })),
      })
      onRegistered(patient)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to register patient')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Name" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <Field label="Date of Birth" required>
          <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
        </Field>
        <Field label="External ID / MRN">
          <Input
            placeholder="Hospital's own patient ID"
            value={externalId}
            onChange={(e) => setExternalId(e.target.value)}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-semibold text-[#0A0A0F]">Insurance Policies</span>
        {policies.map((policy, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-lg border border-[#E4E4EF] p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#5C5C6B]">Policy {i + 1}</span>
              {policies.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePolicy(i)}
                  className="text-[#5C5C6B] hover:text-[#DC2626]"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Carrier">
                <Select
                  value={policy.carrier_id}
                  onValueChange={(v) => updatePolicy(i, { carrier_id: v ?? '' })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select carrier">
                      {(value: string) =>
                        carriers.find((c) => c.carrier_id === value)?.short_name ?? 'Select carrier'
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
              <Field label="Policy Number">
                <Input
                  value={policy.policy_number}
                  onChange={(e) => updatePolicy(i, { policy_number: e.target.value })}
                />
              </Field>
              <Field label="Plan Name">
                <Input
                  value={policy.plan_name}
                  onChange={(e) => updatePolicy(i, { plan_name: e.target.value })}
                />
              </Field>
              <Field label="Sum Insured (₹)">
                <Input
                  type="number"
                  value={policy.sum_insured_inr}
                  onChange={(e) => updatePolicy(i, { sum_insured_inr: e.target.value })}
                />
              </Field>
              <Field label="Room Category">
                <Select
                  value={policy.room_category}
                  onValueChange={(v) => updatePolicy(i, { room_category: v ?? ROOM_CATEGORIES[0].value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(value: string) =>
                        ROOM_CATEGORIES.find((r) => r.value === value)?.label ?? value
                      }
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
                <Input
                  type="number"
                  value={policy.room_rent_limit_inr}
                  onChange={(e) => updatePolicy(i, { room_rent_limit_inr: e.target.value })}
                />
              </Field>
              <Field label="Policy Start Date">
                <Input
                  type="date"
                  value={policy.policy_start_date}
                  onChange={(e) => updatePolicy(i, { policy_start_date: e.target.value })}
                />
              </Field>
              <Field label="Policy End Date">
                <Input
                  type="date"
                  value={policy.policy_end_date}
                  onChange={(e) => updatePolicy(i, { policy_end_date: e.target.value })}
                />
              </Field>
              <Field label="Copay %">
                <Input
                  type="number"
                  value={policy.copay_pct}
                  onChange={(e) => updatePolicy(i, { copay_pct: e.target.value })}
                />
              </Field>
              <Field label="Pre-existing Conditions">
                <Input
                  placeholder="diabetes, hypertension"
                  value={policy.pre_existing_conditions}
                  onChange={(e) => updatePolicy(i, { pre_existing_conditions: e.target.value })}
                />
              </Field>
              <Field label="Pre-auth Required Above (₹)">
                <Input
                  type="number"
                  value={policy.pre_auth_required_above_inr}
                  onChange={(e) => updatePolicy(i, { pre_auth_required_above_inr: e.target.value })}
                />
              </Field>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addPolicy}
          className="flex w-fit items-center gap-1 text-sm font-medium text-[#1E6BFF] hover:underline"
        >
          <Plus className="size-3.5" />
          Add Another Policy
        </button>
      </div>

      {error && <ErrorState message={error} />}

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting} className="bg-[#1E6BFF] hover:bg-[#1E6BFF]/90">
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Registering...
            </>
          ) : (
            'Register Patient'
          )}
        </Button>
      </div>
    </form>
  )
}

export function Field({
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
