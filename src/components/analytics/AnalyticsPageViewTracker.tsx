'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackPageView } from '@/lib/analytics'

export default function AnalyticsPageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastPathRef = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname) return
    const search = searchParams?.toString()
    const fullUrl = search ? `${pathname}?${search}` : pathname

    // Deduplicate identical consecutive pageview fires
    if (lastPathRef.current !== fullUrl) {
      lastPathRef.current = fullUrl
      trackPageView(fullUrl)
    }
  }, [pathname, searchParams])

  return null
}
