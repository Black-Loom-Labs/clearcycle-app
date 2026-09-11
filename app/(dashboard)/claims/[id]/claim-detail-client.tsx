"use client"

import * as React from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertCircle, Check, Copy, Download, RefreshCw, ShieldAlert, Stethoscope, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
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
import { useToast } from '@/components/toast'
import { StatusBadge, winProbabilityColor, readinessColor } from '@/components/status-badge'
import {
  api,
  type Claim,
  type CodingResult,
  type AdjudicationResult,
  type DenialIntelResult,
  type PreEncounterResult,
  type FinancialSplit,
  type PayerPersonaScrubResult,
  type Doctor,
  type WorkflowResult,
  type WorkflowBillingEdit,
} from '@/lib/api'
import { apiFetch } from '@/lib/auth'
import { resolveCarrierName, useCarrierDirectory } from '@/lib/carriers'
import { getCurrentRole } from '@/lib/roles'
import { cn, formatINRFull } from '@/lib/utils'

const STATUS_TRANSITIONS: Record<string, string[]> = {
  ready: ['submitted'],
  submitted: ['paid', 'denied'],
  denied: ['appealed'],
  appealed: ['paid', 'denied'],
}

interface ClaimDetailData {
  claim: Claim | null
  coding: CodingResult | null
  adjudication: AdjudicationResult | null
  denialIntel: DenialIntelResult | null
  preEncounter: PreEncounterResult | null
  workflow: WorkflowResult | null
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
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false)
  const [initiateDialogOpen, setInitiateDialogOpen] = React.useState(false)
  const role = React.useMemo(() => getCurrentRole(), [])
  const canUpdateStatus = role === 'admin' || role === 'billing_staff'
  const canInitiateApproval = role === 'admin' || role === 'billing_staff'
  const canBillingReview = role === 'admin' || role === 'billing_staff'

  const load = React.useCallback(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      safeFetch(() => api.getClaim(claimId)),
      safeFetch(() => api.getCodingResult(claimId)),
      safeFetch(() => api.getAdjudication(claimId)),
      safeFetch(() => api.getDenialIntel(claimId)),
      safeFetch(() => api.getPreEncounter(claimId)),
      safeFetch(() => api.getWorkflow(claimId)),
    ])
      .then(([claim, coding, adjudication, denialIntel, preEncounter, workflow]) => {
        setData({ claim, coding, adjudication, denialIntel, preEncounter, workflow })
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

  const { claim, coding, adjudication, denialIntel, preEncounter, workflow } = data
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
              {canUpdateStatus && (
                <Button size="sm" variant="outline" onClick={() => setStatusDialogOpen(true)}>
                  <RefreshCw className="size-3.5" />
                  Update Status
                </Button>
              )}
              {canInitiateApproval && claim?.status === 'ready' && (
                <Button size="sm" variant="outline" onClick={() => setInitiateDialogOpen(true)}>
                  <Stethoscope className="size-3.5" />
                  Initiate Approval
                </Button>
              )}
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

      {canUpdateStatus && (
        <UpdateStatusDialog
          claimId={claimId}
          currentStatus={claim?.status ?? status}
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          onUpdated={load}
        />
      )}

      {canInitiateApproval && (
        <InitiateApprovalDialog
          claimId={claimId}
          treatingDoctorName={claim?.treating_doctor_name}
          open={initiateDialogOpen}
          onOpenChange={setInitiateDialogOpen}
          onInitiated={load}
        />
      )}

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

      {canBillingReview && claim?.status === 'pending_approval' && workflow && (
        <>
          <Separator />
          <BillingReviewPanel claimId={claimId} workflow={workflow} onReviewed={load} />
        </>
      )}

      {role === 'admin' && workflow?.status === 'admin_review' && (
        <>
          <Separator />
          {workflow.admin_status === 'pending' ? (
            <AdminApprovalPanel workflow={workflow} onReviewed={load} />
          ) : (
            <AdminApprovalReadOnlySummary workflow={workflow} />
          )}
        </>
      )}

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

function UpdateStatusDialog({
  claimId,
  currentStatus,
  open,
  onOpenChange,
  onUpdated,
}: {
  claimId: string
  currentStatus: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: () => void
}) {
  const { showToast } = useToast()
  const allowedStatuses = STATUS_TRANSITIONS[currentStatus] ?? []
  const [nextStatus, setNextStatus] = React.useState(allowedStatuses[0] ?? '')
  const [notes, setNotes] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setNextStatus((STATUS_TRANSITIONS[currentStatus] ?? [])[0] ?? '')
      setNotes('')
      setError(null)
    }
    // Only reset when the dialog opens — currentStatus/allowedStatuses are re-derived each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentStatus])

  function handleOpenChange(next: boolean) {
    if (!submitting) onOpenChange(next)
  }

  async function handleConfirm() {
    if (!nextStatus) return
    setSubmitting(true)
    setError(null)
    try {
      await api.updateClaimStatus(claimId, { status: nextStatus, notes: notes.trim() || undefined })
      onOpenChange(false)
      showToast(`Claim status updated to ${nextStatus}`)
      onUpdated()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update claim status')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Status</DialogTitle>
          <DialogDescription>
            Current status: <span className="font-semibold text-[#0A0A0F]">{currentStatus}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {allowedStatuses.length === 0 ? (
            <p className="text-sm text-[#5C5C6B]">No status transitions available from this status.</p>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#0A0A0F]">New Status</label>
                <Select value={nextStatus} onValueChange={(v) => setNextStatus(v ?? '')}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{(value: string) => value}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {allowedStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#0A0A0F]">Notes</label>
                <Input
                  placeholder="e.g. Submitted to Star Health portal at 2pm"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </>
          )}

          {error && <ErrorState message={error} />}

          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={submitting || !nextStatus}
              className="bg-[#1E6BFF] hover:bg-[#1E6BFF]/90"
            >
              {submitting ? 'Updating...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InitiateApprovalDialog({
  claimId,
  treatingDoctorName,
  open,
  onOpenChange,
  onInitiated,
}: {
  claimId: string
  treatingDoctorName?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onInitiated: () => void
}) {
  const { showToast } = useToast()
  const autoPopulated = !!treatingDoctorName

  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<Doctor[]>([])
  const [searching, setSearching] = React.useState(false)
  const [searched, setSearched] = React.useState(false)
  const [selectedDoctor, setSelectedDoctor] = React.useState<Doctor | null>(null)
  const [showAddNew, setShowAddNew] = React.useState(false)

  const [name, setName] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [speciality, setSpeciality] = React.useState('')
  const [saveToDirectory, setSaveToDirectory] = React.useState(true)

  const [notes, setNotes] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setQuery(treatingDoctorName ?? '')
      setResults([])
      setSearching(false)
      setSearched(false)
      setSelectedDoctor(null)
      setShowAddNew(false)
      setName(treatingDoctorName ?? '')
      setPhone('')
      setSpeciality('')
      setSaveToDirectory(true)
      setNotes('')
      setError(null)
    }
  }, [open, treatingDoctorName])

  // Debounced directory search as the doctor name is typed/edited.
  React.useEffect(() => {
    if (!open || selectedDoctor) return
    const term = query.trim()
    if (term.length < 2) {
      setResults([])
      setSearched(false)
      return
    }
    setSearching(true)
    const handle = setTimeout(() => {
      api
        .getDoctors(term)
        .then((res) => {
          const list = res.doctors ?? []
          setResults(list)
          setSearched(true)
          // Nothing matched — go straight to the add-new-doctor form.
          if (list.length === 0) setShowAddNew(true)
        })
        .catch(() => {
          setResults([])
          setSearched(true)
        })
        .finally(() => setSearching(false))
    }, 300)
    return () => clearTimeout(handle)
  }, [query, open, selectedDoctor])

  function selectDoctor(doctor: Doctor) {
    setSelectedDoctor(doctor)
    setQuery(doctor.name)
    setPhone(doctor.phone)
    setName(doctor.name)
    setSpeciality(doctor.speciality ?? '')
    setResults([])
    setShowAddNew(false)
  }

  function clearSelection() {
    setSelectedDoctor(null)
    setResults([])
    setSearched(false)
  }

  function handleOpenChange(next: boolean) {
    if (!submitting) onOpenChange(next)
  }

  const canSubmit = selectedDoctor
    ? true
    : name.trim().length > 0 && phone.trim().length > 0

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const doctorName = selectedDoctor ? selectedDoctor.name : name.trim()
      await api.initiateWorkflow({
        claim_id: claimId,
        ...(selectedDoctor
          ? { doctor_id: selectedDoctor.id }
          : {
              doctor_name: name.trim(),
              doctor_phone: phone.trim(),
              doctor_speciality: speciality.trim() || undefined,
              save_doctor_to_directory: saveToDirectory,
            }),
        notes: notes.trim() || undefined,
      })
      onOpenChange(false)
      showToast(`Approval workflow initiated. OTP sent to Dr. ${doctorName}.`)
      onInitiated()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to initiate approval workflow')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Initiate Approval</DialogTitle>
          <DialogDescription>
            Send an OTP-verified approval request to the treating doctor.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {/* Treating Doctor */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#0A0A0F]">Treating Doctor</label>
              {autoPopulated && !selectedDoctor && (
                <Badge className="bg-[#EAFBF0] text-[#16A34A]">
                  ✓ Auto-populated from discharge summary
                </Badge>
              )}
            </div>

            {selectedDoctor ? (
              <div className="flex items-center justify-between rounded-lg border border-[#E4E4EF] bg-[#F7F8FA] px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-[#0A0A0F]">{selectedDoctor.name}</p>
                  <p className="text-xs text-[#5C5C6B]">
                    {selectedDoctor.phone}
                    {selectedDoctor.speciality ? ` · ${selectedDoctor.speciality}` : ''}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={clearSelection}>
                  Change
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#5C5C6B]" />
                <Input
                  className="pl-9"
                  placeholder="Search doctors by name"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {searching && (
                  <p className="mt-1 text-xs text-[#5C5C6B]">Searching directory…</p>
                )}
                {!searching && results.length > 0 && (
                  <div className="mt-1 flex flex-col gap-1 rounded-lg border border-[#E4E4EF] bg-white p-1 shadow-sm">
                    {results.map((doctor) => (
                      <button
                        key={doctor.id}
                        type="button"
                        onClick={() => selectDoctor(doctor)}
                        className="flex flex-col items-start rounded-md px-2.5 py-2 text-left hover:bg-[#F7F8FA]"
                      >
                        <span className="text-sm font-medium text-[#0A0A0F]">{doctor.name}</span>
                        <span className="text-xs text-[#5C5C6B]">
                          {doctor.phone}
                          {doctor.speciality ? ` · ${doctor.speciality}` : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {!searching && searched && results.length === 0 && !showAddNew && (
                  <button
                    type="button"
                    onClick={() => setShowAddNew(true)}
                    className="mt-1 text-sm text-[#1E6BFF] hover:underline"
                  >
                    + Add new doctor
                  </button>
                )}
              </div>
            )}

            {!selectedDoctor && showAddNew && (
              <div className="flex flex-col gap-3 rounded-lg border border-[#E4E4EF] bg-[#F7F8FA] p-3">
                <p className="text-sm font-medium text-[#0A0A0F]">Add new doctor</p>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#0A0A0F]">
                    Name<span className="text-[#DC2626]"> *</span>
                  </label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#0A0A0F]">
                    Phone<span className="text-[#DC2626]"> *</span>
                  </label>
                  <Input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#0A0A0F]">Speciality</label>
                  <Input value={speciality} onChange={(e) => setSpeciality(e.target.value)} />
                </div>
                <label className="flex items-center gap-2 text-sm text-[#0A0A0F]">
                  <input
                    type="checkbox"
                    checked={saveToDirectory}
                    onChange={(e) => setSaveToDirectory(e.target.checked)}
                    className="size-4 rounded border-[#E4E4EF] text-[#1E6BFF]"
                  />
                  Save to directory
                </label>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#0A0A0F]">Notes for reviewers</label>
            <textarea
              rows={3}
              placeholder="Optional notes for the doctor or reviewers"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-[#E4E4EF] bg-white p-2.5 text-sm text-[#0A0A0F] outline-none focus:border-[#1E6BFF] focus:ring-2 focus:ring-[#1E6BFF]/20"
            />
          </div>

          {error && <ErrorState message={error} />}

          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !canSubmit}
              className="bg-[#1E6BFF] hover:bg-[#1E6BFF]/90"
            >
              {submitting ? 'Initiating...' : 'Initiate & Send OTP'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
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
  const [copied, setCopied] = React.useState(false)

  const load = React.useCallback(() => {
    setLoading(true)
    setNotFound(false)
    api
      .getClaimSplit(claimId)
      .then(setSplit)
      .catch(() => {
        // Any non-200 response (404 — split not computed yet, 500 — backend
        // compute failure, or anything else) just means there's no split
        // data to show yet. Degrade to the "not available" state rather
        // than surfacing a generic error.
        setNotFound(true)
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

function BillingReviewPanel({
  claimId,
  workflow,
  onReviewed,
}: {
  claimId: string
  workflow: WorkflowResult
  onReviewed: () => void
}) {
  const { showToast } = useToast()
  const [split, setSplit] = React.useState<FinancialSplit | null>(null)

  const [showAdjustmentForm, setShowAdjustmentForm] = React.useState(false)
  const [adjustments, setAdjustments] = React.useState<WorkflowBillingEdit[]>([])
  const [adjItem, setAdjItem] = React.useState('')
  const [adjOriginal, setAdjOriginal] = React.useState('')
  const [adjRevised, setAdjRevised] = React.useState('')
  const [adjReason, setAdjReason] = React.useState('')

  const [notes, setNotes] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    api
      .getClaimSplit(claimId)
      .then(setSplit)
      .catch(() => setSplit(null))
  }, [claimId])

  const pending = workflow.billing_status === 'pending'

  function addAdjustment() {
    if (!adjItem.trim() || !adjReason.trim()) return
    setAdjustments((prev) => [
      ...prev,
      {
        item: adjItem.trim(),
        original_amount: Number(adjOriginal) || 0,
        revised_amount: Number(adjRevised) || 0,
        reason: adjReason.trim(),
      },
    ])
    setAdjItem('')
    setAdjOriginal('')
    setAdjRevised('')
    setAdjReason('')
    setShowAdjustmentForm(false)
  }

  async function handleDecision(decision: 'approved' | 'rejected') {
    const verb = decision === 'approved' ? 'approve' : 'reject'
    if (!window.confirm(`Are you sure you want to ${verb} this claim review?`)) return
    setSubmitting(true)
    setError(null)
    try {
      await api.submitBillingReview(workflow.id, {
        decision,
        notes: notes.trim(),
        edits: adjustments,
      })
      showToast('Billing review submitted')
      onReviewed()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit billing review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-[#0A0A0F]">Billing Manager Review</h2>
        {pending && <Badge className="bg-[#FEF3C7] text-[#D97706]">Your Review Required</Badge>}
      </div>

      {!pending ? (
        <div className="rounded-lg border border-[#E4E4EF] bg-[#F7F8FA] p-4">
          <p className="text-sm text-[#0A0A0F]">
            You reviewed this claim on{' '}
            {workflow.billing_reviewed_at
              ? new Date(workflow.billing_reviewed_at).toLocaleDateString('en-IN')
              : '—'}
            . Decision:{' '}
            <span className="font-semibold">
              {workflow.billing_status === 'approved' ? 'Approved' : 'Rejected'}
            </span>
            . Notes: {workflow.billing_notes || '—'}
          </p>
          {workflow.billing_edits && workflow.billing_edits.length > 0 && (
            <ul className="mt-2 list-disc pl-4 text-sm text-[#5C5C6B]">
              {workflow.billing_edits.map((edit, i) => (
                <li key={i}>
                  {edit.item}: {formatINRFull(edit.original_amount)} → {formatINRFull(edit.revised_amount)}{' '}
                  ({edit.reason})
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Section 1: Financial Summary */}
          <div className="flex flex-col gap-3 rounded-lg border border-[#E4E4EF] p-4">
            <h3 className="text-sm font-semibold text-[#0A0A0F]">Financial Summary</h3>
            {split ? (
              <>
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
                    valueClass={split.patient_pays_inr > 0 ? 'text-[#D97706]' : undefined}
                  />
                </div>
                {split.deduction_breakdown?.length > 0 && (
                  <ul className="list-disc pl-4 text-sm text-[#5C5C6B]">
                    {split.deduction_breakdown.map((d, i) => (
                      <li key={i}>
                        {d.category}: {formatINRFull(d.amount_inr)} — {d.reason}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p className="text-sm text-[#5C5C6B]">Financial split not available</p>
            )}
          </div>

          {/* Section 2: Adjustments */}
          <div className="flex flex-col gap-3 rounded-lg border border-[#E4E4EF] p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#0A0A0F]">Adjustments (optional)</h3>
              {!showAdjustmentForm && (
                <Button size="sm" variant="outline" onClick={() => setShowAdjustmentForm(true)}>
                  Add adjustment
                </Button>
              )}
            </div>

            {adjustments.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-[#E4E4EF] bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Original</TableHead>
                      <TableHead>Revised</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adjustments.map((adj, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm">{adj.item}</TableCell>
                        <TableCell className="text-sm">{formatINRFull(adj.original_amount)}</TableCell>
                        <TableCell className="text-sm">{formatINRFull(adj.revised_amount)}</TableCell>
                        <TableCell className="text-sm text-[#5C5C6B]">{adj.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {showAdjustmentForm && (
              <div className="flex flex-col gap-3 rounded-lg border border-[#E4E4EF] bg-[#F7F8FA] p-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#0A0A0F]">Item description</label>
                  <Input value={adjItem} onChange={(e) => setAdjItem(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#0A0A0F]">Original amount</label>
                    <Input
                      type="number"
                      value={adjOriginal}
                      onChange={(e) => setAdjOriginal(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#0A0A0F]">Revised amount</label>
                    <Input
                      type="number"
                      value={adjRevised}
                      onChange={(e) => setAdjRevised(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#0A0A0F]">Reason</label>
                  <Input value={adjReason} onChange={(e) => setAdjReason(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={addAdjustment} className="bg-[#1E6BFF] hover:bg-[#1E6BFF]/90">
                    Add
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAdjustmentForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Decision */}
          <div className="flex flex-col gap-3 rounded-lg border border-[#E4E4EF] p-4">
            <h3 className="text-sm font-semibold text-[#0A0A0F]">Decision</h3>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0A0A0F]">
                Notes for admin and doctor (optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-[#E4E4EF] bg-white p-2.5 text-sm text-[#0A0A0F] outline-none focus:border-[#1E6BFF] focus:ring-2 focus:ring-[#1E6BFF]/20"
              />
            </div>

            {error && <ErrorState message={error} />}

            <div className="flex gap-3">
              <Button
                disabled={submitting}
                onClick={() => handleDecision('approved')}
                className="flex-1 bg-[#16A34A] hover:bg-[#16A34A]/90"
              >
                ✅ Approve
              </Button>
              <Button
                disabled={submitting}
                onClick={() => handleDecision('rejected')}
                className="flex-1 bg-[#DC2626] hover:bg-[#DC2626]/90"
              >
                ❌ Send Back for Revision
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function ReviewStatusBadge({ status }: { status?: string }) {
  const approved = status === 'approved'
  return (
    <Badge className={approved ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#DC2626]'}>
      {approved ? 'Approved' : 'Rejected'}
    </Badge>
  )
}

function AdminApprovalPanel({
  workflow,
  onReviewed,
}: {
  workflow: WorkflowResult
  onReviewed: () => void
}) {
  const { showToast } = useToast()
  const [notes, setNotes] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const draft = workflow.consolidated_draft
  const doctorReview = draft?.doctor_review
  const billingReview = draft?.billing_review
  const riskScore = draft?.risk_score
  const riskWarnings = draft?.risk_warnings ?? []
  const requiredDocs = draft?.required_docs ?? []

  async function handleDecision(decision: 'approved' | 'rejected') {
    const verb = decision === 'approved' ? 'approve' : 'reject'
    if (!window.confirm(`Are you sure you want to ${verb} this claim review?`)) return
    setSubmitting(true)
    setError(null)
    try {
      await api.submitAdminReview(workflow.id, { decision, notes: notes.trim() })
      showToast('Admin review submitted')
      onReviewed()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit admin review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-[#0A0A0F]">Admin Final Approval</h2>
        <Badge className="bg-[#FEE2E2] text-[#DC2626]">Action Required</Badge>
      </div>

      <div className="flex flex-col gap-4">
        {/* Section 1: Doctor Review Summary */}
        <div className="flex flex-col gap-2 rounded-lg border border-[#E4E4EF] p-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#0A0A0F]">Doctor Review Summary</h3>
            {doctorReview && <ReviewStatusBadge status={doctorReview.status} />}
          </div>
          {!doctorReview ? (
            <p className="text-sm text-[#5C5C6B]">Not applicable</p>
          ) : (
            <div className="flex flex-col gap-1 text-sm text-[#5C5C6B]">
              <span>
                {doctorReview.doctor_name ?? '—'}
                {doctorReview.reviewed_at
                  ? ` · reviewed ${new Date(doctorReview.reviewed_at).toLocaleString('en-IN')}`
                  : ''}
              </span>
              {doctorReview.notes && <span>Notes: {doctorReview.notes}</span>}
              {doctorReview.coding_edits && doctorReview.coding_edits.length > 0 && (
                <ul className="list-disc pl-4">
                  {doctorReview.coding_edits.map((edit, i) => (
                    <li key={i}>{JSON.stringify(edit)}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Billing Review Summary */}
        <div className="flex flex-col gap-2 rounded-lg border border-[#E4E4EF] p-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#0A0A0F]">Billing Review Summary</h3>
            {billingReview && <ReviewStatusBadge status={billingReview.status} />}
          </div>
          {!billingReview ? (
            <p className="text-sm text-[#5C5C6B]">Not applicable</p>
          ) : (
            <div className="flex flex-col gap-1 text-sm text-[#5C5C6B]">
              {billingReview.reviewed_at && (
                <span>Reviewed {new Date(billingReview.reviewed_at).toLocaleString('en-IN')}</span>
              )}
              {billingReview.notes && <span>Notes: {billingReview.notes}</span>}
              {billingReview.financial_edits && billingReview.financial_edits.length > 0 && (
                <ul className="list-disc pl-4">
                  {billingReview.financial_edits.map((edit, i) => (
                    <li key={i}>
                      {edit.item}: {formatINRFull(edit.original_amount)} → {formatINRFull(edit.revised_amount)}{' '}
                      ({edit.reason})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Section 3: Risk & Required Docs */}
        <div className="flex flex-col gap-2 rounded-lg border border-[#E4E4EF] p-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#0A0A0F]">Risk &amp; Required Docs</h3>
            {riskScore !== undefined && riskScore !== null && (
              <Badge
                className={cn(
                  riskScore > 0.65
                    ? 'bg-[#FEE2E2] text-[#DC2626]'
                    : riskScore >= 0.35
                    ? 'bg-[#FEF3C7] text-[#D97706]'
                    : 'bg-[#DCFCE7] text-[#16A34A]'
                )}
              >
                {Math.round(riskScore * 100)}%
              </Badge>
            )}
          </div>
          {riskWarnings.length > 0 && (
            <div className="flex flex-col gap-2">
              {riskWarnings.map((w, i) => (
                <div key={i} className="rounded-lg border border-[#E4E4EF] bg-white p-3">
                  <div className="flex items-center gap-2">
                    <Badge className={w.severity === 'high' ? 'bg-[#FEE2E2] text-[#DC2626]' : 'bg-[#FEF3C7] text-[#D97706]'}>
                      {w.severity === 'high' ? 'HIGH' : 'MEDIUM'}
                    </Badge>
                    <span className="text-sm text-[#0A0A0F]">{w.message}</span>
                  </div>
                  {w.action && <p className="mt-1 text-sm font-bold text-[#0A0A0F]">{w.action}</p>}
                </div>
              ))}
            </div>
          )}
          {requiredDocs.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {requiredDocs.map((doc, i) => (
                <span key={i} className="rounded-full bg-[#E4E4EF] px-2 py-0.5 text-xs text-[#5C5C6B]">
                  {doc}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Final Decision */}
        <div className="flex flex-col gap-3 rounded-lg border border-[#E4E4EF] p-4">
          <h3 className="text-sm font-semibold text-[#0A0A0F]">Final Decision</h3>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#0A0A0F]">Admin notes (optional)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-[#E4E4EF] bg-white p-2.5 text-sm text-[#0A0A0F] outline-none focus:border-[#1E6BFF] focus:ring-2 focus:ring-[#1E6BFF]/20"
            />
          </div>

          {error && <ErrorState message={error} />}

          <div className="flex gap-3">
            <Button
              disabled={submitting}
              onClick={() => handleDecision('approved')}
              className="min-h-[48px] flex-1 bg-[#16A34A] text-base hover:bg-[#16A34A]/90"
            >
              ✅ Approve &amp; Queue for Submission
            </Button>
            <Button
              disabled={submitting}
              onClick={() => handleDecision('rejected')}
              className="min-h-[48px] flex-1 bg-[#DC2626] text-base hover:bg-[#DC2626]/90"
            >
              ❌ Send Back for Revision
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function AdminApprovalReadOnlySummary({ workflow }: { workflow: WorkflowResult }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-[#0A0A0F]">Admin Final Approval</h2>
      <div className="rounded-lg border border-[#E4E4EF] bg-[#F7F8FA] p-4">
        <p className="text-sm text-[#0A0A0F]">
          Admin {workflow.admin_status === 'approved' ? 'approved' : 'rejected'} on{' '}
          {workflow.admin_reviewed_at
            ? new Date(workflow.admin_reviewed_at).toLocaleDateString('en-IN')
            : '—'}
          . Notes: {workflow.admin_notes || '—'}
        </p>
      </div>
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
