export const CARRIER_NAMES: Record<string, string> = {
  STAR_HEALTH_001: 'Star Health Comprehensive',
  NIVA_BUPA_001: 'Niva Bupa Health Premia Gold',
}

export const CARRIER_SHORT_NAMES: Record<string, string> = {
  STAR_HEALTH_001: 'Star Health',
  NIVA_BUPA_001: 'Niva Bupa',
}

export function getCarrierName(carrierId: string | undefined | null): string {
  if (!carrierId) return '—'
  return CARRIER_NAMES[carrierId] ?? carrierId
}

export function getCarrierShortName(carrierId: string | undefined | null): string {
  if (!carrierId) return '—'
  return CARRIER_SHORT_NAMES[carrierId] ?? carrierId
}
