import crypto from 'crypto'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export const ADMIN_COOKIE_NAME = 'myscore24_admin_session'
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60 // 7 days

function getSecretKey(): string {
  return process.env.ADMIN_SESSION_SECRET || 'myscore24-cms-super-secret-salt-2026'
}

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'myscore24admin2026!',
  }
}

export function createAdminSessionToken(username: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS
  const payload = `${username}:${expiresAt}`
  const signature = crypto
    .createHmac('sha256', getSecretKey())
    .update(payload)
    .digest('hex')
  return Buffer.from(`${payload}:${signature}`).toString('base64url')
}

export function verifyAdminSessionToken(token: string | undefined | null): { valid: boolean; username?: string } {
  if (!token) return { valid: false }

  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8')
    const parts = decoded.split(':')
    if (parts.length !== 3) return { valid: false }

    const [username, expiresAtStr, signature] = parts
    const expiresAt = parseInt(expiresAtStr, 10)

    if (isNaN(expiresAt) || Math.floor(Date.now() / 1000) > expiresAt) {
      return { valid: false }
    }

    const payload = `${username}:${expiresAtStr}`
    const expectedSignature = crypto
      .createHmac('sha256', getSecretKey())
      .update(payload)
      .digest('hex')

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(expectedSignature, 'utf8')
    )

    if (!isValid) return { valid: false }

    return { valid: true, username }
  } catch {
    return { valid: false }
  }
}

export async function isServerAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value
  return verifyAdminSessionToken(token).valid
}

export function isRequestAdminAuthenticated(req: NextRequest): boolean {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value
  return verifyAdminSessionToken(token).valid
}

export function getAdminCookieConfig() {
  return {
    name: ADMIN_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  }
}
