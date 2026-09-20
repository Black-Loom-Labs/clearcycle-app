"use client"

import * as React from 'react'
import { FileText, Loader2, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ErrorState, EmptyState } from '@/components/api-states'
import { useToast } from '@/components/toast'
import { api, type PayerPersonaProfile, type PayerRiskScore } from '@/lib/api'
import { apiFetch } from '@/lib/auth'
import { CARRIER_SHORT_NAMES, getCarrierName, resolveCarrierName, useCarrierDirectory } from '@/lib/carriers'
import { DEV_MODE } from '@/lib/config'
import { getCurrentRole, type Role } from '@/lib/roles'
import { cn } from '@/lib/utils'

function riskColorFromScore(score: number): { stroke: string; text: string; bg: string } {
  if (score >= 50) return { stroke: '#DC2626', text: '#DC2626', bg: '#FEE2E2' }
  if (score >= 25) return { stroke: '#D97706', text: '#D97706', bg: '#FEF3C7' }
  return { stroke: '#16A34A', text: '#16A34A', bg: '#DCFCE7' }
}

function rejectionRateColor(rate: number): { bar: string; text: string; bg: string } {
  if (rate > 0.65) return { bar: '#DC2626', text: '#DC2626', bg: '#FEE2E2' }
  if (rate >= 0.35) return { bar: '#D97706', text: '#D97706', bg: '#FEF3C7' }
  return { bar: '#16A34A', text: '#16A34A', bg: '#DCFCE7' }
}

/**
 * Cross-references a carrier's denial/common reasons against its own stored
 * policy exclusions to surface reasons the carrier used that its own policy
 * document does not explicitly list.
 */
function getPolicyPracticeGaps(profile: PayerPersonaProfile): string[] {
  const excluded = (profile.policy_excluded_reasons ?? []).map((r) => r.toLowerCase().trim())
  if (excluded.length === 0) return []
  const usedReasons = new Set<string>()
  if (profile.top_rejection_reason) usedReasons.add(profile.top_rejection_reason)
  for (const r of profile.common_reasons ?? []) {
    if (r.reason) usedReasons.add(r.reason)
  }
  return Array.from(usedReasons).filter(
    (reason) => !excluded.some((ex) => reason.toLowerCase().includes(ex) || ex.includes(reason.toLowerCase()))
  )
}

function RiskGauge({ score, colorHex }: { score: number; colorHex: string }) {
  const size = 84
  const stroke = 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, score))
  const offset = circumference * (1 - clamped / 100)
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E4E4EF" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorHex}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-bold text-[#0A0A0F]">{Math.round(score)}</span>
        <span className="text-[10px] text-[#5C5C6B]">/ 100</span>
      </div>
    </div>
  )
}

function CarrierTrend({ recent, prior }: { recent: number; prior: number }) {
  const delta = recent - prior
  if (Math.abs(delta) < 1 || prior === 0) {
    return <span className="text-xs font-medium text-[#5C5C6B]">Flat vs prior 90d</span>
  }
  const pct = (Math.abs(delta) / prior) * 100
  const isUp = delta > 0
  return (
    <span className={cn('flex items-center gap-1 text-xs font-semibold', isUp ? 'text-[#DC2626]' : 'text-[#16A34A]')}>
      {isUp ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
      {pct.toFixed(1)}% vs prior 90d
    </span>
  )
}

function CarrierRiskCard({
  score,
  name,
  expanded,
  onToggle,
}: {
  score: PayerRiskScore
  name: string
  expanded: boolean
  onToggle: () => void
}) {
  const colors = riskColorFromScore(score.risk_score)
  return (
    <Card
      className={cn(
        'cursor-pointer border-[#E4E4EF] transition-colors hover:border-[#C7C7D6]',
        expanded && 'border-2 border-[#0A0A0F]'
      )}
      onClick={onToggle}
    >
      <CardContent className="flex flex-col items-center gap-3 py-5 text-center">
        <span className="text-sm font-semibold text-[#0A0A0F]">{name}</span>
        <RiskGauge score={score.risk_score} colorHex={colors.stroke} />
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          {(score.rejection_rate * 100).toFixed(1)}% rejection rate
        </span>
        <CarrierTrend recent={score.claims_recent_90d} prior={score.claims_prior_90d} />
        {score.avg_deduction_pct !== undefined && (
          <span className="text-xs text-[#5C5C6B]">
            {score.avg_deduction_pct}% of billed value deducted
          </span>
        )}
      </CardContent>
    </Card>
  )
}

function CategoryRow({
  profile,
  onGenerateReport,
  generatingReport,
}: {
  profile: PayerPersonaProfile
  onGenerateReport: () => void
  generatingReport: boolean
}) {
  const gaps = getPolicyPracticeGaps(profile)
  const rate = profile.rejection_rate ?? 0
  const colors = rejectionRateColor(rate)
  return (
    <div className="rounded-lg border border-[#E4E4EF] bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-xs text-[#0A0A0F]">
          {(profile.icd_codes?.join(', ') || '—')} · {(profile.cpt_codes?.join(', ') || '—')}
        </span>
        <span className="text-xs text-[#5C5C6B]">{profile.sample_size ?? 0} claims</span>
      </div>

      <div className="mt-2 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#E4E4EF]">
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.min(100, rate * 100)}%`, backgroundColor: colors.bar }}
          />
        </div>
        <span className="w-14 shrink-0 text-right text-xs font-semibold" style={{ color: colors.text }}>
          {(rate * 100).toFixed(1)}%
        </span>
      </div>

      {profile.top_rejection_reason && (
        <p className="mt-2 text-xs text-[#5C5C6B]">Top reason: {profile.top_rejection_reason}</p>
      )}

      {(profile.required_docs?.length ?? 0) > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {profile.required_docs.map((doc, j) => (
            <span key={j} className="rounded-full bg-[#E4E4EF] px-2 py-0.5 text-xs text-[#5C5C6B]">
              {doc}
            </span>
          ))}
        </div>
      )}

      {gaps.length > 0 && (
        <div className="mt-2 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-2.5">
          <p className="text-xs font-semibold text-[#92400E]">
            Policy vs. Practice Gap: denied for reasons not found in policy wording.
          </p>
          <ul className="mt-1 flex flex-col gap-0.5 pl-4 text-xs text-[#78350F]">
            {gaps.map((reason, j) => (
              <li key={j} className="list-disc">
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-2">
        <Button size="sm" variant="outline" onClick={onGenerateReport} disabled={generatingReport}>
          {generatingReport ? <Loader2 className="size-3.5 animate-spin" /> : <FileText className="size-3.5" />}
          Generate Carrier Report
        </Button>
      </div>
    </div>
  )
}

export default function PayerIntelligencePage() {
  const { showToast } = useToast()
  const carrierDirectory = useCarrierDirectory()
  const [role, setRole] = React.useState<Role>(DEV_MODE ? 'admin' : 'read_only')
  React.useEffect(() => {
    setRole(getCurrentRole())
  }, [])

  const [carrier, setCarrier] = React.useState('all')
  const [profiles, setProfiles] = React.useState<PayerPersonaProfile[] | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [expandedCarrier, setExpandedCarrier] = React.useState<string | null>(null)
  const [rebuilding, setRebuilding] = React.useState(false)
  const [generatingReportFor, setGeneratingReportFor] = React.useState<string | null>(null)
  const [riskScores, setRiskScores] = React.useState<PayerRiskScore[]>([])

  const breakdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    api
      .getPayerRiskScores()
      .then((res) => {
        const scores = Array.isArray(res?.scores) ? res.scores : []
        setRiskScores(scores)
      })
      .catch(() => {})
  }, [])

  const load = React.useCallback(() => {
    setLoading(true)
    setError(null)
    api
      .getPayerPersonaProfiles()
      .then((res) => {
        const profiles = Array.isArray(res?.profiles) ? res.profiles : []
        setProfiles(profiles)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  React.useEffect(() => {
    if (carrier === 'all') {
      setExpandedCarrier(null)
      return
    }
    setExpandedCarrier(carrier)
    requestAnimationFrame(() => {
      breakdownRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [carrier])

  function handleCardClick(carrierId: string) {
    setExpandedCarrier((prev) => (prev === carrierId ? null : carrierId))
    requestAnimationFrame(() => {
      breakdownRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  async function handleRebuild() {
    setRebuilding(true)
    try {
      await api.rebuildPayerPersonaProfiles()
      showToast('Payer profiles rebuilt successfully')
      load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to rebuild profiles')
    } finally {
      setRebuilding(false)
    }
  }

  async function handleGenerateCarrierReport(carrierId: string) {
    setGeneratingReportFor(carrierId)
    try {
      const res = await apiFetch('/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_type: 'carrier_scorecard', carrier_id: carrierId }),
      })
      if (!res.ok) throw new Error('Failed to generate carrier report')
      const { presigned_url } = await res.json()
      window.open(presigned_url, '_blank')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to generate carrier report')
    } finally {
      setGeneratingReportFor(null)
    }
  }

  const rows = profiles ?? []
  const totalProfiles = rows.length
  const highestRiskCarrierId = riskScores[0]?.carrier_id
  const totalClaimsAnalysed = rows.reduce((sum, p) => sum + (p.sample_size ?? 0), 0)

  const visibleScores = carrier === 'all' ? riskScores : riskScores.filter((s) => s.carrier_id === carrier)
  const expandedProfiles = expandedCarrier
    ? rows
        .filter((p) => p.carrier_id === expandedCarrier)
        .slice()
        .sort((a, b) => (b.rejection_rate ?? 0) - (a.rejection_rate ?? 0))
    : []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-[#0A0A0F]">Payer Intelligence</h1>
          <p className="text-sm text-[#5C5C6B]">Historical rejection patterns across carriers</p>
          <p className="mt-1 text-sm text-[#5C5C6B]">
            Use these reports in contract renewal conversations with your TPAs — showing your actual claims
            performance data.
          </p>
        </div>
        {role === 'admin' && (
          <Button size="sm" variant="outline" onClick={handleRebuild} disabled={rebuilding}>
            {rebuilding ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
            Rebuild Profiles
          </Button>
        )}
      </div>

      <Tabs value={carrier} onValueChange={(v) => setCarrier(v ?? 'all')}>
        <TabsList>
          <TabsTrigger value="all">All Carriers</TabsTrigger>
          {Object.keys(CARRIER_SHORT_NAMES).map((id) => (
            <TabsTrigger key={id} value={id}>
              {getCarrierName(id)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <PayerIntelligenceSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No payer intelligence data yet"
          description="Process more claims to build profiles"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border-[#E4E4EF]">
              <CardContent className="flex flex-col gap-1 py-2">
                <span className="text-xs font-medium text-[#5C5C6B]">Total Profiles</span>
                <span className="text-2xl font-bold text-[#0A0A0F]">{totalProfiles}</span>
              </CardContent>
            </Card>
            <Card className="border-[#E4E4EF]">
              <CardContent className="flex flex-col gap-1 py-2">
                <span className="text-xs font-medium text-[#5C5C6B]">Highest Risk Carrier</span>
                <span className="text-2xl font-bold text-[#DC2626]">
                  {highestRiskCarrierId
                    ? resolveCarrierName(carrierDirectory, highestRiskCarrierId)
                    : '—'}
                </span>
              </CardContent>
            </Card>
            <Card className="border-[#E4E4EF]">
              <CardContent className="flex flex-col gap-1 py-2">
                <span className="text-xs font-medium text-[#5C5C6B]">Total Claims Analysed</span>
                <span className="text-2xl font-bold text-[#0A0A0F]">
                  {totalClaimsAnalysed.toLocaleString('en-IN')}
                </span>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {visibleScores.map((score) => (
              <CarrierRiskCard
                key={score.carrier_id}
                score={score}
                name={resolveCarrierName(carrierDirectory, score.carrier_id)}
                expanded={expandedCarrier === score.carrier_id}
                onToggle={() => handleCardClick(score.carrier_id)}
              />
            ))}
          </div>

          {expandedCarrier && (
            <div ref={breakdownRef} className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-[#0A0A0F]">
                {resolveCarrierName(carrierDirectory, expandedCarrier)} — Category Breakdown
              </h2>
              {expandedProfiles.length === 0 ? (
                <p className="text-sm text-[#5C5C6B]">No ICD/CPT profile data for this carrier yet.</p>
              ) : (
                expandedProfiles.map((profile, i) => (
                  <CategoryRow
                    key={i}
                    profile={profile}
                    onGenerateReport={() => handleGenerateCarrierReport(profile.carrier_id)}
                    generatingReport={generatingReportFor === profile.carrier_id}
                  />
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function PayerIntelligenceSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
