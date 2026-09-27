'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    globalDeferredPrompt
  )
  const [isInstalled, setIsInstalled] = useState<boolean>(false)
  const [isIOS, setIsIOS] = useState<boolean>(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState<boolean>(false)

  useEffect(() => {
    // 1. Detect standalone / already installed
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://')

    setIsInstalled(isStandalone)

    // 2. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent)
    const isSafari =
      /safari/.test(userAgent) &&
      !/chrome|crios|fxios|edgios|opr\//.test(userAgent)

    setIsIOS(isAppleDevice && isSafari && !isStandalone)

    // 3. Listen to beforeinstallprompt (Chromium, Android, Desktop Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      globalDeferredPrompt = promptEvent
      setDeferredPrompt(promptEvent)
    }

    // 4. Listen to appinstalled
    const handleAppInstalled = () => {
      globalDeferredPrompt = null
      setDeferredPrompt(null)
      setIsInstalled(true)
      setShowIOSInstructions(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Also update if standalone changes via media query listener
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches)
    }
    mediaQuery.addEventListener('change', handleMediaChange)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      mediaQuery.removeEventListener('change', handleMediaChange)
    }
  }, [])

  const triggerInstall = async (): Promise<boolean> => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const choice = await deferredPrompt.userChoice
        if (choice.outcome === 'accepted') {
          globalDeferredPrompt = null
          setDeferredPrompt(null)
          setIsInstalled(true)
          return true
        }
      } catch (err) {
        console.warn('[PWA Install Prompt Error]:', err)
      }
      return false
    }

    if (isIOS) {
      setShowIOSInstructions(true)
      return false
    }

    return false
  }

  return {
    isInstallable: !isInstalled && (!!deferredPrompt || isIOS),
    isInstalled,
    isIOS,
    showIOSInstructions,
    setShowIOSInstructions,
    triggerInstall,
  }
}
