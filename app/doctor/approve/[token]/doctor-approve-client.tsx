"use client"

import * as React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { API_BASE } from '@/lib/config'

// This page is reached from an SMS link and carries its own token/OTP — it
// is intentionally public (no Authorization header, no app shell/nav).

interface DoctorApprovalCode {
  code: string
  description: string
}

interface DoctorApprovalContext {
  doctor_name: string
  claim_id: string
  patient_name?: string
  hospital_name?: string
  icd_codes: DoctorApprovalCode[]
  cpt_codes: DoctorApprovalCode[]
}

interface CodeEdit {
  type: 'icd' | 'cpt'
  code: string
  note: string
  flagged: boolean
}

type Stage = 'loading' | 'load_error' | 'form' | 'submitting' | 'success' | 'submit_error'

export function DoctorApproveClient({ token }: { token: string }) {
  const [stage, setStage] = React.useState<Stage>('loading')
  const [context, setContext] = React.useState<DoctorApprovalContext | null>(null)

  const [otp, setOtp] = React.useState('')
  const [edits, setEdits] = React.useState<Record<string, CodeEdit>>({})
  const [decision, setDecision] = React.useState<'approve' | 'reject' | null>(null)
  const [notes, setNotes] = React.useState('')
  const [submitError, setSubmitError] = React.useState('')

  React.useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE}/doctor/approve/${token}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('load_failed')
        return res.json()
      })
      .then((data: DoctorApprovalContext) => {
        if (cancelled) return
        setContext(data)
        setStage('form')
      })
      .catch(() => {
        if (!cancelled) setStage('load_error')
      })
    return () => {
      cancelled = true
    }
  }, [token])

  function editFor(type: 'icd' | 'cpt', code: string): CodeEdit {
    return edits[`${type}:${code}`] ?? { type, code, note: '', flagged: false }
  }

  function updateEdit(type: 'icd' | 'cpt', code: string, patch: Partial<CodeEdit>) {
    const key = `${type}:${code}`
    setEdits((prev) => ({ ...prev, [key]: { ...editFor(type, code), ...patch } }))
  }

  const otpValid = /^\d{6}$/.test(otp)
  const canSubmit = otpValid && decision !== null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitError('')
    setStage('submitting')
    try {
      const res = await fetch(`${API_BASE}/workflows/doctor-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          otp,
          decision,
          notes: notes.trim() || undefined,
          edits: Object.values(edits).filter((e) => e.note.trim() || e.flagged),
        }),
      })
      if (!res.ok) throw new Error('submit_failed')
      setStage('success')
    } catch {
      setSubmitError('This link has expired or already been used.')
      setStage('submit_error')
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#F7F8FA] px-4 py-6">
      <div className="mx-auto flex w-full max-w-md flex-col gap-5">
        <div className="flex justify-center py-2">
          <Image src="/logo.svg" alt="ClearCycle" width={160} height={40} priority />
        </div>

        {stage === 'loading' && (
          <Card className="border-[#E4E4EF]">
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center text-sm text-[#5C5C6B]">
              Loading review request…
            </CardContent>
          </Card>
        )}

        {stage === 'load_error' && (
          <Card className="border-[#E4E4EF]">
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
              <p className="text-base font-semibold text-[#0A0A0F]">
                This link has expired or already been used.
              </p>
              <p className="text-sm text-[#5C5C6B]">
                Please contact the hospital billing office for a new link.
              </p>
            </CardContent>
          </Card>
        )}

        {stage === 'submit_error' && (
          <Card className="border-[#E4E4EF]">
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
              <p className="text-base font-semibold text-[#0A0A0F]">
                This link has expired or already been used.
              </p>
              {submitError && <p className="text-sm text-[#5C5C6B]">{submitError}</p>}
            </CardContent>
          </Card>
        )}

        {stage === 'success' && context && (
          <Card className="border-[#E4E4EF]">
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
              <p className="text-base font-semibold text-[#0A0A0F]">
                Thank you Dr. {context.doctor_name}. Your review has been recorded.
              </p>
            </CardContent>
          </Card>
        )}

        {(stage === 'form' || stage === 'submitting') && context && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Doctor + claim context */}
            <Card className="border-[#E4E4EF]">
              <CardHeader>
                <CardTitle>Hello, Dr. {context.doctor_name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 text-sm text-[#5C5C6B]">
                <p>Claim: {context.claim_id}</p>
                {context.patient_name && <p>Patient: {context.patient_name}</p>}
                {context.hospital_name && <p>Hospital: {context.hospital_name}</p>}
              </CardContent>
            </Card>

            {/* OTP */}
            <Card className="border-[#E4E4EF]">
              <CardHeader>
                <CardTitle>Verify it&apos;s you</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <label htmlFor="otp" className="text-sm font-medium text-[#0A0A0F]">
                  Enter the 6-digit code sent to your phone
                </label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="h-12 text-center text-lg tracking-[0.3em]"
                  required
                />
              </CardContent>
            </Card>

            {/* Coding review */}
            <Card className="border-[#E4E4EF]">
              <CardHeader>
                <CardTitle>Coding Review</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <CodeSection
                  label="ICD-10 Diagnosis Codes"
                  type="icd"
                  codes={context.icd_codes}
                  editFor={editFor}
                  updateEdit={updateEdit}
                />
                <CodeSection
                  label="CPT Procedure Codes"
                  type="cpt"
                  codes={context.cpt_codes}
                  editFor={editFor}
                  updateEdit={updateEdit}
                />
              </CardContent>
            </Card>

            {/* Overall decision */}
            <Card className="border-[#E4E4EF]">
              <CardHeader>
                <CardTitle>Overall Decision</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <DecisionOption
                    value="approve"
                    label="Approve"
                    selected={decision === 'approve'}
                    onSelect={() => setDecision('approve')}
                  />
                  <DecisionOption
                    value="reject"
                    label="Reject"
                    selected={decision === 'reject'}
                    onSelect={() => setDecision('reject')}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="notes" className="text-sm font-medium text-[#0A0A0F]">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={4}
                    placeholder="Add any comments about your decision…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-lg border border-[#E4E4EF] bg-white p-3 text-sm text-[#0A0A0F] outline-none focus:border-[#1E6BFF] focus:ring-2 focus:ring-[#1E6BFF]/20"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={!canSubmit || stage === 'submitting'}
              className="h-12 w-full bg-[#1E6BFF] text-base hover:bg-[#1E6BFF]/90"
            >
              {stage === 'submitting' ? 'Submitting…' : 'Submit Review'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}

function CodeSection({
  label,
  type,
  codes,
  editFor,
  updateEdit,
}: {
  label: string
  type: 'icd' | 'cpt'
  codes: DoctorApprovalCode[]
  editFor: (type: 'icd' | 'cpt', code: string) => CodeEdit
  updateEdit: (type: 'icd' | 'cpt', code: string, patch: Partial<CodeEdit>) => void
}) {
  if (!codes?.length) return null
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-[#0A0A0F]">{label}</h3>
      <div className="flex flex-col gap-3">
        {codes.map((c) => {
          const edit = editFor(type, c.code)
          return (
            <div key={c.code} className="rounded-lg border border-[#E4E4EF] bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-sm font-semibold text-[#0A0A0F]">{c.code}</p>
                  <p className="text-sm text-[#5C5C6B]">{c.description}</p>
                </div>
              </div>
              <label className="mt-3 flex min-h-[48px] items-center gap-2 text-sm text-[#0A0A0F]">
                <input
                  type="checkbox"
                  checked={edit.flagged}
                  onChange={(e) => updateEdit(type, c.code, { flagged: e.target.checked })}
                  className="size-5 shrink-0 rounded border-[#E4E4EF] text-[#1E6BFF] focus:ring-[#1E6BFF]/30"
                />
                Flag this code for change
              </label>
              <textarea
                rows={2}
                placeholder="Add a note about this code (optional)"
                value={edit.note}
                onChange={(e) => updateEdit(type, c.code, { note: e.target.value })}
                className="mt-2 w-full rounded-lg border border-[#E4E4EF] bg-white p-2.5 text-sm text-[#0A0A0F] outline-none focus:border-[#1E6BFF] focus:ring-2 focus:ring-[#1E6BFF]/20"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DecisionOption({
  value,
  label,
  selected,
  onSelect,
}: {
  value: string
  label: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <label
      className={`flex min-h-[48px] cursor-pointer items-center gap-3 rounded-lg border p-3 text-base font-medium transition-colors ${
        selected
          ? 'border-[#1E6BFF] bg-[#EAF2FF] text-[#1E6BFF]'
          : 'border-[#E4E4EF] bg-white text-[#0A0A0F]'
      }`}
    >
      <input
        type="radio"
        name="decision"
        value={value}
        checked={selected}
        onChange={onSelect}
        className="size-5 shrink-0 accent-[#1E6BFF]"
      />
      {label}
    </label>
  )
}
