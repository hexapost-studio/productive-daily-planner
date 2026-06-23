'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export function SyncTrigger() {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('sync') === '1' && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      import('@/lib/sync').then(async ({ migrateLocalToCloud, pullCloudToLocal }) => {
        await pullCloudToLocal()
        await migrateLocalToCloud()
        window.history.replaceState({}, '', '/')
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
