import fs from 'fs'
import path from 'path'

/**
 * Storage architecture for CMS uploads.
 * 
 * Ensures uploaded images survive:
 * - Server restarts
 * - Next.js rebuilds
 * - Hostinger Git deployments & git clean (via MySQL cms_media persistence)
 * - Cross-environment sync (Localhost & Production share MySQL)
 */

// Web-facing directory served directly by Next.js static asset server
export const PUBLIC_UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'news')

export function getContentTypeFromExt(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  switch (ext) {
    case '.jpg':
    case '.jpeg':
    case '.jfif':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.webp':
      return 'image/webp'
    case '.gif':
      return 'image/gif'
    case '.svg':
      return 'image/svg+xml'
    default:
      return 'application/octet-stream'
  }
}

// Candidate persistent storage directories outside the git deployment working tree
function getPersistentDirCandidates(): string[] {
  const candidates: string[] = []

  // 1. Explicit environment variable if configured in hosting environment
  if (process.env.CMS_STORAGE_DIR) {
    candidates.push(process.env.CMS_STORAGE_DIR)
  }

  // 2. One level above project root (e.g. /home/u875998119/myscore24_storage/news on Hostinger Linux)
  try {
    const parentDir = path.resolve(process.cwd(), '..', 'myscore24_storage', 'news')
    candidates.push(parentDir)
  } catch {
    // ignore
  }

  // 3. Dedicated project-level storage folder
  candidates.push(path.join(process.cwd(), 'storage', 'news'))

  return candidates
}

let resolvedPersistentDir: string | null = null

export function getPersistentStorageDir(): string {
  if (resolvedPersistentDir) {
    return resolvedPersistentDir
  }

  const candidates = getPersistentDirCandidates()

  for (const dir of candidates) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      // Test writability
      const testFile = path.join(dir, '.test-write')
      fs.writeFileSync(testFile, 'ok')
      fs.unlinkSync(testFile)

      resolvedPersistentDir = dir
      return dir
    } catch {
      // Continue to next candidate if directory creation / write is not permitted
      continue
    }
  }

  // Fallback to public uploads dir if no external persistent directory is writable
  resolvedPersistentDir = PUBLIC_UPLOADS_DIR
  return resolvedPersistentDir
}

export function ensureStorageDirs() {
  const persistentDir = getPersistentStorageDir()
  if (!fs.existsSync(persistentDir)) {
    try {
      fs.mkdirSync(persistentDir, { recursive: true })
    } catch {}
  }
  if (!fs.existsSync(PUBLIC_UPLOADS_DIR)) {
    try {
      fs.mkdirSync(PUBLIC_UPLOADS_DIR, { recursive: true })
    } catch {}
  }
}

/**
 * Saves uploaded file buffer to:
 * 1. Local public directory (for immediate 0ms static delivery)
 * 2. Persistent storage directories (if writable)
 * 3. MySQL `cms_media` table (permanent, survives Git clean & re-deployments)
 */
export async function saveUploadedFile(filename: string, buffer: Buffer): Promise<void> {
  const safeFilename = path.basename(filename)
  const contentType = getContentTypeFromExt(safeFilename)

  ensureStorageDirs()

  // 1. Write to local public uploads dir for direct static serving
  const publicPath = path.join(PUBLIC_UPLOADS_DIR, safeFilename)
  try {
    fs.writeFileSync(publicPath, buffer)
  } catch (err) {
    console.warn('[Storage] Could not write to public uploads copy:', err)
  }

  // 2. Write to persistent directory candidates
  const persistentDir = getPersistentStorageDir()
  const persistentPath = path.join(persistentDir, safeFilename)
  if (persistentPath !== publicPath) {
    try {
      fs.writeFileSync(persistentPath, buffer)
    } catch (err) {
      console.warn('[Storage] Could not write to persistent dir copy:', err)
    }
  }

  // 3. Save directly to MySQL cms_media table (guaranteed deployment persistence)
  try {
    const { prisma } = await import('@/lib/prisma')
    await prisma.$executeRawUnsafe(
      'INSERT INTO cms_media (filename, data, mime, size) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), mime = VALUES(mime), size = VALUES(size);',
      safeFilename,
      buffer,
      contentType,
      buffer.length
    )
  } catch (err) {
    console.error('[Storage] MySQL media save error:', err)
  }
}

/**
 * Checks whether a file exists in local cache, persistent storage, or MySQL.
 */
export async function hasUploadedFileAsync(filename: string): Promise<boolean> {
  const safeFilename = path.basename(filename)
  const publicPath = path.join(PUBLIC_UPLOADS_DIR, safeFilename)
  if (fs.existsSync(publicPath)) return true

  const persistentDir = getPersistentStorageDir()
  const persistentPath = path.join(persistentDir, safeFilename)
  if (fs.existsSync(persistentPath)) return true

  try {
    const { prisma } = await import('@/lib/prisma')
    const rows = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
      'SELECT COUNT(*) as count FROM cms_media WHERE filename = ?;',
      safeFilename
    )
    return Boolean(rows && rows[0] && Number(rows[0].count) > 0)
  } catch {
    return false
  }
}

export function hasUploadedFile(filename: string): boolean {
  const safeFilename = path.basename(filename)
  const publicPath = path.join(PUBLIC_UPLOADS_DIR, safeFilename)
  if (fs.existsSync(publicPath)) return true

  const persistentDir = getPersistentStorageDir()
  const persistentPath = path.join(persistentDir, safeFilename)
  return fs.existsSync(persistentPath)
}

/**
 * Asynchronously retrieves file buffer with multi-tier resilience:
 * Tier 1: Instant local disk cache check
 * Tier 2: MySQL `cms_media` table query (restores to disk cache if wiped)
 * Tier 3: External persistent directory fallback
 */
export async function getUploadedFileAsync(
  filename: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const safeFilename = path.basename(filename)
  const publicPath = path.join(PUBLIC_UPLOADS_DIR, safeFilename)

  // 1. Instant disk cache check
  if (fs.existsSync(publicPath)) {
    try {
      const buffer = fs.readFileSync(publicPath)
      return { buffer, contentType: getContentTypeFromExt(safeFilename) }
    } catch {}
  }

  // 2. Query MySQL cms_media table (survives Git clean / rebuilds / migrations)
  try {
    const { prisma } = await import('@/lib/prisma')
    const rows = await prisma.$queryRawUnsafe<Array<{ data: any; mime: string }>>(
      'SELECT data, mime FROM cms_media WHERE filename = ? LIMIT 1;',
      safeFilename
    )

    if (rows && rows.length > 0 && rows[0].data) {
      const raw = rows[0].data
      const buffer = Buffer.isBuffer(raw) ? raw : Buffer.from(raw)
      const contentType = rows[0].mime || getContentTypeFromExt(safeFilename)

      // Restore to local public directory for subsequent 0ms static delivery
      try {
        if (!fs.existsSync(PUBLIC_UPLOADS_DIR)) {
          fs.mkdirSync(PUBLIC_UPLOADS_DIR, { recursive: true })
        }
        fs.writeFileSync(publicPath, buffer)
      } catch (cacheErr) {
        // non-blocking
      }

      return { buffer, contentType }
    }
  } catch (dbErr) {
    console.warn('[Storage] MySQL media query error:', dbErr)
  }

  // 3. Check persistent directory candidates on disk (if any)
  const persistentDir = getPersistentStorageDir()
  const persistentPath = path.join(persistentDir, safeFilename)
  if (fs.existsSync(persistentPath)) {
    try {
      const buffer = fs.readFileSync(persistentPath)
      const contentType = getContentTypeFromExt(safeFilename)

      // Self-heal: restore to public cache AND backup into MySQL
      try {
        if (!fs.existsSync(PUBLIC_UPLOADS_DIR)) {
          fs.mkdirSync(PUBLIC_UPLOADS_DIR, { recursive: true })
        }
        fs.writeFileSync(publicPath, buffer)

        const { prisma } = await import('@/lib/prisma')
        await prisma.$executeRawUnsafe(
          'INSERT INTO cms_media (filename, data, mime, size) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), mime = VALUES(mime), size = VALUES(size);',
          safeFilename,
          buffer,
          contentType,
          buffer.length
        )
      } catch {}

      return { buffer, contentType }
    } catch (fsErr) {
      console.warn('[Storage] Disk read error:', fsErr)
    }
  }

  return null
}

/**
 * Synchronous disk-only fallback for backward compatibility
 */
export function getUploadedFile(filename: string): { buffer: Buffer; contentType: string } | null {
  const safeFilename = path.basename(filename)
  const publicPath = path.join(PUBLIC_UPLOADS_DIR, safeFilename)

  let buffer: Buffer | null = null

  if (fs.existsSync(publicPath)) {
    try {
      buffer = fs.readFileSync(publicPath)
    } catch {}
  }

  if (!buffer) {
    const persistentDir = getPersistentStorageDir()
    const persistentPath = path.join(persistentDir, safeFilename)

    if (fs.existsSync(persistentPath)) {
      try {
        buffer = fs.readFileSync(persistentPath)
      } catch {}
    }
  }

  if (!buffer) return null

  return { buffer, contentType: getContentTypeFromExt(safeFilename) }
}

/**
 * Deletes file from all storage locations and MySQL database.
 */
export async function deleteUploadedFile(filename: string): Promise<boolean> {
  const safeFilename = path.basename(filename)
  let deleted = false

  const publicPath = path.join(PUBLIC_UPLOADS_DIR, safeFilename)
  if (fs.existsSync(publicPath)) {
    try {
      fs.unlinkSync(publicPath)
      deleted = true
    } catch {}
  }

  const persistentDir = getPersistentStorageDir()
  const persistentPath = path.join(persistentDir, safeFilename)
  if (fs.existsSync(persistentPath)) {
    try {
      fs.unlinkSync(persistentPath)
      deleted = true
    } catch {}
  }

  // Also remove from MySQL cms_media
  try {
    const { prisma } = await import('@/lib/prisma')
    await prisma.$executeRawUnsafe('DELETE FROM cms_media WHERE filename = ?;', safeFilename)
    deleted = true
  } catch {}

  return deleted
}
