"use client"

import * as React from 'react'
import { Info } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ErrorState } from '@/components/api-states'
import { useToast } from '@/components/toast'
import { SubmissionModeBadge, submissionModeLabel } from '@/components/submission-mode-badge'
import { api, type CarrierSetting } from '@/lib/api'
import { resolveCarrierName, useCarrierDirectory } from '@/lib/carriers'
import { cn } from '@/lib/utils'

const MODES: CarrierSetting['submission_mode'][] = ['manual_assist', 'semi_autonomous', 'fully_autonomous']

export function TpaSubmissionTab() {
  const carrierDirectory = useCarrierDirectory()
  const { showToast } = useToast()
  const [settings, setSettings] = React.useState<CarrierSetting[] | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [updating, setUpdating] = React.useState<string | null>(null)

  const load = React.useCallback(() => {
    setLoading(true)
    setError(null)
    api
      .getCarrierSettings()
      .then((res) => setSettings(Array.isArray(res) ? res : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  async function handleModeChange(carrierId: string, mode: CarrierSetting['submission_mode']) {
    setUpdating(carrierId)
    try {
      await api.updateCarrierSetting(carrierId, { submission_mode: mode })
      showToast(`${resolveCarrierName(carrierDirectory, carrierId)} set to ${submissionModeLabel(mode)}`)
      load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to update submission mode')
    } finally {
      setUpdating(null)
    }
  }

  async function handleToggleEnabled(setting: CarrierSetting) {
    setUpdating(setting.carrier_id)
    try {
      await api.updateCarrierSetting(setting.carrier_id, { enabled: !setting.enabled })
      load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to update carrier status')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-[#0A0A0F]">TPA Portal Submission Settings</h2>
        <p className="text-sm text-[#5C5C6B]">
          Control how claims are submitted to each TPA portal. Start with Manual Assist during the pilot
          and upgrade to autonomous submission after trust is established.
        </p>
      </div>

      <Alert>
        <Info />
        <AlertTitle>Pilot Default</AlertTitle>
        <AlertDescription>
          During the pilot, all carriers are set to Manual Assist mode. This means ClearCycle generates
          submission packages but your billing team submits to TPA portals directly. No portal credentials
          are required.
        </AlertDescription>
      </Alert>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#E4E4EF] bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Carrier</TableHead>
                <TableHead>Current Mode</TableHead>
                <TableHead>Portal Credentials</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              {!loading && (settings?.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <p className="py-8 text-center text-sm text-[#5C5C6B]">No carrier settings found</p>
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                settings?.map((s) => (
                  <TableRow key={s.carrier_id}>
                    <TableCell className="font-medium text-[#0A0A0F]">
                      {resolveCarrierName(carrierDirectory, s.carrier_id)}
                    </TableCell>
                    <TableCell>
                      <SubmissionModeBadge mode={s.submission_mode} />
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          s.portal_credentials_stored
                            ? 'bg-[#DCFCE7] text-[#16A34A]'
                            : 'bg-[#E4E4EF] text-[#5C5C6B]'
                        )}
                      >
                        {s.portal_credentials_stored ? 'Stored' : 'Not stored'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updating === s.carrier_id}
                        onClick={() => handleToggleEnabled(s)}
                      >
                        {s.enabled ? 'Enabled' : 'Disabled'}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button size="sm" variant="outline" disabled={updating === s.carrier_id} />
                          }
                        >
                          Change Mode
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {MODES.map((mode) => (
                            <DropdownMenuItem key={mode} onClick={() => handleModeChange(s.carrier_id, mode)}>
                              Set to {submissionModeLabel(mode)}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
