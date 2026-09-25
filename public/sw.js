// MyScore24 Web Push Notification Service Worker
// Delivers background match alerts (goals, cards, penalties) on mobile and desktop even when browser is closed.

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  let data = {}
  try {
    if (event.data) {
      data = event.data.json()
    }
  } catch (err) {
    try {
      data = { title: '⚽ MyScore24 Match Alert', message: event.data ? event.data.text() : '' }
    } catch {
      data = { title: '⚽ MyScore24 Match Alert', message: 'New live match event!' }
    }
  }

  const title = data.title || '⚽ MyScore24 Match Alert'
  const targetUrl = data.url || (data.matchId ? `/match/${data.matchId}` : '/')

  const options = {
    body: data.message || 'Live match update',
    icon: data.icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
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

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = (event.notification.data && event.notification.data.url) || '/'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If an existing window/tab is open, focus it and navigate
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus()
            if ('navigate' in client) {
              return client.navigate(targetUrl)
            }
            return
          }
        }
        // Otherwise open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl)
        }
      })
  )
})
