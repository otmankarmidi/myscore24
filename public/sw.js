// MyScore24 Production-Grade PWA & Web Push Service Worker
// Version: 2.0.0
// Ensures real-time football data safety: NEVER serves stale live scores.

const CACHE_VERSION = 'v2'
const CACHE_STATIC = `myscore24-static-${CACHE_VERSION}`
const CACHE_PAGES = `myscore24-pages-${CACHE_VERSION}`
const CACHE_OFFLINE = `myscore24-offline-${CACHE_VERSION}`

// Core static assets required for standalone shell and offline fallback
const PRECACHE_ASSETS = [
  '/offline',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/apple-touch-icon.png',
  '/favicon.png',
  '/logo.png',
]

// 1. INSTALL LIFECYCLE
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_OFFLINE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .catch((err) => {
        console.warn('[SW] Pre-caching warning:', err)
      })
  )
})

// 2. ACTIVATE LIFECYCLE - Clean up obsolete caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_STATIC, CACHE_PAGES, CACHE_OFFLINE]

  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (!currentCaches.includes(key)) {
              return caches.delete(key)
            }
          })
        )
      )
      .then(() => self.clients.claim())
  )
})

// 3. USER-TRIGGERED UPDATE MESSAGE
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// 4. FETCH STRATEGY
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle HTTP/HTTPS GET requests
  if (request.method !== 'GET') return
  if (!url.protocol.startsWith('http')) return

  // =========================================================================
  // CRITICAL FOOTBALL DATA SAFETY:
  // ALWAYS BYPASS SERVICE WORKER FOR REAL-TIME MATCH DATA, ALERTS & CMS ADMIN
  // Under NO circumstances should live football scores be cached here!
  // =========================================================================
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin') ||
    url.hostname.includes('google') ||
    url.hostname.includes('googlesyndication') ||
    url.hostname.includes('api-sports.io')
  ) {
    return // Let normal browser network fetch handle it directly
  }

  // A. Static Next.js hashed assets, fonts, icons (Cache-First)
  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/favicon.png' ||
    url.pathname === '/logo.png'

  if (isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_STATIC).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) return cached

        try {
          const networkResponse = await fetch(request)
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone())
          }
          return networkResponse
        } catch {
          // If offline and static asset not cached, return empty or fallback
          return cached || new Response('', { status: 408 })
        }
      })
    )
    return
  }

  // B. HTML Navigation requests (Network-First with Cache fallback & /offline fallback)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(async (networkResponse) => {
          // Cache successful public HTML pages
          if (networkResponse && networkResponse.status === 200) {
            const pagesCache = await caches.open(CACHE_PAGES)
            pagesCache.put(request, networkResponse.clone())
          }
          return networkResponse
        })
        .catch(async () => {
          // Network failed — user is offline
          const pagesCache = await caches.open(CACHE_PAGES)
          const cachedPage = await pagesCache.match(request)
          if (cachedPage) {
            return cachedPage
          }

          // Otherwise return the pre-cached branded offline fallback
          const offlineCache = await caches.open(CACHE_OFFLINE)
          const offlineFallback = await offlineCache.match('/offline')
          return (
            offlineFallback ||
            new Response('Offline - MyScore24', {
              headers: { 'Content-Type': 'text/html' },
            })
          )
        })
    )
    return
  }
})

// 5. WEB PUSH NOTIFICATIONS (GOALS, RED CARDS, MATCH EVENTS)
self.addEventListener('push', (event) => {
  let data = {}
  try {
    if (event.data) {
      data = event.data.json()
    }
  } catch {
    try {
      data = {
        title: '⚽ MyScore24 Match Alert',
        message: event.data ? event.data.text() : '',
      }
    } catch {
      data = {
        title: '⚽ MyScore24 Match Alert',
        message: 'New live match event!',
      }
    }
  }

  const title = data.title || '⚽ MyScore24 Match Alert'
  const targetUrl = data.url || (data.matchId ? `/match/${data.matchId}` : '/')

  const options = {
    body: data.message || 'Live match update',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: data.tag || `myscore24-alert-${data.matchId || Date.now()}`,
    renotify: true,
    requireInteraction: true,
    vibrate: [250, 100, 250, 100, 250],
    data: {
      url: targetUrl,
      matchId: data.matchId,
    },
    actions: [
      {
        action: 'view-match',
        title: 'View Match ⚽',
      },
    ],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// 6. NOTIFICATION CLICK HANDLER
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = (event.notification.data && event.notification.data.url) || '/'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus()
            if ('navigate' in client) {
              return client.navigate(targetUrl)
            }
            return
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl)
        }
      })
  )
})
