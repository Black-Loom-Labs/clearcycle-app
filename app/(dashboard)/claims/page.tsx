"use client"

import * as React from 'react'
import Link from 'next/link'
import { Search, X, FileText } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ErrorState } from '@/components/api-states'
import { CopyableId } from '@/components/copyable-id'
import { PaginationFooter } from '@/components/pagination-footer'
import { StatusBadge, readinessColor } from '@/components/status-badge'
import { api, type Claim, type AdjudicationResult } from '@/lib/api'
import { resolveCarrierName, useCarrierDirectory } from '@/lib/carriers'
import { useHospital } from '@/lib/hospital-context'
import { formatINR, formatRelativeTime } from '@/lib/utils'
import { DEV_MODE } from '@/lib/config'
import { canUpload, getCurrentRole, type Role } from '@/lib/roles'
import { NewClaimDialog } from './new-claim-dialog'

const PER_PAGE = 25
// The API caps per_page at 100 — used when pulling the full set to search across.
const SEARCH_FETCH_PAGE_SIZE = 100

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'ready', label: 'Ready' },
  { value: 'pending_processing', label: 'Pending' },
  { value: 'review_required', label: 'Review Required' },
  { value: 'pre_encounter', label: 'Pre-Encounter' },
]

export default function ClaimsPage() {
  const { hospitalId } = useHospital()
  const carrierDirectory = useCarrierDirectory()

  // Matches the SSR-safe pattern in the dashboard layout: DEV_MODE is a
  // build-time constant (safe to read immediately), the real role from the
  // token is only available in the browser and is filled in after mount.
  const [role, setRole] = React.useState<Role>(DEV_MODE ? 'admin' : 'read_only')
  React.useEffect(() => {
    setRole(getCurrentRole())
  }, [])

  // Server-paginated results (used when there's no active search).
  const [claims, setClaims] = React.useState<Claim[] | null>(null)
  const [total, setTotal] = React.useState(0)

  // Full-set results (used when there's an active search — the API has no
  // claim-ID search param, so we fetch everything matching the status
  // filter once and paginate/filter the search results locally).
  const [allClaims, setAllClaims] = React.useState<Claim[] | null>(null)

  const [adjudications, setAdjudications] = React.useState<Record<string, AdjudicationResult | null>>({})
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState('all')
  const [searchInput, setSearchInput] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [page, setPage] = React.useState(1)

  const isSearching = search.length > 0

  // Debounce the search box so we don't refetch on every keystroke.
  React.useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  // Reset to page 1 whenever the hospital, status filter, or search changes.
  React.useEffect(() => {
    setPage(1)
  }, [hospitalId, status, search])

  const fetchAllClaims = React.useCallback(async () => {
    const params: Record<string, string> = { page: '1', per_page: String(SEARCH_FETCH_PAGE_SIZE) }
    if (status !== 'all') params.status = status
    const first = await api.getClaims(hospitalId, params)
    let results = first.claims ?? []
    const total = first.total ?? results.length
    let page = 2
    while (results.length < total) {
      const next = await api.getClaims(hospitalId, {
        ...params,
        page: String(page),
      })
      if (!next.claims?.length) break
      results = results.concat(next.claims)
      page += 1
    }
    return results
  }, [hospitalId, status])

  const load = React.useCallback(() => {
    setLoading(true)
    setError(null)
    setAdjudications({})

    if (isSearching) {
      fetchAllClaims()
        .then((results) => {
          const matches = results.filter((c) => c.id.toLowerCase().includes(search.toLowerCase()))
          setAllClaims(matches)
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false))
      return
    }

    const params: Record<string, string> = { page: String(page), per_page: String(PER_PAGE) }
    if (status !== 'all') params.status = status
    api
      .getClaims(hospitalId, params)
      .then((res) => {
        setClaims(res.claims ?? [])
        setTotal(res.total ?? res.claims?.length ?? 0)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [hospitalId, status, page, isSearching, search, fetchAllClaims])

  React.useEffect(() => {
    load()
  }, [load])

  // The slice of claims actually shown on the current page.
  const displayed = React.useMemo(() => {
    if (isSearching) {
      return (allClaims ?? []).slice((page - 1) * PER_PAGE, page * PER_PAGE)
    }
    return claims ?? []
  }, [isSearching, allClaims, claims, page])

  // Fetch adjudication results for whatever's currently displayed.
  React.useEffect(() => {
    displayed.forEach((claim) => {
      if (claim.id in adjudications) return
      api
        .getAdjudication(claim.id)
        .then((adj) => setAdjudications((prev) => ({ ...prev, [claim.id]: adj })))
        .catch(() => setAdjudications((prev) => ({ ...prev, [claim.id]: null })))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayed])

  const searchTotal = allClaims?.length ?? 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-[#5C5C6B]" />
            <Input
              placeholder="Search by claim ID"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-64 pl-8 pr-8"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute top-1/2 right-2.5 z-10 -translate-y-1/2 text-[#5C5C6B] hover:text-[#0A0A0F]"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v ?? 'all')}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Status">
                {(value: string) => STATUS_OPTIONS.find((opt) => opt.value === value)?.label ?? value}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {canUpload(role) && <NewClaimDialog onSubmitted={load} />}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#E4E4EF] bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Readiness</TableHead>
                <TableHead>Carrier</TableHead>
                <TableHead>Total Billed</TableHead>
                <TableHead>Total Approved</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              {!loading && displayed.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className="flex flex-col items-center gap-2 py-12 text-center">
                      <FileText className="size-8 text-[#5C5C6B]" />
                      <p className="text-sm text-[#5C5C6B]">No claims found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                displayed.map((claim) => {
                  const adj = adjudications[claim.id]
                  return (
                    <TableRow key={claim.id}>
                      <TableCell>
                        <CopyableId
                          value={claim.id}
                          displayValue={`${claim.id.slice(0, 8)}…`}
                          className="text-xs"
                        />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={claim.status} />
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${readinessColor(claim.readiness_score ?? 0)}`}>
                          {claim.readiness_score ?? '—'}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-[#5C5C6B]">
                        {adj?.plan_name ?? resolveCarrierName(carrierDirectory, adj?.carrier_id)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {adj ? formatINR(adj.summary.total_billed_inr) : '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {adj ? formatINR(adj.summary.total_approved_inr) : '—'}
                      </TableCell>
                      <TableCell className="text-sm text-[#5C5C6B]">
                        {formatRelativeTime(claim.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          nativeButton={false}
                          render={<Link href={`/claims/${claim.id}`} />}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
          {!loading && (
            <PaginationFooter
              page={page}
              perPage={PER_PAGE}
              count={displayed.length}
              total={isSearching ? searchTotal : total}
              itemLabel={isSearching ? 'matching claims' : 'claims'}
              onPrevious={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => p + 1)}
            />
          )}
        </div>
      )}
    </div>
  )
}
