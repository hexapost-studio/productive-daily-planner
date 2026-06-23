import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:andreaerick15@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '',
  process.env.VAPID_PRIVATE_KEY ?? '',
)

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return NextResponse.json({ sent: 0 })

  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  const now = new Date()
  const currentHour = now.getHours()
  const currentMin = now.getMinutes()

  const { data: subs } = await supabase.from('push_subscriptions').select('*')
  if (!subs?.length) return NextResponse.json({ sent: 0 })

  let sent = 0
  for (const sub of subs) {
    try {
      const { data: plans } = await supabase
        .from('weekly_plans')
        .select('daily_plans')
        .eq('user_id', sub.user_id)

      const today = now.toISOString().split('T')[0]
      const reminders: string[] = []

      for (const plan of plans ?? []) {
        for (const dp of plan.daily_plans ?? []) {
          if (dp.date !== today) continue
          for (const task of dp.tasks ?? []) {
            if (!task.reminder?.date || !task.reminder?.time || task.reminder.sent) continue
            if (task.reminder.date !== today) continue
            const [rh, rm] = task.reminder.time.split(':').map(Number)
            if (rh === currentHour && Math.abs(rm - currentMin) <= 1) {
              reminders.push(task.designation || 'Tâche sans titre')
            }
          }
        }
      }

      if (reminders.length > 0) {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          JSON.stringify({ title: `⏰ Rappel — ${reminders[0]}`, body: reminders.slice(1).join(', ') || 'Tâche planifiée maintenant' })
        )
        sent++
      }
    } catch { /* skip failed subscriptions */ }
  }

  return NextResponse.json({ sent })
}
