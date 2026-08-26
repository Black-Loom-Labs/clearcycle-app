"use client"

import * as React from 'react'
import { Check, Copy, FileWarning } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ErrorState, EmptyState } from '@/components/api-states'
import { LetterText } from '@/components/letter-text'
import { PaginationFooter } from '@/components/pagination-footer'
import { winProbabilityColor } from '@/components/status-badge'
import { api, type ARDashboardResponse, type DenialsListResponse } from '@/lib/api'
import { useHospital } from '@/lib/hospital-context'
import { formatINR, cn } from '@/lib/utils'

const PER_PAGE = 10

export default function DenialIntelPage() {
  const { hospitalId } = useHospital()
  const [dashboard, setDashboard] = React.useState<ARDashboardResponse | null>(null)
  const [denials, setDenials] = React.useState<DenialsListResponse | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedLetter, setSelectedLetter] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(1)

  const load = React.useCallback(() => {
    setLoading(true)
    setError(null)

    Promise.all([
      api.getARDashboard(hospitalId),
      api.getDenials(hospitalId, { page: String(page), per_page: String(PER_PAGE) }),
    ])
      .then(([dash, denialsRes]) => {
        setDashboard(dash)
        setDenials(denialsRes)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [hospitalId, page])

  React.useEffect(() => {
    load()
  }, [load])

  // Reset to page 1 whenever the hospital changes.
  React.useEffect(() => {
    setPage(1)
  }, [hospitalId])

  if (loading) return <DenialIntelSkeleton />
  if (error) return <ErrorState message={error} onRetry={load} />

  const categories = dashboard?.denial_patterns?.top_denial_categories ?? []
  const rows = denials?.denials ?? []

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-[#0A0A0F]">Denial Patterns</h2>
        {categories.length === 0 ? (
          <EmptyState title="No denial patterns found" />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, i) => (
              <Card key={i} className="border-[#E4E4EF]">
                <CardContent className="flex flex-col gap-2 py-2">
                  <span className="text-sm font-semibold text-[#0A0A0F]">{cat.label}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5C5C6B]">{cat.count} claim(s)</span>
                    <span
                      className={cn(
                        'text-sm font-bold',
                        winProbabilityColor(cat.avg_win_probability * 100)
                      )}
                    >
                      {Math.round(cat.avg_win_probability * 100)}% win rate
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {dashboard?.leakage?.breakdown?.nme_deductions_inr != null && (
          <Card className="border-[#E4E4EF]">
            <CardContent className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-[#5C5C6B]">NME Deductions Total</span>
              <span className="text-lg font-bold text-[#DC2626]">
                {formatINR(dashboard.leakage.breakdown.nme_deductions_inr)}
              </span>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-[#0A0A0F]">Recent Denials</h2>
        {rows.length === 0 && page === 1 ? (
          <EmptyState
            title="No denials found"
            description="Claims with partial or rejected adjudications and denial intelligence will appear here."
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#E4E4EF] bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim ID</TableHead>
                  <TableHead>Denial Category</TableHead>
                  <TableHead>Win Probability</TableHead>
                  <TableHead>Appeal Recommended</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-[#5C5C6B]">
                      No more denials
                    </TableCell>
                  </TableRow>
                )}
                {rows.map(({ claim_id, result }) => (
                  <TableRow key={claim_id}>
                    <TableCell className="font-mono text-xs">{claim_id.slice(0, 8)}…</TableCell>
                    <TableCell className="text-sm">
                      {result.denial_categories?.[0]?.label ?? '—'}
                    </TableCell>
                    <TableCell>
                      <span className={cn('font-semibold', winProbabilityColor(result.overall_win_probability * 100))}>
                        {Math.round(result.overall_win_probability * 100)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={result.appeal_recommended ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#E4E4EF] text-[#5C5C6B]'}>
                        {result.appeal_recommended ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!result.appeal_letter}
                        onClick={() => setSelectedLetter(result.appeal_letter ?? null)}
                      >
                        <FileWarning className="size-3.5" />
                        View Appeal Letter
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <PaginationFooter
              page={page}
              perPage={PER_PAGE}
              count={rows.length}
              itemLabel="denials"
              onPrevious={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => p + 1)}
            />
          </div>
        )}
      </section>

      <Dialog open={!!selectedLetter} onOpenChange={(open) => !open && setSelectedLetter(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Appeal Letter</DialogTitle>
          </DialogHeader>
          {selectedLetter && <AppealLetterBody text={selectedLetter} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AppealLetterBody({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)

  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={copy}>
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <LetterText
        text={text}
        className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-[#E4E4EF] p-4 text-sm text-[#0A0A0F]"
      />
    </div>
  )
}

function DenialIntelSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-lg" />
    </div>
  )
}
