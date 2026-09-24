'use client'

import Script from 'next/script'
import { Suspense, useEffect, useState } from 'react'
import { GA_MEASUREMENT_ID, CONSENT_STORAGE_KEY } from '@/lib/analytics'
import AnalyticsPageViewTracker from './AnalyticsPageViewTracker'

export default function GoogleAnalytics() {
  const [shouldLoad, setShouldLoad] = useState<boolean>(true)

  useEffect(() => {
    try {
      const consent = localStorage.getItem(CONSENT_STORAGE_KEY)
      // If user explicitly denied consent, do not download gtag script
      if (consent === 'denied') {
        setShouldLoad(false)
      }
    } catch {
      // Default to allowed
    }
  }, [])

  if (!shouldLoad) {
    return null
  }

  return (
    <>
      {/* 1. Google Consent Mode v2 Default Configuration (lazyOnload for zero critical path impact) */}
      <Script
        id="google-consent-mode"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            try {
              var userConsent = localStorage.getItem('${CONSENT_STORAGE_KEY}');
              var analyticsGranted = userConsent === 'denied' ? 'denied' : 'granted';
              gtag('consent', 'default', {
                'analytics_storage': analyticsGranted,
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied'
              });
            } catch(e) {
              gtag('consent', 'default', {
                'analytics_storage': 'granted',
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied'
              });
            }
          `,
        }}
      />

      {/* 2. Load GA4 Library (lazyOnload - loads during idle time after all critical resources) */}
      <Script
        id="google-analytics-script"
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />

      {/* 3. Initialize GA4 (send_page_view: false to prevent duplicate page_view events) */}
      <Script
        id="google-analytics-init"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            if (!window._gaInitialized) {
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
                send_page_view: false
              });
              window._gaInitialized = true;
            }
          `,
        }}
      />

      {/* 4. Single Source of Truth Navigation Tracker */}
      <Suspense fallback={null}>
        <AnalyticsPageViewTracker />
      </Suspense>
    </>
  )
}
