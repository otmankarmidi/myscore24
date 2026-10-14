import crypto from 'crypto'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export const FANTASY_COOKIE_NAME = 'myscore24_fantasy_session'
const SESSION_DURATION_SECONDS = 30 * 24 * 60 * 60 // 30 days

function getSecretKey(): string {
  return process.env.FANTASY_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || 'myscore24-fantasy-premier-league-salt-2026'
}

/**
 * Hash password using standard Node.js crypto scrypt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = crypto.scryptSync(password, salt, 64)
  return `${salt}:${derivedKey.toString('hex')}`
}

/**
 * Verify password against stored scrypt hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':')
    if (!salt || !key) return false
    const keyBuffer = Buffer.from(key, 'hex')
    const derivedKey = crypto.scryptSync(password, salt, 64)
    return crypto.timingSafeEqual(keyBuffer, derivedKey)
  } catch {
    return false
  }
}

/**
 * Creates signed session token: userId:expiresAt:signature
 */
export function createFantasySessionToken(userId: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS
  const payload = `${userId}:${expiresAt}`
  const signature = crypto
    .createHmac('sha256', getSecretKey())
    .update(payload)
    .digest('hex')
  return Buffer.from(`${payload}:${signature}`).toString('base64url')
}

/**
 * Verifies session token
 */
export function verifyFantasySessionToken(token: string | undefined | null): { valid: boolean; userId?: string } {
  if (!token) return { valid: false }

  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8')
    const parts = decoded.split(':')
    if (parts.length !== 3) return { valid: false }

    const [userId, expiresAtStr, signature] = parts
    const expiresAt = parseInt(expiresAtStr, 10)

    if (isNaN(expiresAt) || Math.floor(Date.now() / 1000) > expiresAt) {
      return { valid: false }
    }

    const payload = `${userId}:${expiresAtStr}`
    const expectedSignature = crypto
      .createHmac('sha256', getSecretKey())
      .update(payload)
      .digest('hex')

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(expectedSignature, 'utf8')
    )

    if (!isValid) return { valid: false }
    return { valid: true, userId }
  } catch {
    return { valid: false }
  }
}

/**
 * Cookie options for fantasy user session
 */
export function getFantasyCookieConfig() {
  return {
    name: FANTASY_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  }
}

/**
 * Retrieves authenticated fantasy user and their squad from current request cookies
 */
export async function getFantasySessionUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(FANTASY_COOKIE_NAME)?.value
    const verification = verifyFantasySessionToken(token)

    if (!verification.valid || !verification.userId) {
      return null
    }

    const user = await prisma.fantasyUser.findUnique({
      where: { id: verification.userId },
      select: {
        id: true,
        email: true,
        managerName: true,
        teamName: true,
        role: true,
        avatar: true,
        favoriteClubId: true,
        squad: {
          select: {
            id: true,
            teamName: true,
            bank: true,
            squadValue: true,
            freeTransfers: true,
            totalTransfers: true,
            totalPoints: true,
            overallRank: true,
            activeChip: true,
          },
        },
      },
    })

    return user
  } catch {
    return null
  }
}

/**
 * Extracts authenticated user ID from NextRequest
 */
export function getFantasyUserIdFromRequest(req: NextRequest): string | null {
  const token = req.cookies.get(FANTASY_COOKIE_NAME)?.value
  const { valid, userId } = verifyFantasySessionToken(token)
  return valid && userId ? userId : null
}
