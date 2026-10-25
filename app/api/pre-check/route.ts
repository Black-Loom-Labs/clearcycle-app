import { NextRequest, NextResponse } from 'next/server'

const LOCAL_BACKEND = 'http://localhost:8000'

export async function POST(req: NextRequest) {
  const body = await req.text()
  try {
    const res = await fetch(`${LOCAL_BACKEND}/claims/pre-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ detail: 'Local backend unavailable' }, { status: 503 })
  }
}
