"use client"

import * as React from 'react'
import Image from 'next/image'
import { API_BASE, DEV_MODE } from '@/lib/config'
import { resolveCarrierName, useCarrierDirectory } from '@/lib/carriers'

// This page is reached from an SMS link and carries its own token/OTP — it
// is intentionally public (no Authorization header, no app shell/nav).

interface CodingDiagnosis {
  code: string
  description?: string
  diagnosis_type?: string
  calibrated_confidence?: number
}

interface CodingProcedure {
  code: string
  description?: string
  units?: number
  calibrated_confidence?: number
}

interface CodingResult {
  diagnoses?: CodingDiagnosis[]
  procedures?: CodingProcedure[]
  overall_confidence?: number
}

interface RiskWarning {
  severity: string
  code: string
  message: string
  action?: string
  required_docs?: string[]
}

interface RiskWarnings {
  warnings?: RiskWarning[]
  overall_risk_score?: number
}

interface ClaimContext {
  admission_date?: string | null
  discharge_date?: string | null
  carrier_id?: string | null
  treating_doctor?: string | null
  patient_name?: string | null
}

interface DoctorApprovalContext {
  valid: boolean
  doctor_name: string
  claim_id: string
  expires_at: string
  workflow_status: string
  coding_result: CodingResult | null
  risk_warnings: RiskWarnings | null
  claim_context: ClaimContext | null
}

type Stage = 'loading' | 'load_error' | 'otp' | 'review' | 'submitting' | 'success'

function Logo() {
  return (
    <div className="flex justify-center py-2">
      <Image src="/logo.svg" alt="ClearCycle" width={160} height={40} priority />
    </div>
  )
}

function confidenceTone(pct: number) {
  return pct >= 85 ? 'green' : pct >= 70 ? 'amber' : 'red'
}

const TONE_TEXT: Record<string, string> = {
  green: 'text-green-700',
  amber: 'text-amber-700',
  red: 'text-red-700',
}

const TONE_BAR: Record<string, string> = {
  green: 'bg-green-600',
  amber: 'bg-amber-500',
  red: 'bg-red-600',
}

function ConfidenceBar({ confidence }: { confidence?: number }) {
  if (confidence === undefined || confidence === null) return null
  const pct = Math.round(confidence * 100)
  const tone = confidenceTone(pct)
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 rounded-full bg-gray-200">
        <div className={`h-2 rounded-full ${TONE_BAR[tone]}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-semibold ${TONE_TEXT[tone]}`}>{pct}%</span>
    </div>
  )
}

function TypeBadge({ type }: { type?: string }) {
  if (!type) return null
  const isPrimary = type.toLowerCase() === 'primary'
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
        isPrimary ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
      }`}
    >
      {isPrimary ? 'Primary' : 'Secondary'}
    </span>
  )
}

function OverallConfidence({ confidence }: { confidence?: number }) {
  if (confidence === undefined || confidence === null) return null
  const pct = Math.round(confidence * 100)
  const tone = confidenceTone(pct)
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
      <span className="text-sm font-medium text-gray-900">Overall confidence</span>
      <span className={`text-lg font-bold ${TONE_TEXT[tone]}`}>{pct}%</span>
    </div>
  )
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function ClaimContextHeader({ claimContext }: { claimContext: ClaimContext | null }) {
  const directory = useCarrierDirectory()
  if (!claimContext) return null

  if (!claimContext.patient_name) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-gray-200 p-4">
        <p className="text-sm text-gray-500">Patient details not available</p>
      </div>
    )
  }

  const carrierName = resolveCarrierName(directory, claimContext.carrier_id)
  const carrierUnknown = !claimContext.carrier_id || carrierName === claimContext.carrier_id

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-gray-200 p-4">
      <p className="text-lg font-semibold text-gray-900">{claimContext.patient_name}</p>
      {claimContext.admission_date && claimContext.discharge_date && (
        <p className="text-sm text-gray-600">
          Admitted: {formatDate(claimContext.admission_date)} → Discharged:{' '}
          {formatDate(claimContext.discharge_date)}
        </p>
      )}
      {!carrierUnknown && <p className="text-sm text-gray-600">Insurer: {carrierName}</p>}
      {claimContext.treating_doctor && (
        <p className="text-sm text-gray-600">Treating Physician: {claimContext.treating_doctor}</p>
      )}
    </div>
  )
}

const SEVERITY_BADGE_STYLE: Record<string, string> = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-amber-100 text-amber-800',
}

const SEVERITY_STYLE: Record<string, string> = {
  high: 'border-red-300 bg-red-50 text-red-900',
  medium: 'border-amber-300 bg-amber-50 text-amber-900',
}

function RiskWarningsSection({ riskWarnings }: { riskWarnings: RiskWarnings | null }) {
  const warnings = riskWarnings?.warnings ?? []
  if (!riskWarnings || warnings.length === 0) return null
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4">
      <h2 className="text-xl font-bold text-gray-900">⚠️ Payer Risk Warnings</h2>
      {riskWarnings.overall_risk_score !== undefined && riskWarnings.overall_risk_score !== null && (
        <p className="text-sm text-gray-600">
          Overall risk score: <span className="font-semibold">{riskWarnings.overall_risk_score}</span>
        </p>
      )}
      <div className="flex flex-col gap-3">
        {warnings.map((w, i) => {
          const severity = w.severity?.toLowerCase() ?? ''
          const style = SEVERITY_STYLE[severity] ?? 'border-gray-300 bg-gray-50 text-gray-900'
          const badgeStyle = SEVERITY_BADGE_STYLE[severity] ?? 'bg-gray-200 text-gray-800'
          return (
            <div key={`${w.code}-${i}`} className={`rounded-lg border p-3 ${style}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm font-semibold">{w.code}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${badgeStyle}`}>
                  {w.severity}
                </span>
              </div>
              <p className="mt-1 text-sm">{w.message}</p>
              {w.action && <p className="mt-1 text-sm font-bold">{w.action}</p>}
              {w.required_docs && w.required_docs.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {w.required_docs.map((doc) => (
                    <span
                      key={doc}
                      className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium"
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function DoctorApproveClient({ token }: { token: string }) {
  const [stage, setStage] = React.useState<Stage>('loading')
  const [context, setContext] = React.useState<DoctorApprovalContext | null>(null)

  const [otpDigits, setOtpDigits] = React.useState<string[]>(Array(6).fill(''))
  const [otpError, setOtpError] = React.useState('')
  const otpRefs = React.useRef<Array<HTMLInputElement | null>>([])

  const [clinicalNotes, setClinicalNotes] = React.useState('')
  const [decision, setDecision] = React.useState<'approved' | 'rejected' | null>(null)
  const [rejectReason, setRejectReason] = React.useState('')
  const [additionalNotes, setAdditionalNotes] = React.useState('')
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
        if (DEV_MODE) {
          setOtpDigits('123456'.split(''))
          setStage('review')
        } else {
          setStage('otp')
        }
      })
      .catch(() => {
        if (!cancelled) setStage('load_error')
      })
    return () => {
      cancelled = true
    }
  }, [token])

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    setOtpDigits((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
    const otp = [...otpDigits]
    otp[index] = digit
    if (otp.every((d) => d.length === 1)) {
      setOtpError('')
      setStage('review')
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const otp = otpDigits.join('')

  async function submitReview(finalDecision: 'approved' | 'rejected') {
    if (finalDecision === 'rejected' && !rejectReason.trim()) return
    setSubmitError('')
    setStage('submitting')
    const combinedNotes = [
      clinicalNotes.trim() && `Clinical notes: ${clinicalNotes.trim()}`,
      finalDecision === 'rejected' && rejectReason.trim() && `Issue: ${rejectReason.trim()}`,
      additionalNotes.trim(),
    ]
      .filter(Boolean)
      .join('\n\n')

    try {
      const res = await fetch(`${API_BASE}/workflows/doctor-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          otp,
          decision: finalDecision,
          notes: combinedNotes,
          edits: [],
        }),
      })
      if (!res.ok) {
        let detail = ''
        try {
          detail = (await res.json())?.detail ?? ''
        } catch {
          // ignore
        }
        if (res.status === 400 && /otp/i.test(detail)) {
          setOtpError('Invalid OTP. Please try again.')
          setOtpDigits(Array(6).fill(''))
          setStage('otp')
          return
        }
        setSubmitError(detail || 'Something went wrong. Please try again.')
        setStage('review')
        return
      }
      setStage('success')
    } catch {
      setSubmitError('Something went wrong. Please try again.')
      setStage('review')
    }
  }

  if (stage === 'loading') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white px-4 py-6">
        <div className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-4">
          <Logo />
          <p className="text-lg text-gray-600">Loading…</p>
        </div>
      </div>
    )
  }

  if (stage === 'load_error') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white px-4 py-6">
        <div className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-4 text-center">
          <Logo />
          <p className="text-lg font-semibold text-gray-900">
            This approval link has expired or has already been used.
          </p>
          <p className="text-base text-gray-600">
            Please contact your billing team for a new link.
          </p>
        </div>
      </div>
    )
  }

  if (stage === 'success' && context) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white px-4 py-6">
        <div className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-4 text-center">
          <Logo />
          <p className="text-lg font-semibold text-gray-900">
            Thank you, Dr. {context.doctor_name}. Your review has been recorded.
          </p>
          <p className="text-base text-gray-600">The billing team has been notified.</p>
        </div>
      </div>
    )
  }

  if (!context) return null

  if (stage === 'otp') {
    return (
      <div className="min-h-screen w-full bg-white px-4 py-8">
        <div className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-6">
          <Logo />
          <h1 className="text-center text-2xl font-bold text-gray-900">
            Welcome, Dr. {context.doctor_name}
          </h1>
          <p className="text-center text-base text-gray-600">
            Enter the 6-digit OTP sent to your registered mobile number
          </p>

          <div className="flex justify-center gap-2">
            {otpDigits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  otpRefs.current[i] = el
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className="h-14 w-12 rounded-lg border border-gray-300 text-center text-2xl font-semibold text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              />
            ))}
          </div>

          {otpError && <p className="text-center text-base text-red-600">{otpError}</p>}

          <button
            type="button"
            disabled={otp.length !== 6}
            onClick={() => setStage('review')}
            className="min-h-[48px] w-full rounded-lg bg-blue-600 text-lg font-semibold text-white disabled:opacity-50"
          >
            Verify OTP
          </button>

          <p className="text-center text-sm text-gray-500">
            Didn&apos;t receive OTP? Contact billing team
          </p>
        </div>
      </div>
    )
  }

  // review / submitting
  const coding = context.coding_result
  const diagnoses = coding?.diagnoses ?? []
  const procedures = coding?.procedures ?? []
  const submitting = stage === 'submitting'

  return (
    <div className="min-h-screen w-full bg-white px-4 py-8">
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-6">
        <Logo />
        {DEV_MODE && (
          <div className="rounded-lg border border-[#1E6BFF]/30 bg-[#EAF2FF] px-3 py-2 text-center text-sm text-[#1E6BFF]">
            DEV MODE — OTP bypassed (123456)
          </div>
        )}

        <ClaimContextHeader claimContext={context.claim_context} />

        <div className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4">
          <h2 className="text-xl font-bold text-gray-900">Review Diagnosis &amp; Procedure Codes</h2>

          {!coding && (
            <p className="text-base text-gray-600">Coding has been reviewed by our AI system</p>
          )}

          {diagnoses.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-semibold text-gray-900">Diagnoses</h3>
              {diagnoses.map((d, i) => (
                <div key={`${d.code}-${i}`} className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-base font-semibold text-gray-900">{d.code}</span>
                    <TypeBadge type={d.diagnosis_type} />
                  </div>
                  {d.description && <p className="text-sm text-gray-600">{d.description}</p>}
                  <ConfidenceBar confidence={d.calibrated_confidence} />
                </div>
              ))}
            </div>
          )}

          {procedures.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-semibold text-gray-900">Procedures</h3>
              {procedures.map((p, i) => (
                <div key={`${p.code}-${i}`} className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-base font-semibold text-gray-900">{p.code}</span>
                    {p.units !== undefined && p.units !== null && (
                      <span className="text-xs font-semibold text-gray-500">
                        {p.units} {p.units === 1 ? 'unit' : 'units'}
                      </span>
                    )}
                  </div>
                  {p.description && <p className="text-sm text-gray-600">{p.description}</p>}
                  <ConfidenceBar confidence={p.calibrated_confidence} />
                </div>
              ))}
            </div>
          )}

          <OverallConfidence confidence={coding?.overall_confidence} />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="clinical-notes" className="text-sm font-medium text-gray-900">
              Clinical notes or corrections (optional)
            </label>
            <textarea
              id="clinical-notes"
              rows={3}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-base text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
          </div>
        </div>

        <RiskWarningsSection riskWarnings={context.risk_warnings} />

        <div className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4">
          <h2 className="text-xl font-bold text-gray-900">Your Decision</h2>
          <p className="text-base text-gray-700">Do you approve the coding for this claim?</p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setDecision('approved')}
              className={`min-h-[56px] flex-1 rounded-lg border text-lg font-semibold ${
                decision === 'approved'
                  ? 'border-green-600 bg-green-600 text-white'
                  : 'border-green-600 bg-white text-green-700'
              }`}
            >
              ✅ Approve
            </button>
            <button
              type="button"
              onClick={() => setDecision('rejected')}
              className={`min-h-[56px] flex-1 rounded-lg border text-lg font-semibold ${
                decision === 'rejected'
                  ? 'border-red-600 bg-red-600 text-white'
                  : 'border-red-600 bg-white text-red-700'
              }`}
            >
              ❌ Reject
            </button>
          </div>

          {decision === 'rejected' && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reject-reason" className="text-sm font-medium text-gray-900">
                Please describe the issue
              </label>
              <textarea
                id="reject-reason"
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 text-base text-gray-900 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="additional-notes" className="text-sm font-medium text-gray-900">
              Additional notes for billing team (optional)
            </label>
            <textarea
              id="additional-notes"
              rows={3}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-base text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          {submitError && <p className="text-base text-red-600">{submitError}</p>}

          <button
            type="button"
            disabled={
              !decision ||
              submitting ||
              (decision === 'rejected' && !rejectReason.trim())
            }
            onClick={() => decision && submitReview(decision)}
            className="min-h-[48px] w-full rounded-lg bg-blue-600 text-lg font-semibold text-white disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}
