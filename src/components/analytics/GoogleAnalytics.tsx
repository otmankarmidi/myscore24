'use client'

import Script from 'next/script'
import { Suspense } from 'react'
import { GA_MEASUREMENT_ID } from '@/lib/analytics'
import AnalyticsPageViewTracker from './AnalyticsPageViewTracker'

export default function GoogleAnalytics() {
  return (
    <>
      {/* 1. Google Consent Mode v2 Default Configuration */}
      <Script
        id="google-consent-mode"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            try {
              var userConsent = localStorage.getItem('myscore24_cookie_consent');
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

      {/* 2. Load GA4 Library (Async, After Interactive - zero blocking) */}
      <Script
        id="google-analytics-script"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />

      {/* 3. Initialize GA4 Data Layer */}
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            if (!window._gaInitialized) {
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
                send_page_view: true
              });
              window._gaInitialized = true;
            }
          `,
        }}
      />

      {/* 4. Client-side Navigation Tracker for Next.js App Router */}
      <Suspense fallback={null}>
        <AnalyticsPageViewTracker />
      </Suspense>
    </>
  )
}
