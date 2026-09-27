import fs from 'fs'
import path from 'path'

/**
 * Storage architecture for CMS uploads.
 * 
 * Ensures uploaded images survive:
 * - Server restarts
 * - Next.js rebuilds
 * - Hostinger Git deployments & git clean
 * - Application updates
 */

// Web-facing directory served directly by Next.js static asset server
export const PUBLIC_UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'news')

// Candidate persistent storage directories outside the git deployment working tree
function getPersistentDirCandidates(): string[] {
  const candidates: string[] = []

  // 1. Explicit environment variable if configured in hosting environment
  if (process.env.CMS_STORAGE_DIR) {
    candidates.push(process.env.CMS_STORAGE_DIR)
  }

  // 2. One level above project root (e.g. /home/u875998119/myscore24_storage/news on Hostinger Linux)
  // This directory is outside the git repository and NEVER touched by git clean / pull.
  try {
    const parentDir = path.resolve(process.cwd(), '..', 'myscore24_storage', 'news')
    candidates.push(parentDir)
  } catch {
    // ignore
  }

  // 3. Fallback dedicated project-level storage folder (ignored by git in .gitignore)
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
    fs.mkdirSync(persistentDir, { recursive: true })
  }
  if (!fs.existsSync(PUBLIC_UPLOADS_DIR)) {
    fs.mkdirSync(PUBLIC_UPLOADS_DIR, { recursive: true })
  }
}

/**
 * Saves uploaded file buffer to BOTH persistent storage and public directory.
 */
export async function saveUploadedFile(filename: string, buffer: Buffer): Promise<void> {
  ensureStorageDirs()

  const persistentDir = getPersistentStorageDir()
  const persistentPath = path.join(persistentDir, filename)
  fs.writeFileSync(persistentPath, buffer)

  // Also write to public/uploads/news for direct 0ms static serving
  const publicPath = path.join(PUBLIC_UPLOADS_DIR, filename)
  if (persistentPath !== publicPath) {
    try {
      fs.writeFileSync(publicPath, buffer)
    } catch (err) {
      console.warn('[Storage] Could not write to public uploads copy:', err)
    }
  }
}

/**
 * Checks whether a file exists in either public uploads or persistent storage.
 */
export function hasUploadedFile(filename: string): boolean {
  const publicPath = path.join(PUBLIC_UPLOADS_DIR, filename)
  if (fs.existsSync(publicPath)) return true

  const persistentDir = getPersistentStorageDir()
  const persistentPath = path.join(persistentDir, filename)
  return fs.existsSync(persistentPath)
}

/**
 * Retrieves file buffer. If file exists in persistent storage but was deleted from
 * public/uploads/news (e.g. after a git deployment or clean), automatically restores it.
 */
export function getUploadedFile(filename: string): { buffer: Buffer; contentType: string } | null {
  const safeFilename = path.basename(filename)
  const publicPath = path.join(PUBLIC_UPLOADS_DIR, safeFilename)

  let buffer: Buffer | null = null

  if (fs.existsSync(publicPath)) {
    try {
      buffer = fs.readFileSync(publicPath)
    } catch {
      // fallback to persistent
    }
  }

  if (!buffer) {
    const persistentDir = getPersistentStorageDir()
    const persistentPath = path.join(persistentDir, safeFilename)

    if (fs.existsSync(persistentPath)) {
      try {
        buffer = fs.readFileSync(persistentPath)

        // Self-healing: restore to public/uploads/news for future static serving
        try {
          if (!fs.existsSync(PUBLIC_UPLOADS_DIR)) {
            fs.mkdirSync(PUBLIC_UPLOADS_DIR, { recursive: true })
          }
          fs.writeFileSync(publicPath, buffer)
        } catch {
          // ignore cache write error
        }
      } catch (err) {
        console.error('[Storage] Error reading persistent file:', err)
      }
    }
  }

  if (!buffer) return null

  const ext = path.extname(safeFilename).toLowerCase()
  let contentType = 'application/octet-stream'
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      contentType = 'image/jpeg'
      break
    case '.png':
      contentType = 'image/png'
      break
    case '.webp':
      contentType = 'image/webp'
      break
    case '.gif':
      contentType = 'image/gif'
      break
    case '.svg':
      contentType = 'image/svg+xml'
      break
    case '.jfif':
      contentType = 'image/jpeg'
      break
  }

  return { buffer, contentType }
}

/**
 * Deletes file from all storage locations.
 */
export function deleteUploadedFile(filename: string): boolean {
  const safeFilename = path.basename(filename)
  let deleted = false

  const publicPath = path.join(PUBLIC_UPLOADS_DIR, safeFilename)
  if (fs.existsSync(publicPath)) {
    try {
      fs.unlinkSync(publicPath)
      deleted = true
    } catch {
      // ignore
    }
  }

  const persistentDir = getPersistentStorageDir()
  const persistentPath = path.join(persistentDir, safeFilename)
  if (fs.existsSync(persistentPath)) {
    try {
      fs.unlinkSync(persistentPath)
      deleted = true
    } catch {
      // ignore
    }
  }

  return deleted
}
