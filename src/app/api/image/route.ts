import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

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
  'myscore24.com',
  'www.myscore24.com',
  'localhost',
]

function isHostAllowed(hostname: string): boolean {
  return (
    ALLOWED_HOSTS.includes(hostname.toLowerCase()) ||
    hostname.endsWith('.api-sports.io') ||
    hostname.endsWith('.wikimedia.org')
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

  // Generate cache key
  const hash = crypto
    .createHash('sha256')
    .update(`${targetUrl}_w${width}_q${quality}`)
    .digest('hex')
  const cachePath = path.join(CACHE_DIR, `${hash}.webp`)

  // 1. Check disk cache
  try {
    if (fs.existsSync(cachePath)) {
      const cachedBuffer = fs.readFileSync(cachePath)
      return new NextResponse(cachedBuffer, {
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=2592000, immutable',
          'ETag': `"${hash}"`,
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
    const webpBuffer = await sharp(sourceBuffer)
      .resize({
        width,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality,
        effort: 4,
      })
      .toBuffer()

    // 4. Save to disk cache asynchronously
    try {
      ensureCacheDir()
      fs.writeFile(cachePath, webpBuffer, () => {})
    } catch {
      // Non-fatal
    }

    return new NextResponse(webpBuffer, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=2592000, immutable',
        'ETag': `"${hash}"`,
        'X-Image-Cache': 'MISS',
      },
    })
  } catch (err: any) {
    console.error('Image optimization failed for', targetUrl, err)
    // Redirect to original URL if transformation fails
    return NextResponse.redirect(targetUrl, 302)
  }
}
