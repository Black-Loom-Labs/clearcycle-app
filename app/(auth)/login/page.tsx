"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DEV_MODE } from '@/lib/config'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F7F8FA] p-4">
      <div className="w-full max-w-sm">
        {DEV_MODE && (
          <div className="mb-4 rounded-lg border border-[#1E6BFF]/30 bg-[#EAF2FF] px-3 py-2 text-center text-sm text-[#1E6BFF]">
            Dev mode active — any credentials accepted
          </div>
        )}
        <Card className="border-[#E4E4EF]">
          <CardHeader className="items-center text-center">
            <span className="text-2xl font-bold text-[#1E6BFF]">ClearCycle</span>
            <CardTitle className="mt-2">Sign in to ClearCycle</CardTitle>
            <CardDescription>Insurance claims pipeline for Indian hospitals</CardDescription>
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
              <Button type="submit" className="mt-2 w-full bg-[#1E6BFF] hover:bg-[#1E6BFF]/90">
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
