import * as React from 'react'
import { api, type Carrier } from './api'

// Static fallback — used only until the live /carriers list has loaded (or
// if that request fails). Plan-level names are deliberately not guessed
// here; only company short names, which are safe to hardcode.
export const CARRIER_SHORT_NAMES: Record<string, string> = {
  STAR_HEALTH_001: 'Star Health',
  NIVA_BUPA_001: 'Niva Bupa',
  ICICI_LOMBARD_001: 'ICICI Lombard',
  HDFC_ERGO_001: 'HDFC ERGO',
}

export function getCarrierName(carrierId: string | undefined | null): string {
  if (!carrierId) return '—'
  return CARRIER_SHORT_NAMES[carrierId] ?? carrierId
}

export function getCarrierShortName(carrierId: string | undefined | null): string {
  if (!carrierId) return '—'
  return CARRIER_SHORT_NAMES[carrierId] ?? carrierId
}

// Live carrier directory, fetched once from the API and cached for the
// lifetime of the page. Falls back to the static short-name map (and
// ultimately the raw ID) while the fetch is in flight or if it fails.
let directoryCache: Record<string, Carrier> | null = null
let directoryPromise: Promise<Record<string, Carrier>> | null = null

function loadCarrierDirectory(): Promise<Record<string, Carrier>> {
  if (directoryCache) return Promise.resolve(directoryCache)
  if (!directoryPromise) {
    directoryPromise = api
      .getCarriers()
      .then((list) => {
        directoryCache = Object.fromEntries(list.map((c) => [c.carrier_id, c]))
        return directoryCache
      })
      .catch(() => ({}))
  }
  return directoryPromise
}

/**
 * Returns the live carrier directory (carrier_id -> Carrier), fetching it
 * from the API on first use and caching it thereafter. Returns an empty
 * object until the fetch resolves — callers should fall back to
 * getCarrierName/getCarrierShortName for any ID not yet present.
 */
export function useCarrierDirectory(): Record<string, Carrier> {
  const [directory, setDirectory] = React.useState<Record<string, Carrier>>(directoryCache ?? {})

  React.useEffect(() => {
    if (directoryCache) return
    let cancelled = false
    loadCarrierDirectory().then((dir) => {
      if (!cancelled) setDirectory(dir)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return directory
}

export function resolveCarrierName(
  directory: Record<string, Carrier>,
  carrierId: string | undefined | null
): string {
  if (!carrierId) return '—'
  return directory[carrierId]?.carrier_name ?? directory[carrierId]?.display_label ?? getCarrierName(carrierId)
}

export function resolveCarrierShortName(
  directory: Record<string, Carrier>,
  carrierId: string | undefined | null
): string {
  if (!carrierId) return '—'
  return directory[carrierId]?.short_name ?? getCarrierShortName(carrierId)
}
