'use client'

import { useLanguage } from '@/context/LanguageContext'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export default function ErrorState({
  title,
  description,
  onRetry,
}: ErrorStateProps) {
  const { t } = useLanguage()

  const defaultTitle = t('common.errorLive', 'Live scores are temporarily unavailable')
  const defaultDesc = t('common.errorLiveDesc', "We're working to restore the service. Please try again in a moment.")
  const retryLabel = t('common.tryAgain', 'Try Again')

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-error-container/20 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-error" style={{ fontSize: 32 }}>signal_disconnected</span>
      </div>
      <h3 className="font-geist font-semibold text-[16px] text-on-surface mb-2">{title || defaultTitle}</h3>
      <p className="font-inter text-[13px] text-on-surface-variant max-w-xs mb-4">{description || defaultDesc}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded bg-primary-container text-on-primary-container font-geist text-[12px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
        >
          {retryLabel}
        </button>
      )}
    </div>
  )
}
