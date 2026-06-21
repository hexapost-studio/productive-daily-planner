import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: 'not_configured' }, { status: 200 })
  }

  const { createClient } = await import('@/lib/supabase/server')
  let providerToken: string | null = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getSession()
    providerToken = data.session?.provider_token ?? null
  } catch {
    return NextResponse.json({ error: 'not_configured' }, { status: 200 })
  }

  if (!providerToken) {
    return NextResponse.json({ error: 'Not authenticated with Google' }, { status: 200 })
  }

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]

  const start = new Date(`${date}T00:00:00`)
  const end = new Date(`${date}T23:59:59`)

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
    new URLSearchParams({
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '20',
    }),
    {
      headers: { Authorization: `Bearer ${providerToken}` },
    },
  )

  if (!res.ok) {
    return NextResponse.json({ error: 'Google Calendar API error', status: res.status }, { status: 502 })
  }

  const data = await res.json()

  const events = (data.items ?? []).map((e: {
    id: string
    summary?: string
    start?: { dateTime?: string; date?: string }
    end?: { dateTime?: string; date?: string }
    colorId?: string
  }) => ({
    id: e.id,
    title: e.summary ?? '(sans titre)',
    start: e.start?.dateTime ?? e.start?.date,
    end: e.end?.dateTime ?? e.end?.date,
    isAllDay: !e.start?.dateTime,
    colorId: e.colorId,
  }))

  return NextResponse.json({ events })
}
