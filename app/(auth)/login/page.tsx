"use client"

import * as React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DEV_MODE, API_BASE, setTokens } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.detail || 'Unable to sign in. Check your credentials and try again.')
        return
      }
      setTokens(data.access_token, data.refresh_token, data.id_token)
      router.push('/dashboard')
    } catch {
      setError('Unable to reach the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F7F8FA] p-4">
      <div className="w-full max-w-sm">
        {DEV_MODE && (
          <div className="mb-4 rounded-lg border border-[#1E6BFF]/30 bg-[#EAF2FF] px-3 py-2 text-center text-sm text-[#1E6BFF]">
            Dev Mode — auth bypassed
          </div>
        )}
        <Card className="border-[#E4E4EF]">
          <CardHeader className="items-center text-center">
            <Image src="/logo.svg" alt="ClearCycle" width={160} height={40} className="mx-auto" priority />
            <CardTitle className="mt-2">Sign in</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-[#0A0A0F]">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-[#0A0A0F]">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="mt-2 w-full bg-[#1E6BFF] hover:bg-[#1E6BFF]/90"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
              {error && (
                <p className="text-center text-sm text-red-600">{error}</p>
              )}
            </form>
            {DEV_MODE && (
              <Button
                type="button"
                variant="outline"
                className="mt-3 w-full border-[#E4E4EF]"
                onClick={() => router.push('/dashboard')}
              >
                Enter dashboard →
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
