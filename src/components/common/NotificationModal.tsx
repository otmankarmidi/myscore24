'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/context/LanguageContext'

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
}

interface NotificationPrefs {
  matchStarted: boolean
  goal: boolean
  redCard: boolean
  halfTime: boolean
  fullTime: boolean
}

const STORAGE_KEY = 'myscore24_notification_prefs'

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const { t } = useLanguage()
  const [permissionState, setPermissionState] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default')
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    matchStarted: true,
    goal: true,
    redCard: true,
    halfTime: true,
    fullTime: true,
  })

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission as any)
    } else {
      setPermissionState('unsupported')
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setPrefs(JSON.parse(stored))
      }
    } catch {}
  }, [isOpen])

  const requestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission()
        setPermissionState(res as any)
      } catch (err) {
        console.error('Notification permission error:', err)
      }
    }
  }

  const togglePref = (key: keyof NotificationPrefs) => {
    const updated = { ...prefs, [key]: !prefs[key] }
    setPrefs(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {}
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-surface-container border border-surface-bright/50 rounded-2xl shadow-2xl p-5 space-y-4 text-on-surface z-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-bright/40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">notifications_active</span>
            <h3 className="font-bold text-body-md font-geist">{t('common.notifications', 'Match Notifications')}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-bright flex items-center justify-center active:scale-95 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Permission Status Box */}
        <div className="p-3 rounded-xl bg-surface-container-low border border-surface-bright/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">
              {t('common.permissionStatus', 'Browser Permission')}:
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                permissionState === 'granted'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : permissionState === 'denied'
                  ? 'bg-error/20 text-error'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {permissionState.toUpperCase()}
            </span>
          </div>

          {permissionState === 'default' && (
            <button
              onClick={requestPermission}
              className="w-full py-2 px-3 rounded-lg bg-primary-container text-on-primary-container text-xs font-bold hover:bg-primary-fixed transition-colors active:scale-95 touch-manipulation min-h-[44px]"
            >
              {t('common.enableNotifications', 'Enable Browser Notifications')}
            </button>
          )}

          {permissionState === 'denied' && (
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              {t('common.notificationsDeniedHint', 'Notifications are blocked by your browser settings. Please unblock them in your browser URL bar.')}
            </p>
          )}
        </div>

        {/* Preference Toggles */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-outline">
            {t('common.alertPreferences', 'Match Alert Events')}
          </h4>

          {[
            { key: 'matchStarted', label: t('alerts.matchStarted', 'Match Started') },
            { key: 'goal', label: t('alerts.goal', 'Goals & Penalties') },
            { key: 'redCard', label: t('alerts.redCard', 'Red Cards') },
            { key: 'halfTime', label: t('alerts.halfTime', 'Half-Time Score') },
            { key: 'fullTime', label: t('alerts.fullTime', 'Full-Time Result') },
          ].map((item) => (
            <div
              key={item.key}
              onClick={() => togglePref(item.key as keyof NotificationPrefs)}
              className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer min-h-[44px]"
            >
              <span className="text-xs font-medium text-on-surface">{item.label}</span>
              <div
                className={`w-10 h-6 rounded-full transition-colors p-1 flex items-center ${
                  prefs[item.key as keyof NotificationPrefs] ? 'bg-primary-container justify-end' : 'bg-surface-bright justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-surface shadow-md" />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-xs font-bold text-on-surface transition-colors min-h-[44px]"
        >
          {t('common.save', 'Done')}
        </button>
      </div>
    </div>
  )
}
