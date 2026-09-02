"use client"

import * as React from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertCircle, Check, Copy, Download, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorState } from '@/components/api-states'
import { CopyableId } from '@/components/copyable-id'
import { LetterText } from '@/components/letter-text'
import { StatusBadge, winProbabilityColor, readinessColor } from '@/components/status-badge'
import {
  api,
  ApiError,
  type Claim,
  type CodingResult,
  type AdjudicationResult,
  type DenialIntelResult,
  type PreEncounterResult,
  type FinancialSplit,
  type PayerPersonaScrubResult,
} from '@/lib/api'
import { apiFetch } from '@/lib/auth'
import { resolveCarrierName, useCarrierDirectory } from '@/lib/carriers'
import { cn, formatINRFull } from '@/lib/utils'

interface ClaimDetailData {
  claim: Claim | null
  coding: CodingResult | null
  adjudication: AdjudicationResult | null
  denialIntel: DenialIntelResult | null
  preEncounter: PreEncounterResult | null
}

async function safeFetch<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn()
  } catch {
    return null
  }
}

export function ClaimDetailClient({ claimId }: { claimId: string }) {
  const carrierDirectory = useCarrierDirectory()
  const [data, setData] = React.useState<ClaimDetailData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      safeFetch(() => api.getClaim(claimId)),
      safeFetch(() => api.getCodingResult(claimId)),
      safeFetch(() => api.getAdjudication(claimId)),
      safeFetch(() => api.getDenialIntel(claimId)),
      safeFetch(() => api.getPreEncounter(claimId)),
    ])
      .then(([claim, coding, adjudication, denialIntel, preEncounter]) => {
        setData({ claim, coding, adjudication, denialIntel, preEncounter })
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [claimId])

  React.useEffect(() => {
    load()
  }, [load])

  const handleDownloadReport = async () => {
    const res = await apiFetch(`/reports/${claimId}/download`)
    const html = await res.text()
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }

  if (loading) return <DetailSkeleton />
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!data) return null

  const { claim, coding, adjudication, denialIntel, preEncounter } = data
  const carrierId = claim?.payer_id ?? adjudication?.carrier_id ?? null
  const icdCodes = coding?.result?.diagnoses?.map((d) => d.code) ?? []
  const cptCodes = coding?.result?.procedures?.map((p) => p.code) ?? []
  const showRiskCheck = claim?.status === 'ready' || claim?.status === 'submitted'
  const status = adjudication?.status ?? 'pending'
  const readiness = coding?.result?.overall_confidence
    ? Math.round(coding.result.overall_confidence * 100)
    : null

  const stages = [
    { label: 'Pre-Encounter', done: !!preEncounter },
    { label: 'Coding', done: !!coding },
    { label: 'Adjudication', done: !!adjudication },
    { label: 'Denial Intel', done: !!denialIntel },
  ]

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/claims"
        className="flex w-fit items-center gap-1.5 text-sm text-[#5C5C6B] hover:text-[#0A0A0F]"
      >
        <ArrowLeft className="size-3.5" />
        Back to Claims
      </Link>

      {/* Section 1: Header */}
      <Card className="border-[#E4E4EF]">
        <CardContent className="flex flex-col gap-4 py-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CopyableId value={claimId} className="text-sm" />
              <StatusBadge status={status} />
            </div>
            <div className="flex items-center gap-4 text-sm text-[#5C5C6B]">
              {readiness != null && (
                <span>
                  Readiness:{' '}
                  <span className={cn('font-semibold', readinessColor(readiness))}>
                    {readiness}
                  </span>
                </span>
              )}
              <Button size="sm" variant="outline" onClick={handleDownloadReport}>
                <Download className="size-3.5" />
                Download Report
              </Button>
            </div>
          </div>

          {/* Pipeline progress */}
          <div className="flex items-center">
            {stages.map((stage, i) => (
              <React.Fragment key={stage.label}>
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      'flex size-7 items-center justify-center rounded-full border-2 text-xs font-semibold',
                      stage.done
                        ? 'border-[#1E6BFF] bg-[#1E6BFF] text-white'
                        : 'border-[#E4E4EF] bg-white text-[#5C5C6B]'
                    )}
                  >
                    {stage.done ? <Check className="size-3.5" /> : i + 1}
                  </div>
                  <span className="text-xs text-[#5C5C6B]">{stage.label}</span>
                </div>
                {i < stages.length - 1 && (
                  <div
                    className={cn(
                      'mx-2 mb-4 h-0.5 flex-1',
                      stage.done ? 'bg-[#1E6BFF]' : 'bg-[#E4E4EF]'
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Section 2: Coding */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#0A0A0F]">Coding Results</h2>
          {coding && (
            <div className="flex items-center gap-2">
              <Badge className="bg-[#EAF2FF] text-[#1E6BFF]">
                {Math.round(coding.result.overall_confidence * 100)}% confidence
              </Badge>
              {coding.tokens_used ? (
                <span className="text-xs text-[#5C5C6B]">
                  {coding.tokens_used.toLocaleString('en-IN')} tokens
                </span>
              ) : null}
            </div>
          )}
        </div>
        {!coding ? (
          <p className="text-sm text-[#5C5C6B]">Not applicable</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <CodingTable
              title="Diagnoses"
              rows={coding.result.diagnoses.map((d) => ({
                code: d.code,
                description: d.description,
                meta: d.diagnosis_type ?? '—',
                confidence: d.confidence,
              }))}
            />
            <CodingTable
              title="Procedures"
              rows={coding.result.procedures.map((p) => ({
                code: p.code,
                description: p.description,
                meta: p.units != null ? `${p.units} unit(s)` : '—',
                confidence: p.confidence,
              }))}
            />
          </div>
        )}
      </section>

      <Separator />

      {/* Pre-Submission Risk Check */}
      {showRiskCheck && (
        <>
          <PayerPersonaRiskCard
            claimId={claimId}
            carrierId={carrierId}
            icdCodes={icdCodes}
            cptCodes={cptCodes}
          />
          <Separator />
        </>
      )}

      {/* Section 3: Adjudication */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-[#0A0A0F]">Policy Adjudication</h2>
          {adjudication && <StatusBadge status={adjudication.status} />}
        </div>
        {!adjudication ? (
          <p className="text-sm text-[#5C5C6B]">Not applicable</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatBox label="Total Billed" value={formatINRFull(adjudication.summary.total_billed_inr)} />
              <StatBox
                label="Total Approved"
                value={formatINRFull(adjudication.summary.total_approved_inr)}
                valueClass="text-[#16A34A]"
              />
              <StatBox
                label="Deducted"
                value={formatINRFull(adjudication.summary.total_deducted_inr)}
                valueClass="text-[#DC2626]"
              />
              <StatBox label="Copay" value={formatINRFull(adjudication.summary.copay_amount_inr)} />
            </div>
            <p className="text-sm text-[#5C5C6B]">
              {resolveCarrierName(carrierDirectory, adjudication.carrier_id)}
              {adjudication.plan_name ? ` · ${adjudication.plan_name}` : ''}
            </p>
            <div className="overflow-x-auto rounded-lg border border-[#E4E4EF] bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Billed</TableHead>
                    <TableHead>Approved</TableHead>
                    <TableHead>Deduction Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adjudication.line_items.map((item, i) => {
                    const deducted = item.approved_inr < item.billed_inr
                    return (
                      <TableRow key={i} className={deducted ? 'bg-red-50' : undefined}>
                        <TableCell className="text-sm">{item.description}</TableCell>
                        <TableCell className="text-sm">{formatINRFull(item.billed_inr)}</TableCell>
                        <TableCell
                          className={cn(
                            'text-sm font-medium',
                            deducted ? 'text-[#DC2626]' : 'text-[#16A34A]'
                          )}
                        >
                          {formatINRFull(item.approved_inr)}
                        </TableCell>
                        <TableCell className="text-sm text-[#5C5C6B]">
                          {item.deduction_reason || '—'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </section>

      <Separator />

      {/* Pre-Discharge Collection */}
      <FinancialSplitCard claimId={claimId} />

      <Separator />

      {/* Section 4: Denial Intel */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-[#0A0A0F]">Denial Intelligence</h2>
        {!denialIntel ? (
          <p className="text-sm text-[#5C5C6B]">Not applicable</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-[#5C5C6B]">Win Probability</span>
                <span
                  className={cn(
                    'text-3xl font-bold',
                    winProbabilityColor(denialIntel.overall_win_probability * 100)
                  )}
                >
                  {Math.round(denialIntel.overall_win_probability * 100)}%
                </span>
              </div>
              <Badge className={denialIntel.appeal_recommended ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#E4E4EF] text-[#5C5C6B]'}>
                {denialIntel.appeal_recommended ? 'Appeal Recommended' : 'Appeal Not Recommended'}
              </Badge>
            </div>
            {denialIntel.denial_categories?.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {denialIntel.denial_categories.map((cat, i) => (
                  <Card key={i} className="border-[#E4E4EF]">
                    <CardContent className="flex flex-col gap-1 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#0A0A0F]">{cat.label}</span>
                        <Badge variant="outline">
                          {Math.round(cat.win_probability * 100)}% win
                        </Badge>
                      </div>
                      {cat.description && <span className="text-xs text-[#5C5C6B]">{cat.description}</span>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {denialIntel.appeal_letter && (
              <LetterBlock title="Appeal Letter" text={denialIntel.appeal_letter} />
            )}
          </div>
        )}
      </section>

      <Separator />

      {/* Section 5: Pre-Encounter */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-[#0A0A0F]">Pre-Encounter</h2>
          {preEncounter && <StatusBadge status={preEncounter.clearance_status} />}
        </div>
        {!preEncounter ? (
          <p className="text-sm text-[#5C5C6B]">Not applicable</p>
        ) : (
          <div className="flex flex-col gap-4">
            {preEncounter.flags?.length > 0 && (
              <div className="flex flex-col gap-2">
                {preEncounter.flags.map((flag, i) => (
                  <div
                    key={i}
                    className={cn(
                      'rounded-lg border-l-4 bg-white p-3',
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
            {preEncounter.pre_auth_required && preEncounter.pre_auth_letter && (
              <LetterBlock title="Pre-Authorisation Letter" text={preEncounter.pre_auth_letter} />
            )}
          </div>
        )}
      </section>
    </div>
  )
}

function CodingTable({
  title,
  rows,
}: {
  title: string
  rows: { code: string; description: string; meta: string; confidence: number }[]
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[#E4E4EF] bg-white">
      <div className="border-b border-[#E4E4EF] px-3 py-2 text-sm font-semibold text-[#0A0A0F]">
        {title}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Type/Units</TableHead>
            <TableHead>Confidence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-sm text-[#5C5C6B]">
                None
              </TableCell>
            </TableRow>
          )}
          {rows.map((row, i) => (
            <TableRow key={i}>
              <TableCell className="font-mono text-sm font-bold">{row.code}</TableCell>
              <TableCell className="text-sm">{row.description}</TableCell>
              <TableCell className="text-sm text-[#5C5C6B]">{row.meta}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#E4E4EF]">
                    <div
                      className="h-full bg-[#1E6BFF]"
                      style={{ width: `${Math.round(row.confidence * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#5C5C6B]">
                    {Math.round(row.confidence * 100)}%
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function PayerPersonaRiskCard({
  claimId,
  carrierId,
  icdCodes,
  cptCodes,
}: {
  claimId: string
  carrierId: string | null
  icdCodes: string[]
  cptCodes: string[]
}) {
  const [result, setResult] = React.useState<PayerPersonaScrubResult | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!carrierId || (icdCodes.length === 0 && cptCodes.length === 0)) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    api
      .scrubPayerPersona({ claim_id: claimId, carrier_id: carrierId, icd_codes: icdCodes, cpt_codes: cptCodes })
      .then(setResult)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
    // icdCodes/cptCodes are re-derived each render from stable data — compare by content, not identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claimId, carrierId, icdCodes.join(','), cptCodes.join(',')])

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-[#0A0A0F]">Pre-Submission Risk Check</h2>
      {loading ? (
        <Skeleton className="h-32 rounded-lg" />
      ) : error ? (
        <ErrorState message={error} />
      ) : !result ? (
        <p className="text-sm text-[#5C5C6B]">Not applicable</p>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#0A0A0F]">Pre-Submission Risk</span>
            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-sm font-bold',
                result.overall_risk_score > 0.65
                  ? 'bg-[#FEE2E2] text-[#DC2626]'
                  : result.overall_risk_score >= 0.35
                  ? 'bg-[#FEF3C7] text-[#D97706]'
                  : 'bg-[#DCFCE7] text-[#16A34A]'
              )}
            >
              {Math.round(result.overall_risk_score * 100)}%
            </span>
          </div>
          {result.message && <p className="text-sm text-[#5C5C6B]">{result.message}</p>}
          {result.persona_matches === 0 ? (
            <div className="rounded-lg border border-[#E4E4EF] bg-[#F7F8FA] p-3 text-sm text-[#5C5C6B]">
              No historical data for this carrier/code combination yet
            </div>
          ) : (
            result.warnings?.length > 0 && (
              <div className="flex flex-col gap-2">
                {result.warnings.map((w, i) => (
                  <div key={i} className="rounded-lg border border-[#E4E4EF] bg-white p-3">
                    <div className="flex items-center gap-2">
                      <Badge className={w.severity === 'high' ? 'bg-[#FEE2E2] text-[#DC2626]' : 'bg-[#FEF3C7] text-[#D97706]'}>
                        {w.severity === 'high' ? 'HIGH' : 'MEDIUM'}
                      </Badge>
                      <span className="text-sm text-[#0A0A0F]">{w.message}</span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-[#0A0A0F]">{w.action}</p>
                    {w.required_docs?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {w.required_docs.map((doc, j) => (
                          <span
                            key={j}
                            className="rounded-full bg-[#E4E4EF] px-2 py-0.5 text-xs text-[#5C5C6B]"
                          >
                            {doc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </section>
  )
}

function FinancialSplitCard({ claimId }: { claimId: string }) {
  const [split, setSplit] = React.useState<FinancialSplit | null>(null)
  const [notFound, setNotFound] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)

  const load = React.useCallback(() => {
    setLoading(true)
    setNotFound(false)
    setError(null)
    api
      .getClaimSplit(claimId)
      .then(setSplit)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 404) {
          setNotFound(true)
        } else {
          setError(e.message)
        }
      })
      .finally(() => setLoading(false))
  }, [claimId])

  React.useEffect(() => {
    load()
  }, [load])

  function copyMessage() {
    if (!split) return
    navigator.clipboard.writeText(split.front_desk_message)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-[#0A0A0F]">Pre-Discharge Collection</h2>
      {loading ? (
        <Skeleton className="h-48 rounded-lg" />
      ) : notFound ? (
        <p className="text-sm text-[#5C5C6B]">Financial split not available — run adjudication first</p>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !split ? null : (
        <div className="flex flex-col gap-4">
          {split.requires_manager_review && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>Manager review required</AlertTitle>
              <AlertDescription>Patient liability exceeds 20% of total bill</AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatBox label="Total Billed" value={formatINRFull(split.total_billed_inr)} />
            <StatBox
              label="Insurer Pays"
              value={formatINRFull(split.insurer_pays_inr)}
              valueClass="text-[#16A34A]"
            />
            <StatBox
              label="Collect from Patient"
              value={formatINRFull(split.patient_pays_inr)}
              valueClass={
                split.requires_manager_review
                  ? 'text-[#DC2626]'
                  : split.patient_pays_inr > 0
                  ? 'text-[#D97706]'
                  : undefined
              }
            />
          </div>
          {split.deduction_breakdown?.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {split.deduction_breakdown.map((d, i) => (
                <Card
                  key={i}
                  className={cn(
                    'border-[#E4E4EF] border-l-4',
                    d.collectable_from_patient ? 'border-l-[#16A34A]' : 'border-l-[#E4E4EF]'
                  )}
                >
                  <CardContent className="flex flex-col gap-1 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#0A0A0F]">{d.category}</span>
                      <span className="text-sm font-semibold text-[#0A0A0F]">
                        {formatINRFull(d.amount_inr)}
                      </span>
                    </div>
                    <span className="text-xs text-[#5C5C6B]">{d.reason}</span>
                    {d.items?.length > 0 && (
                      <ul className="mt-1 list-disc pl-4 text-xs text-[#5C5C6B]">
                        {d.items.map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {split.front_desk_message && (
            <div className="flex items-start justify-between gap-3 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] p-3">
              <p className="text-sm text-[#1E40AF]">{split.front_desk_message}</p>
              <Button size="sm" variant="outline" onClick={copyMessage}>
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function StatBox({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="rounded-lg border border-[#E4E4EF] bg-white p-3">
      <span className="text-xs text-[#5C5C6B]">{label}</span>
      <div className={cn('text-lg font-bold text-[#0A0A0F]', valueClass)}>{value}</div>
    </div>
  )
}

function LetterBlock({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = React.useState(false)

  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-lg border border-[#E4E4EF] bg-white">
      <div className="flex items-center justify-between border-b border-[#E4E4EF] px-3 py-2">
        <span className="text-sm font-semibold text-[#0A0A0F]">{title}</span>
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
  )
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-24 rounded-lg" />
      <Skeleton className="h-64 rounded-lg" />
      <Skeleton className="h-64 rounded-lg" />
    </div>
  )
}
