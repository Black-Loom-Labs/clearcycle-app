"use client"

import * as React from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { TrendingDown, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState, EmptyState } from '@/components/api-states'
import { collectionRateColor } from '@/components/status-badge'
import { api, type ARDashboardResponse } from '@/lib/api'
import { resolveCarrierShortName, useCarrierDirectory } from '@/lib/carriers'
import { useHospital } from '@/lib/hospital-context'
import { formatINR, formatINRFull } from '@/lib/utils'

// Carrier names can be long — wrap the axis label onto a second line
// (greedy word-wrap, ~14 chars/line) instead of truncating or overlapping.
// A very long single word still gets an ellipsis on the second line so it
// can't overflow past the tick's own slot.
const AXIS_LABEL_LINE_LENGTH = 14

function wrapAxisLabel(value: string): [string, string] {
  const words = value.split(' ')
  let line1 = ''
  let line2 = ''
  for (const word of words) {
    const candidate = line1 ? `${line1} ${word}` : word
    if (line2 === '' && candidate.length <= AXIS_LABEL_LINE_LENGTH) {
      line1 = candidate
    } else {
      line2 = line2 ? `${line2} ${word}` : word
    }
  }
  if (line2.length > AXIS_LABEL_LINE_LENGTH) {
    line2 = `${line2.slice(0, AXIS_LABEL_LINE_LENGTH - 1)}…`
  }
  return [line1, line2]
}

// Recharts clones this element and injects x/y/payload at render time, so
// none of these props are actually provided at the JSX call site below.
function CarrierAxisTick({ x = 0, y = 0, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const [line1, line2] = wrapAxisLabel(payload?.value ?? '')
  return (
    <text x={x} y={y} textAnchor="middle" fontSize={12} fill="#5C5C6B">
      <tspan x={x} dy="0.9em">{line1}</tspan>
      {line2 && <tspan x={x} dy="1.1em">{line2}</tspan>}
    </text>
  )
}

// Recharts colors each tooltip line by its series' bar fill by default —
// "Total Billed" uses the light #E4E4EF bar color, which is unreadable as
// text on a white tooltip. Override just that entry's text color; the bars
// and legend swatches themselves are untouched.
const TOOLTIP_TEXT_COLORS: Record<string, string> = {
  total_billed: '#5C5C6B',
  total_approved: '#1E6BFF',
}

function CarrierTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { dataKey?: string; name?: string; value?: number; color?: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[#E4E4EF] bg-white px-3 py-2 text-xs shadow-md">
      <div className="mb-1 font-medium text-[#0A0A0F]">{label}</div>
      {payload.map((entry) => (
        <div
          key={entry.dataKey}
          style={{ color: TOOLTIP_TEXT_COLORS[entry.dataKey ?? ''] ?? entry.color }}
        >
          {entry.name} : {formatINRFull(Number(entry.value))}
        </div>
      ))}
    </div>
  )
}

const AGING_LABELS: Record<string, string> = {
  '0_30': '0-30',
  '31_60': '31-60',
  '61_90': '61-90',
  '90_plus': '90+',
}

export default function DashboardPage() {
  const { hospitalId } = useHospital()
  const carrierDirectory = useCarrierDirectory()
  const [data, setData] = React.useState<ARDashboardResponse | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(() => {
    setLoading(true)
    setError(null)
    api
      .getARDashboard(hospitalId)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [hospitalId])

  React.useEffect(() => {
    load()
  }, [load])

  if (loading) return <DashboardSkeleton />
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!data) return <EmptyState title="No dashboard data" />

  const { summary, carrier_breakdown, aging_buckets, leakage, pipeline_velocity, denial_patterns } = data
  const collectionRate = summary.collection_rate_pct ?? 0

  const carriers = (carrier_breakdown ?? []).map((c) => ({
    carrier: resolveCarrierShortName(carrierDirectory, c.carrier_id),
    total_billed: c.total_billed_inr,
    total_approved: c.total_approved_inr,
  }))

  const agingOrder = ['0_30', '31_60', '61_90', '90_plus']
  const agingBuckets = agingOrder
    .filter((key) => aging_buckets?.[key])
    .map((key) => ({
      bucket: AGING_LABELS[key] ?? key,
      count: aging_buckets[key].count,
    }))

  const leakageBreakdown = leakage
    ? [
        {
          label: 'NME Deductions',
          amount: leakage.breakdown.nme_deductions_inr,
          description: 'Non-medical expenses not payable under policy',
        },
        {
          label: 'Proportional Deductions',
          amount: leakage.breakdown.proportional_deductions_inr,
          description: 'Room-rent linked proportional cuts',
        },
        {
          label: 'Rejected Claims',
          amount: leakage.rejected_claims?.total_billed_inr ?? 0,
          description: `${leakage.rejected_claims?.count ?? 0} claim(s) fully rejected`,
        },
      ]
    : []

  const improvementFactor = pipeline_velocity?.benchmark?.improvement_factor

  return (
    <div className="flex flex-col gap-6">
      {/* Top stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Claims" value={summary.total_claims?.toLocaleString('en-IN') ?? '0'} />
        <StatCard
          label="Collection Rate"
          value={`${collectionRate.toFixed(1)}%`}
          valueClassName={collectionRateColor(collectionRate)}
        />
        <StatCard label="Total Approved" value={formatINR(summary.financial?.total_approved_inr ?? 0)} />
        <StatCard
          label="Net Leakage"
          value={formatINR(summary.financial?.net_leakage_inr ?? 0)}
          valueClassName="text-[#DC2626]"
        />
      </div>

      {/* Adjudication breakdown */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdjudicationCard
          label="Fully Approved"
          count={summary.adjudication_breakdown?.fully_approved ?? 0}
          badgeClass="bg-[#DCFCE7] text-[#16A34A]"
        />
        <AdjudicationCard
          label="Partial"
          count={summary.adjudication_breakdown?.partial ?? 0}
          badgeClass="bg-[#FEF3C7] text-[#D97706]"
        />
        <AdjudicationCard
          label="Rejected"
          count={summary.adjudication_breakdown?.rejected ?? 0}
          badgeClass="bg-[#FEE2E2] text-[#DC2626]"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-[#E4E4EF]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#0A0A0F]">
              Collection by Carrier
            </CardTitle>
          </CardHeader>
          <CardContent>
            {carriers.length === 0 ? (
              <EmptyState title="No carrier data" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={carriers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E4EF" />
                  <XAxis dataKey="carrier" interval={0} height={46} tick={<CarrierAxisTick />} />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#5C5C6B' }}
                    tickFormatter={(value) => formatINR(Number(value))}
                    width={64}
                  />
                  <Tooltip content={<CarrierTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="total_billed" name="Total Billed" fill="#E4E4EF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total_approved" name="Total Approved" fill="#1E6BFF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#E4E4EF]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#0A0A0F]">Aging Buckets</CardTitle>
          </CardHeader>
          <CardContent>
            {agingBuckets.length === 0 ? (
              <EmptyState title="No aging data" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={agingBuckets}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E4EF" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 12, fill: '#5C5C6B' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#5C5C6B' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#E4E4EF', fontSize: 12 }} />
                  <Bar dataKey="count" name="Claims" radius={[4, 4, 0, 0]}>
                    {agingBuckets.map((b, i) => (
                      <Cell key={i} fill={b.bucket === '90+' ? '#DC2626' : '#1E6BFF'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Velocity + Leakage */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-[#E4E4EF]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[#0A0A0F]">
              <Zap className="size-4 text-[#1E6BFF]" />
              Pipeline Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {improvementFactor ? (
              <div className="flex flex-col gap-1">
                {improvementFactor <= 100 ? (
                  <>
                    <span className="text-3xl font-bold text-[#1E6BFF]">
                      {improvementFactor.toLocaleString('en-IN')}× faster
                    </span>
                    <span className="text-sm text-[#5C5C6B]">than manual processing</span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-[#1E6BFF]">
                      {pipeline_velocity.avg_processing_display}
                    </span>
                    <span className="text-sm text-[#5C5C6B]">
                      vs {pipeline_velocity.benchmark.manual_processing_days} manually
                    </span>
                  </>
                )}
                <div className="mt-3 flex justify-between text-sm text-[#5C5C6B]">
                  <span>Avg processing time: {pipeline_velocity.avg_processing_display}</span>
                  <span>Manual benchmark: {pipeline_velocity.benchmark.manual_processing_days}</span>
                </div>
              </div>
            ) : (
              <EmptyState title="No velocity data" />
            )}
          </CardContent>
        </Card>

        <Card className="border-[#E4E4EF]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[#0A0A0F]">
              <TrendingDown className="size-4 text-[#DC2626]" />
              Leakage Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leakageBreakdown.length === 0 ? (
              <EmptyState title="No leakage data" />
            ) : (
              <div className="flex flex-col divide-y divide-[#E4E4EF]">
                {leakageBreakdown.map((row, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[#0A0A0F]">{row.label}</span>
                      <span className="text-xs text-[#5C5C6B]">{row.description}</span>
                    </div>
                    <span className="text-sm font-semibold text-[#DC2626]">
                      {formatINR(row.amount)}
                    </span>
                  </div>
                ))}
                {denial_patterns?.nme_deductions?.total_inr != null && (
                  <div className="flex items-center justify-between pt-2.5">
                    <span className="text-xs text-[#5C5C6B]">
                      Includes {denial_patterns.total_denial_intel_claims} claim(s) with denial intel
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <Card className="border-[#E4E4EF]">
      <CardContent className="flex flex-col gap-1 py-2">
        <span className="text-xs font-medium text-[#5C5C6B]">{label}</span>
        <span className={`text-2xl font-bold text-[#0A0A0F] ${valueClassName ?? ''}`}>{value}</span>
      </CardContent>
    </Card>
  )
}

function AdjudicationCard({
  label,
  count,
  badgeClass,
}: {
  label: string
  count: number
  badgeClass: string
}) {
  return (
    <Card className="border-[#E4E4EF]">
      <CardContent className="flex items-center justify-between py-2">
        <span className="text-sm font-medium text-[#5C5C6B]">{label}</span>
        <span className={`rounded-full px-2.5 py-1 text-sm font-bold ${badgeClass}`}>{count}</span>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-lg" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
    </div>
  )
}
