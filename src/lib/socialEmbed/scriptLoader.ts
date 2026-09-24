/**
 * Dynamic Third-Party SDK Loader with Deduplication & Timeouts
 * ─────────────────────────────────────────────────────────────
 * Ensures that social media scripts (X widgets.js, Instagram embed.js, TikTok embed.js)
 * are NEVER loaded globally, are NEVER loaded on pages without embeds, and are
 * NEVER loaded more than once when multiple embeds of the same provider exist.
 */

let twitterPromise: Promise<any> | null = null
let instagramPromise: Promise<any> | null = null
let tiktokPromise: Promise<any> | null = null

function loadScriptWithTimeout(src: string, id: string, timeoutMs = 8000): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()

  const existing = document.getElementById(id)
  if (existing) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = id
    script.src = src
    script.async = true
    script.defer = true

    const timer = setTimeout(() => {
      script.onerror = null
      script.onload = null
      reject(new Error(`Timed out loading ${src}`))
    }, timeoutMs)

    script.onload = () => {
      clearTimeout(timer)
      resolve()
    }

    script.onerror = () => {
      clearTimeout(timer)
      reject(new Error(`Failed to load ${src}`))
    }

    document.head.appendChild(script)
  })
}

/**
 * Loads X / Twitter official widgets.js script once.
 */
export function loadTwitterWidgetScript(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window not available'))
  if ((window as any).twttr?.widgets) {
    return Promise.resolve((window as any).twttr)
  }

  if (!twitterPromise) {
    twitterPromise = loadScriptWithTimeout('https://platform.twitter.com/widgets.js', 'twitter-widgets-js')
      .then(() => {
        return new Promise((resolve) => {
          if ((window as any).twttr?.ready) {
            (window as any).twttr.ready((twttr: any) => resolve(twttr))
          } else {
            resolve((window as any).twttr)
          }
        })
      })
      .catch((err) => {
        twitterPromise = null
        throw err
      })
  }

  return twitterPromise
}

/**
 * Loads Instagram official embed.js script once.
 */
export function loadInstagramEmbedScript(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window not available'))
  if ((window as any).instgrm?.Embeds) {
    return Promise.resolve((window as any).instgrm)
  }

  if (!instagramPromise) {
    instagramPromise = loadScriptWithTimeout('https://www.instagram.com/embed.js', 'instagram-embed-js')
      .then(() => (window as any).instgrm)
      .catch((err) => {
        instagramPromise = null
        throw err
      })
  }

  return instagramPromise
}

/**
 * Loads TikTok official embed.js script once.
 */
export function loadTikTokEmbedScript(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window not available'))

  if (!tiktokPromise) {
    tiktokPromise = loadScriptWithTimeout('https://www.tiktok.com/embed.js', 'tiktok-embed-js')
      .catch((err) => {
        tiktokPromise = null
        throw err
      })
  }

  return tiktokPromise
}
