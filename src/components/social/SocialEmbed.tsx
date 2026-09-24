'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  detectAndValidateSocialUrl,
} from '@/lib/socialEmbed/validate'
import {
  hasPersistentExternalMediaConsent,
  grantPersistentExternalMediaConsent,
  EXTERNAL_MEDIA_CONSENT_EVENT,
} from '@/lib/socialEmbed/consent'
import {
  loadTwitterWidgetScript,
  loadInstagramEmbedScript,
  loadTikTokEmbedScript,
} from '@/lib/socialEmbed/scriptLoader'
import { SocialProvider, ValidatedSocialEmbed } from '@/lib/socialEmbed/types'

interface SocialEmbedProps {
  provider?: SocialProvider
  url: string
  className?: string
}

const PROVIDER_NAMES: Record<SocialProvider, string> = {
  x: 'X (Twitter)',
  youtube: 'YouTube',
  instagram: 'Instagram',
  tiktok: 'TikTok',
}

function PlatformIcon({ provider }: { provider: SocialProvider }) {
  switch (provider) {
    case 'x':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-red-500" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-pink-500" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      )
    case 'tiktok':
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-cyan-400" aria-hidden="true">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      )
  }
}

export default function SocialEmbed({ url, className = '' }: SocialEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const embedSlotRef = useRef<HTMLDivElement>(null)

  // Re-detect and validate provider strictly from URL (never trust passed provider)
  const [embedInfo, setEmbedInfo] = useState<ValidatedSocialEmbed | null>(() =>
    detectAndValidateSocialUrl(url)
  )

  // Consent states
  const [hasPersistentConsent, setHasPersistentConsent] = useState<boolean>(false)
  const [isTemporarilyAllowed, setIsTemporarilyAllowed] = useState<boolean>(false)

  // Viewport / lifecycle states
  const [isInViewport, setIsInViewport] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  // Sync validation if URL changes
  useEffect(() => {
    setEmbedInfo(detectAndValidateSocialUrl(url))
    setIsLoaded(false)
    setIsError(false)
  }, [url])

  // Consent listener
  useEffect(() => {
    setHasPersistentConsent(hasPersistentExternalMediaConsent())

    const handleConsentChange = (e: any) => {
      if (e?.detail?.allowed !== undefined) {
        setHasPersistentConsent(e.detail.allowed)
      } else {
        setHasPersistentConsent(hasPersistentExternalMediaConsent())
      }
    }

    window.addEventListener(EXTERNAL_MEDIA_CONSENT_EVENT, handleConsentChange)
    return () => window.removeEventListener(EXTERNAL_MEDIA_CONSENT_EVENT, handleConsentChange)
  }, [])

  // Lazy Intersection Observer (300px threshold before viewport)
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInViewport(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin: '300px' }
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const isConsentGiven = hasPersistentConsent || isTemporarilyAllowed
  const shouldActivate = isConsentGiven && isInViewport

  // Handle Provider-specific Embed Initialization
  useEffect(() => {
    if (!shouldActivate || !embedInfo || isLoaded || isError) return

    let isMounted = true

    // ─── 1. X / Twitter Embed ──────────────────────────────────────────────
    if (embedInfo.provider === 'x') {
      setIsLoading(true)
      loadTwitterWidgetScript()
        .then((twttr) => {
          if (!isMounted || !embedSlotRef.current) return
          embedSlotRef.current.innerHTML = ''

          const isDark = document.documentElement.classList.contains('dark')
          const tweetTheme = isDark ? 'dark' : 'light'

          twttr.widgets
            .createTweet(embedInfo.id, embedSlotRef.current, {
              theme: tweetTheme,
              conversation: 'none',
              align: 'center',
              dnt: true,
            })
            .then((element: any) => {
              if (!isMounted) return
              setIsLoading(false)
              if (!element) {
                // Tweet deleted, suspended, or unavailable
                setIsError(true)
              } else {
                setIsLoaded(true)
              }
            })
            .catch(() => {
              if (isMounted) {
                setIsLoading(false)
                setIsError(true)
              }
            })
        })
        .catch(() => {
          if (isMounted) {
            setIsLoading(false)
            setIsError(true)
          }
        })
    }

    // ─── 2. Instagram Embed ────────────────────────────────────────────────
    else if (embedInfo.provider === 'instagram') {
      setIsLoading(true)
      loadInstagramEmbedScript()
        .then((instgrm) => {
          if (!isMounted) return
          try {
            instgrm?.Embeds?.process()
            setIsLoading(false)
            setIsLoaded(true)
          } catch {
            setIsLoading(false)
            setIsError(true)
          }
        })
        .catch(() => {
          if (isMounted) {
            setIsLoading(false)
            // Still allows iframe fallback
            setIsLoaded(true)
          }
        })
    }

    // ─── 3. TikTok Embed ───────────────────────────────────────────────────
    else if (embedInfo.provider === 'tiktok') {
      setIsLoading(true)
      loadTikTokEmbedScript()
        .then(() => {
          if (isMounted) {
            setIsLoading(false)
            setIsLoaded(true)
          }
        })
        .catch(() => {
          if (isMounted) {
            setIsLoading(false)
            setIsLoaded(true)
          }
        })
    }

    // ─── 4. YouTube Embed ──────────────────────────────────────────────────
    else if (embedInfo.provider === 'youtube') {
      setIsLoading(false)
      setIsLoaded(true)
    }

    return () => {
      isMounted = false
    }
  }, [shouldActivate, embedInfo, isLoaded, isError])

  // If URL could not be validated or domain not whitelisted
  if (!embedInfo) {
    return (
      <div
        className={`my-6 p-4 rounded-xl border border-dashed border-surface-bright bg-surface-container/50 text-center space-y-2 ${className}`}
      >
        <p className="text-xs text-on-surface-variant font-medium">
          External media link from unsupported or invalid source:
        </p>
        <p className="text-xs font-mono text-outline break-all">{url}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary hover:underline bg-surface-container border border-surface-bright"
        >
          <span>Open Link in New Tab</span>
          <span className="material-symbols-outlined text-sm">open_in_new</span>
        </a>
      </div>
    )
  }

  const providerName = PROVIDER_NAMES[embedInfo.provider]

  // Render Fallback Card (in case of deleted, private, blocked, or offline embeds)
  if (isError) {
    return (
      <div
        ref={containerRef}
        className={`my-6 max-w-xl mx-auto p-5 rounded-xl border border-surface-bright bg-surface-container flex flex-col items-center text-center space-y-3 shadow-md ${className}`}
      >
        <div className="p-2.5 rounded-full bg-surface-container-high text-on-surface-variant">
          <PlatformIcon provider={embedInfo.provider} />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-on-surface">{providerName} Post</p>
          <p className="text-xs text-on-surface-variant">
            This post may be deleted, private, or temporarily unavailable.
          </p>
        </div>
        <a
          href={embedInfo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-on-primary bg-primary hover:bg-primary/90 transition-all shadow-sm"
        >
          <span>View on {providerName}</span>
          <span className="material-symbols-outlined text-sm">open_in_new</span>
        </a>
      </div>
    )
  }

  // Render Consent Prompt (before user has given permission to load third-party scripts)
  if (!isConsentGiven) {
    return (
      <div
        ref={containerRef}
        className={`my-6 max-w-xl mx-auto p-5 rounded-xl border border-surface-bright bg-surface-container flex flex-col items-center text-center space-y-3.5 shadow-md ${className}`}
      >
        <div className="p-2.5 rounded-full bg-surface-container-high text-on-surface">
          <PlatformIcon provider={embedInfo.provider} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-on-surface">External Content from {providerName}</h4>
          <p className="text-xs text-on-surface-variant max-w-md">
            This content is hosted by {providerName}. To view it, allow external media requests.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setIsTemporarilyAllowed(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-surface-container-high hover:bg-surface-bright border border-surface-bright text-on-surface transition-colors"
          >
            Load content
          </button>
          <button
            type="button"
            onClick={() => {
              grantPersistentExternalMediaConsent()
              setIsTemporarilyAllowed(true)
            }}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-sm"
          >
            Always allow external media
          </button>
        </div>
        <a
          href={embedInfo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-on-surface-variant hover:text-primary transition-colors underline"
        >
          View original post on {providerName}
        </a>
      </div>
    )
  }

  // Render Active Embeds
  return (
    <div
      ref={containerRef}
      className={`my-6 flex flex-col items-center justify-center w-full min-h-[160px] ${className}`}
    >
      {/* ─── X (Twitter) Embed ─────────────────────────────────────────── */}
      {embedInfo.provider === 'x' && (
        <div className="w-full max-w-[550px] mx-auto min-h-[250px] flex justify-center">
          {isLoading && (
            <div className="w-full max-w-[500px] h-64 rounded-xl border border-surface-bright bg-surface-container animate-pulse flex flex-col items-center justify-center gap-2">
              <PlatformIcon provider="x" />
              <span className="text-xs text-on-surface-variant">Loading post from X...</span>
            </div>
          )}
          <div ref={embedSlotRef} className="w-full flex justify-center" />
        </div>
      )}

      {/* ─── YouTube Embed (youtube-nocookie) ─────────────────────────── */}
      {embedInfo.provider === 'youtube' && (
        <div
          className={`w-full mx-auto ${
            embedInfo.isShorts
              ? 'max-w-[340px] aspect-[9/16]'
              : 'max-w-3xl aspect-video'
          } rounded-xl overflow-hidden border border-surface-bright bg-black shadow-lg relative`}
        >
          {shouldActivate ? (
            <iframe
              src={embedInfo.embedUrl}
              title={`YouTube ${embedInfo.isShorts ? 'Short' : 'video'} player`}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container animate-pulse text-on-surface-variant gap-2">
              <PlatformIcon provider="youtube" />
              <span className="text-xs">Preparing video...</span>
            </div>
          )}
        </div>
      )}

      {/* ─── Instagram Embed ──────────────────────────────────────────── */}
      {embedInfo.provider === 'instagram' && (
        <div className="w-full max-w-[540px] mx-auto min-h-[460px] flex justify-center">
          {shouldActivate ? (
            <iframe
              src={`${embedInfo.embedUrl}/captioned/`}
              title="Instagram post embed"
              loading="lazy"
              allowTransparency
              className="w-full h-[520px] max-w-[540px] border border-surface-bright rounded-xl bg-surface-container"
              onError={() => setIsError(true)}
            />
          ) : (
            <div className="w-full h-[460px] rounded-xl border border-surface-bright bg-surface-container animate-pulse flex items-center justify-center text-xs text-on-surface-variant">
              Loading Instagram post...
            </div>
          )}
        </div>
      )}

      {/* ─── TikTok Embed ─────────────────────────────────────────────── */}
      {embedInfo.provider === 'tiktok' && (
        <div className="w-full max-w-[340px] mx-auto min-h-[580px] flex justify-center">
          {shouldActivate ? (
            <iframe
              src={embedInfo.embedUrl}
              title="TikTok video player"
              loading="lazy"
              allowFullScreen
              className="w-full h-[600px] border border-surface-bright rounded-xl bg-surface-container"
              onError={() => setIsError(true)}
            />
          ) : (
            <div className="w-full h-[580px] rounded-xl border border-surface-bright bg-surface-container animate-pulse flex items-center justify-center text-xs text-on-surface-variant">
              Loading TikTok video...
            </div>
          )}
        </div>
      )}
    </div>
  )
}
