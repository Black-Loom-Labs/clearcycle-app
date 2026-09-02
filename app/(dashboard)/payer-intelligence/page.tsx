"use client"

import * as React from 'react'
import { ChevronDown, ChevronRight, Loader2, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ErrorState, EmptyState } from '@/components/api-states'
import { useToast } from '@/components/toast'
import { api, type PayerPersonaProfile } from '@/lib/api'
import { CARRIER_SHORT_NAMES, getCarrierName, resolveCarrierName, useCarrierDirectory } from '@/lib/carriers'
import { DEV_MODE } from '@/lib/config'
import { getCurrentRole, type Role } from '@/lib/roles'
import { cn } from '@/lib/utils'

function rejectionRateColor(rate: number): string {
  if (rate > 0.65) return 'bg-[#FEE2E2] text-[#DC2626]'
  if (rate >= 0.35) return 'bg-[#FEF3C7] text-[#D97706]'
  return 'bg-[#DCFCE7] text-[#16A34A]'
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
  const [expanded, setExpanded] = React.useState<number | null>(null)
  const [rebuilding, setRebuilding] = React.useState(false)

  const load = React.useCallback(() => {
    setLoading(true)
    setError(null)
    api
      .getPayerPersonaProfiles(carrier === 'all' ? undefined : carrier)
      .then((res) => {
        const profiles = Array.isArray(res?.profiles) ? res.profiles : []
        setProfiles(profiles)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [carrier])

  React.useEffect(() => {
    load()
  }, [load])

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

  const rows = profiles ?? []
  const totalProfiles = rows.length
  const highestRiskProfile = rows.reduce<PayerPersonaProfile | null>((max, p) => {
    if (!max || (p.rejection_rate ?? 0) > (max.rejection_rate ?? 0)) return p
    return max
  }, null)
  const totalClaimsAnalysed = rows.reduce((sum, p) => sum + (p.sample_size ?? 0), 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-[#0A0A0F]">Payer Intelligence</h1>
          <p className="text-sm text-[#5C5C6B]">Historical rejection patterns across carriers</p>
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
                  {highestRiskProfile
                    ? resolveCarrierName(carrierDirectory, highestRiskProfile.carrier_id)
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

          <div className="overflow-x-auto rounded-lg border border-[#E4E4EF] bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-6" />
                  <TableHead>Carrier</TableHead>
                  <TableHead>ICD Codes</TableHead>
                  <TableHead>CPT Codes</TableHead>
                  <TableHead>Rejection Rate</TableHead>
                  <TableHead>Sample Size</TableHead>
                  <TableHead>Top Rejection Reason</TableHead>
                  <TableHead>Required Docs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((profile, i) => {
                  const isExpanded = expanded === i
                  return (
                    <React.Fragment key={i}>
                      <TableRow
                        className="cursor-pointer"
                        onClick={() => setExpanded(isExpanded ? null : i)}
                      >
                        <TableCell>
                          {isExpanded ? (
                            <ChevronDown className="size-4 text-[#5C5C6B]" />
                          ) : (
                            <ChevronRight className="size-4 text-[#5C5C6B]" />
                          )}
                        </TableCell>
                        <TableCell className="text-sm font-medium text-[#0A0A0F]">
                          {getCarrierName(profile.carrier_id)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {profile.icd_codes?.join(', ') || '—'}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {profile.cpt_codes?.join(', ') || '—'}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                              rejectionRateColor(profile.rejection_rate ?? 0)
                            )}
                          >
                            {((profile.rejection_rate ?? 0) * 100).toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">{profile.sample_size ?? 0}</TableCell>
                        <TableCell className="text-sm text-[#5C5C6B]">
                          {profile.top_rejection_reason || '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(profile.required_docs ?? []).map((doc, j) => (
                              <span
                                key={j}
                                className="rounded-full bg-[#E4E4EF] px-2 py-0.5 text-xs text-[#5C5C6B]"
                              >
                                {doc}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={8} className="bg-[#F7F8FA]">
                            {profile.common_reasons?.length > 0 ? (
                              <ol className="flex flex-col gap-1.5 py-1 pl-4 text-sm">
                                {profile.common_reasons
                                  .slice()
                                  .sort((a, b) => b.frequency - a.frequency)
                                  .map((reason, j) => (
                                    <li key={j} className="flex items-center justify-between gap-4">
                                      <span className="text-[#0A0A0F]">
                                        {j + 1}. {reason.reason}
                                      </span>
                                      <span className="font-semibold text-[#5C5C6B]">
                                        {(reason.frequency * 100).toFixed(0)}%
                                      </span>
                                    </li>
                                  ))}
                              </ol>
                            ) : (
                              <p className="py-1 text-sm text-[#5C5C6B]">No detailed reasons available</p>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </div>
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
      <Skeleton className="h-64 rounded-lg" />
    </div>
  )
}
