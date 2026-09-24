'use client'

import { openCookieSettings } from '@/lib/analytics'

export default function CookieSettingsTrigger({
  children = 'Cookie Settings',
  className = 'text-primary underline hover:text-primary-container font-semibold cursor-pointer',
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className={className}
    >
      {children}
    </button>
  )
}
