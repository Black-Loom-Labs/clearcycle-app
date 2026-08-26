import { API_BASE, DEV_MODE } from './config'

const ACCESS_TOKEN_KEY = 'cc_access_token'
const REFRESH_TOKEN_KEY = 'cc_refresh_token'
const ID_TOKEN_KEY = 'cc_id_token'

export { API_BASE, DEV_MODE }

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setTokens(accessToken: string, refreshToken: string, idToken: string) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  sessionStorage.setItem(ID_TOKEN_KEY, idToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  // Short-lived cookie so middleware can see the session on the next request.
  document.cookie = `cc_access_token=${accessToken}; path=/; max-age=3600; SameSite=Strict`
}

export function clearTokens() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  sessionStorage.removeItem(ID_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  document.cookie = 'cc_access_token=; path=/; max-age=0'
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    if (!res.ok) {
      clearTokens()
      return null
    }
    const data = await res.json()
    setTokens(data.access_token, data.refresh_token, data.id_token)
    return data.access_token
  } catch {
    clearTokens()
    return null
  }
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  const baseHeaders: Record<string, string> = isFormData ? {} : { 'Content-Type': 'application/json' }

  // In dev mode, use DEMO_API_KEY from env
  if (DEV_MODE) {
    return fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...baseHeaders,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DEMO_API_KEY || ''}`,
        ...options.headers,
      },
    })
  }

  let token = getAccessToken()
  let res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...baseHeaders,
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  })

  // Token expired — attempt refresh once
  if (res.status === 401) {
    token = await refreshAccessToken()
    if (!token) {
      clearTokens()
      if (typeof window !== 'undefined') window.location.href = '/login'
      return res
    }
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...baseHeaders,
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    })
  }
  return res
}

export function isAuthenticated(): boolean {
  if (DEV_MODE) return true
  return !!getAccessToken()
}

export function getUserFromToken(): { email: string; role: string; name: string; hospital_id: string } | null {
  if (typeof window === 'undefined') return null
  const idToken = sessionStorage.getItem(ID_TOKEN_KEY)
  if (!idToken) return null
  try {
    const payload = JSON.parse(atob(idToken.split('.')[1]))
    return {
      email: payload.email || '',
      role: payload['custom:role'] || 'read_only',
      name: payload.name || payload.email || '',
      hospital_id: payload['custom:hospital_id'] || '',
    }
  } catch {
    return null
  }
}
