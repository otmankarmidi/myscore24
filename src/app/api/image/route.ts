import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

// Cache folder under .next/cache or process.cwd()
const CACHE_DIR = path.join(process.cwd(), '.next', 'cache', 'optimized-images')

function ensureCacheDir() {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true })
    }
  } catch {
    // Non-fatal if filesystem is read-only
  }
}

// Allowed hostnames for security and SSRF protection
const ALLOWED_HOSTS = [
  'media.api-sports.io',
  'api-sports.io',
  'v3.football.api-sports.io',
  'upload.wikimedia.org',
  'commons.wikimedia.org',
  'flagcdn.com',
  'images.unsplash.com',
  'myscore24.com',
  'www.myscore24.com',
  'localhost',
]

function isHostAllowed(hostname: string): boolean {
  const h = hostname.toLowerCase()
  return (
    ALLOWED_HOSTS.includes(h) ||
    h.endsWith('.api-sports.io') ||
    h.endsWith('.wikimedia.org') ||
    h.endsWith('.flagcdn.com') ||
    h.endsWith('.unsplash.com')
  )
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const targetUrl = searchParams.get('url')

  if (!targetUrl) {
    return new NextResponse('Missing url parameter', { status: 400 })
  }

  // Parse width & quality
  let width = parseInt(searchParams.get('w') || '48', 10)
  if (isNaN(width) || width < 16) width = 16
  if (width > 512) width = 512

  let quality = parseInt(searchParams.get('q') || '80', 10)
  if (isNaN(quality) || quality < 30) quality = 30
  if (quality > 95) quality = 95

  let parsedUrl: URL
  try {
    parsedUrl = new URL(targetUrl)
  } catch {
    return new NextResponse('Invalid URL', { status: 400 })
  }

  if (!isHostAllowed(parsedUrl.hostname)) {
    return new NextResponse('Host not permitted', { status: 403 })
  }

  // Determine preferred format based on Accept header (AVIF > WebP)
  const accept = request.headers.get('accept') || ''
  const isAvifSupported = accept.includes('image/avif')
  const ext = isAvifSupported ? 'avif' : 'webp'
  const contentType = isAvifSupported ? 'image/avif' : 'image/webp'

  // Generate cache key
  const hash = crypto
    .createHash('sha256')
    .update(`${targetUrl}_w${width}_q${quality}_${ext}`)
    .digest('hex')
  const cachePath = path.join(CACHE_DIR, `${hash}.${ext}`)

  // 1. Check disk cache
  try {
    if (fs.existsSync(cachePath)) {
      const cachedBuffer = fs.readFileSync(cachePath)
      return new NextResponse(new Uint8Array(cachedBuffer), {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=2592000, immutable',
          'ETag': `"${hash}"`,
          'Vary': 'Accept',
          'X-Image-Cache': 'HIT',
        },
      })
    }
  } catch {
    // Disk read failed, fallback to live transform
  }

  // 2. Fetch remote source image
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'MyScore24-ImageOptimizer/1.0',
      },
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      return new NextResponse('Source image unavailable', { status: res.status })
    }

    const sourceBuffer = Buffer.from(await res.arrayBuffer())

    // 3. Process with sharp
    try {
      let pipeline = sharp(sourceBuffer).resize({
        width,
        fit: 'inside',
        withoutEnlargement: true,
      })

      let optimizedBuffer: Buffer
      if (isAvifSupported) {
        optimizedBuffer = await pipeline
          .avif({
            quality: Math.max(quality - 10, 50), // AVIF delivers higher fidelity at lower Q
            effort: 4,
          })
          .toBuffer()
      } else {
        optimizedBuffer = await pipeline
          .webp({
            quality,
            effort: 4,
          })
          .toBuffer()
      }

      try {
        ensureCacheDir()
        fs.writeFile(cachePath, optimizedBuffer, () => {})
      } catch {
        // Non-fatal cache write
      }

      return new NextResponse(new Uint8Array(optimizedBuffer), {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=2592000, immutable',
          'ETag': `"${hash}"`,
          'Vary': 'Accept',
          'X-Image-Cache': 'MISS',
        },
      })
    } catch (sharpErr) {
      console.warn('Sharp transformation failed, serving fallback:', sharpErr)
    }

    const rawContentType = res.headers.get('content-type') || 'image/png'
    return new NextResponse(new Uint8Array(sourceBuffer), {
      headers: {
        'Content-Type': rawContentType,
        'Cache-Control': 'public, max-age=2592000, immutable',
        'ETag': `"${hash}"`,
      },
    })
  } catch (err: any) {
    console.error('Image optimization failed for', targetUrl, err)
    return NextResponse.redirect(targetUrl, 302)
  }
}
