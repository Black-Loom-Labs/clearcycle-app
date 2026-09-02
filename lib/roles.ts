import { DEV_MODE, getUserFromToken } from './auth'

export type Role = 'read_only' | 'billing_staff' | 'admin'

// Minimum role required for each top-level route. Anything not listed here
// is treated as accessible to any authenticated role.
const ROUTE_ROLES: Record<string, Role[]> = {
  '/dashboard': ['read_only', 'billing_staff', 'admin'],
  '/claims': ['read_only', 'billing_staff', 'admin'],
  '/pre-encounter': ['billing_staff', 'admin'],
  '/denial-intel': ['billing_staff', 'admin'],
  '/payer-intelligence': ['billing_staff', 'admin'],
  '/settings': ['admin'],
}

export function getCurrentRole(): Role {
  // Dev mode has no real token/user — treat it as full access so the
  // existing dev experience (see everything) is unchanged.
  if (DEV_MODE) return 'admin'
  const user = getUserFromToken()
  const role = user?.role
  return role === 'billing_staff' || role === 'admin' ? role : 'read_only'
}

export function canAccessRoute(role: Role, pathname: string): boolean {
  const entry = Object.entries(ROUTE_ROLES).find(
    ([path]) => pathname === path || pathname.startsWith(path + '/')
  )
  if (!entry) return true
  return entry[1].includes(role)
}

export function canUpload(role: Role): boolean {
  return role === 'billing_staff' || role === 'admin'
}
