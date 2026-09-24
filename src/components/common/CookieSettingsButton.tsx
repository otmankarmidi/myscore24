'use client'

import { openCookieSettings } from '@/lib/analytics'

interface CookieSettingsButtonProps {
  className?: string
  label?: string
}

export default function CookieSettingsButton({
  className = '',
  label = 'Manage Cookie Settings',
}: CookieSettingsButtonProps) {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className={`px-4 py-2 rounded-lg bg-primary text-on-primary font-bold text-xs uppercase tracking-wider hover:bg-primary-container transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer ${className}`}
    >
      <span className="material-symbols-outlined text-base">tune</span>
      <span>{label}</span>
    </button>
  )
}
